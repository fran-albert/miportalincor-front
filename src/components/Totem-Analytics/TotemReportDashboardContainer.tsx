import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Database, Download, Info, Ticket } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/Appointments-Analytics/DateRangeFilter";
import {
  CHART_AXIS_COLOR,
  CHART_COLORS,
  CHART_GRID_COLOR,
  formatNumber,
} from "@/components/Appointments-Analytics/chartTheme";
import { ChartTooltip } from "@/components/Appointments-Analytics/ChartTooltip";
import { TotemActivitySummary } from "./TotemActivitySummary";
import { UnregisteredResolutionFunnel } from "./UnregisteredResolutionFunnel";
import {
  useTotemAnalyticsReport,
  useTotemPatientRegistrationStats,
} from "@/hooks/Totem-Analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TotemReportDashboardContainerProps {
  showHeader?: boolean;
}

const TOTEM_OPERATION_START_DATE = "2026-04-06";
const TOTEM_OPERATION_START_LABEL = "6 abr 2026";

const todayDateString = () => format(new Date(), "yyyy-MM-dd");

// Normaliza cualquier fecha a YYYY-MM-DD para que los cruces por fecha entre
// fuentes distintas (turnos, cola, historia clínica) hagan match aunque una
// venga con hora/ISO completo.
const dayKey = (date: string) => date.slice(0, 10);

const parseTotemDate = (date: string) => new Date(`${dayKey(date)}T00:00:00`);

const isSundayDateString = (date: string) => parseTotemDate(date).getDay() === 0;

const sumBy = <T,>(items: T[], getValue: (item: T) => number) =>
  items.reduce((total, item) => total + getValue(item), 0);

interface DailyTotalItem {
  date: string;
  total: number;
}

const sumDailyWithoutSunday = (items?: DailyTotalItem[]) =>
  (items ?? [])
    .filter((item) => !isSundayDateString(item.date))
    .reduce((total, item) => total + item.total, 0);

const toDayKeyMap = (items?: DailyTotalItem[]) =>
  new Map((items ?? []).map((item) => [dayKey(item.date), item.total]));

const maxDateString = (first: string, second: string) =>
  first > second ? first : second;

const escapeCsvValue = (value: string | number) =>
  `"${String(value).replace(/"/g, '""')}"`;

function ColumnHint({ label, hint }: { label: string; hint: string }) {
  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help items-center justify-end gap-1 underline decoration-dotted decoration-muted-foreground/40 underline-offset-4">
          {label}
          <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
        {hint}
      </TooltipContent>
    </UITooltip>
  );
}

export function TotemReportDashboardContainer({
  showHeader = true,
}: TotemReportDashboardContainerProps) {
  const [dateFrom, setDateFrom] = useState(TOTEM_OPERATION_START_DATE);
  const [dateTo, setDateTo] = useState(todayDateString);

  const reportQuery = useTotemAnalyticsReport({ dateFrom, dateTo });
  const patientRegistrationsQuery = useTotemPatientRegistrationStats({
    dateFrom,
    dateTo,
  });

  const handleRangeChange = (nextFrom: string, nextTo: string) => {
    const normalizedFrom = maxDateString(nextFrom, TOTEM_OPERATION_START_DATE);
    const normalizedTo = maxDateString(nextTo, TOTEM_OPERATION_START_DATE);

    if (normalizedFrom > normalizedTo) {
      setDateFrom(normalizedTo);
      setDateTo(normalizedTo);
      return;
    }

    setDateFrom(normalizedFrom);
    setDateTo(normalizedTo);
  };

  const handleInstallToToday = () => {
    setDateFrom(TOTEM_OPERATION_START_DATE);
    setDateTo(todayDateString());
  };

  const visibleDailyItems = useMemo(
    () =>
      reportQuery.data?.daily.filter((item) => !isSundayDateString(item.date)) ??
      [],
    [reportQuery.data]
  );

  const visibleRegistrationDailyItems = useMemo(
    () =>
      patientRegistrationsQuery.data?.daily.filter(
        (item) => !isSundayDateString(item.date)
      ) ?? [],
    [patientRegistrationsQuery.data]
  );

  const visibleOverview = useMemo(
    () => ({
      totalTickets: sumBy(visibleDailyItems, (item) => item.totalTickets),
      scheduled: sumBy(visibleDailyItems, (item) => item.scheduled),
      invited: sumBy(visibleDailyItems, (item) => item.invited),
      administrative: sumBy(visibleDailyItems, (item) => item.administrative),
      unregistered: sumBy(visibleDailyItems, (item) => item.unregistered),
    }),
    [visibleDailyItems]
  );

  // Embudo de no registrados: todo recalculado sobre los días visibles (sin
  // domingos) para que detectados/resueltos/pendientes/tasa cierren entre sí.
  const unregisteredFunnel = useMemo(() => {
    const summary = reportQuery.data?.unregistered;
    const detected = sumDailyWithoutSunday(summary?.dailyDetected);
    const resolved = sumDailyWithoutSunday(summary?.dailyResolved);
    const createdNew = sumDailyWithoutSunday(summary?.dailyCreated);
    const linkedExisting = sumDailyWithoutSunday(summary?.dailyLinkedExisting);
    const pending = Math.max(0, detected - resolved);
    const resolutionRate = detected
      ? Math.round((resolved / detected) * 100)
      : 0;
    return { detected, resolved, createdNew, linkedExisting, pending, resolutionRate };
  }, [reportQuery.data]);

  const dailyResolvedMap = useMemo(
    () => toDayKeyMap(reportQuery.data?.unregistered.dailyResolved),
    [reportQuery.data]
  );

  const dailyRealUsersCreatedMap = useMemo(
    () =>
      new Map(
        patientRegistrationsQuery.data?.daily.map((item) => [
          dayKey(item.date),
          item.usersCreated,
        ]) ?? []
      ),
    [patientRegistrationsQuery.data]
  );

  const dailyTotemCreatedMap = useMemo(
    () => toDayKeyMap(reportQuery.data?.registrations?.dailyCreated),
    [reportQuery.data]
  );

  const dailyTotemLinkedExistingMap = useMemo(
    () => toDayKeyMap(reportQuery.data?.registrations?.dailyLinkedExisting),
    [reportQuery.data]
  );

  const visibleNewPatientsTotal = useMemo(
    () => sumBy(visibleRegistrationDailyItems, (item) => item.usersCreated),
    [visibleRegistrationDailyItems]
  );

  const visiblePatientProfilesTotal = useMemo(
    () => sumBy(visibleRegistrationDailyItems, (item) => item.patientsCreated),
    [visibleRegistrationDailyItems]
  );

  const registrationTrendData = useMemo(
    () =>
      visibleRegistrationDailyItems.map((item) => ({
        label: format(parseTotemDate(item.date), "d MMM", { locale: es }),
        usersCreated: item.usersCreated,
        patientsCreated: item.patientsCreated,
        trazadosTotem: dailyTotemCreatedMap.get(dayKey(item.date)) ?? 0,
      })),
    [dailyTotemCreatedMap, visibleRegistrationDailyItems]
  );

  const ticketTrendData = useMemo(
    () =>
      visibleDailyItems.map((item) => ({
        ...item,
        label: format(parseTotemDate(item.date), "d MMM", { locale: es }),
      })),
    [visibleDailyItems]
  );

  const isFullRange =
    dateFrom === TOTEM_OPERATION_START_DATE && dateTo === todayDateString();

  const handleExportCsv = () => {
    if (!reportQuery.data) {
      return;
    }

    const csvRows: Array<Array<string | number>> = [
      ["Reporte Totem"],
      ["Desde", dateFrom, "Hasta", dateTo],
      [],
      ["Resumen"],
      ["Tickets Totem", visibleOverview.totalTickets],
      ["Con turno", visibleOverview.scheduled],
      ["Invitados", visibleOverview.invited],
      ["Trámite administrativo", visibleOverview.administrative],
      ["DNI no encontrado", visibleOverview.unregistered],
      ["Resueltos", unregisteredFunnel.resolved],
      ["Pendientes", unregisteredFunnel.pending],
      ["Nuevos pacientes", unregisteredFunnel.createdNew],
      ["Vinculados a paciente existente", unregisteredFunnel.linkedExisting],
      [
        "Altas nuevas en sistema",
        patientRegistrationsQuery.data ? visibleNewPatientsTotal : "Sin dato",
      ],
      [
        "Fichas de paciente creadas",
        patientRegistrationsQuery.data ? visiblePatientProfilesTotal : "Sin dato",
      ],
      [],
      ["Detalle diario"],
      [
        "Fecha",
        "Total",
        "Con turno",
        "Invitados",
        "Administrativo",
        "DNI no encontrado",
        "Resueltos",
        "Altas sistema",
        "Trazadas Totem",
        "Vinculados Totem",
      ],
      ...visibleDailyItems.map((item) => {
        const key = dayKey(item.date);
        return [
          item.date,
          item.totalTickets,
          item.scheduled,
          item.invited,
          item.administrative,
          item.unregistered,
          dailyResolvedMap.get(key) ?? 0,
          dailyRealUsersCreatedMap.get(key) ?? 0,
          dailyTotemCreatedMap.get(key) ?? 0,
          dailyTotemLinkedExistingMap.get(key) ?? 0,
        ];
      }),
    ];

    const csvContent = csvRows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-totem-${dateFrom}-${dateTo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const newPatientsValue: number | string = patientRegistrationsQuery.isLoading
    ? "…"
    : patientRegistrationsQuery.data
      ? visibleNewPatientsTotal
      : "Sin dato";

  return (
    <div className={`space-y-7 ${showHeader ? "p-6" : ""}`}>
      {showHeader && (
        <PageHeader
          breadcrumbItems={[
            { label: "Inicio", href: "/inicio" },
            { label: "Reportes de Turnos" },
            { label: "Totem" },
          ]}
          title="Reporte Totem"
          description="Seguimiento diario de tickets del tótem y resolución de pacientes no registrados."
          icon={<Ticket className="h-6 w-6" />}
        />
      )}

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Período
            </label>
            <DateRangeFilter
              from={dateFrom}
              to={dateTo}
              minDate={TOTEM_OPERATION_START_DATE}
              maxDate={todayDateString()}
              onRangeChange={handleRangeChange}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleInstallToToday}
            >
              Desde la instalación
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={!reportQuery.data}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <Badge variant="secondary">
            {format(parseTotemDate(dateFrom), "d MMM yyyy", { locale: es })} —{" "}
            {format(parseTotemDate(dateTo), "d MMM yyyy", { locale: es })}
          </Badge>
          <span className="text-xs text-muted-foreground">
            El tótem opera desde el {TOTEM_OPERATION_START_LABEL}. No se muestran
            los domingos.
          </span>
        </div>
      </div>

      <TotemActivitySummary
        totalTickets={visibleOverview.totalTickets}
        scheduled={visibleOverview.scheduled}
        invited={visibleOverview.invited}
        administrative={visibleOverview.administrative}
        unregistered={visibleOverview.unregistered}
        isLoading={reportQuery.isLoading}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <UnregisteredResolutionFunnel
          detected={unregisteredFunnel.detected}
          resolved={unregisteredFunnel.resolved}
          createdNew={unregisteredFunnel.createdNew}
          linkedExisting={unregisteredFunnel.linkedExisting}
          pending={unregisteredFunnel.pending}
          resolutionRate={unregisteredFunnel.resolutionRate}
          isLoading={reportQuery.isLoading}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Altas de pacientes</CardTitle>
            <CardDescription>
              {isFullRange
                ? "Pacientes dados de alta desde la instalación."
                : "Pacientes dados de alta en el período."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Pacientes nuevos registrados
                </p>
                <p className="text-3xl font-bold leading-none">
                  {typeof newPatientsValue === "number"
                    ? formatNumber(newPatientsValue)
                    : newPatientsValue}
                </p>
              </div>
            </div>
            {patientRegistrationsQuery.isError ? (
              <p className="text-xs text-muted-foreground">
                No se pudo consultar el dato de altas en este momento.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Fichas de paciente creadas:{" "}
                {patientRegistrationsQuery.data
                  ? formatNumber(visiblePatientProfilesTotal)
                  : "—"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Altas de pacientes por día</CardTitle>
            <CardDescription>
              Pacientes nuevos registrados en el sistema por día.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {patientRegistrationsQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : patientRegistrationsQuery.isError ? (
              <div className="flex h-full items-center justify-center px-8 text-center text-sm text-muted-foreground">
                No se pudo consultar el dato de altas.
              </div>
            ) : !registrationTrendData.length ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin altas nuevas para el período seleccionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={registrationTrendData}
                  margin={{ top: 10, right: 16, left: -18, bottom: 12 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={CHART_GRID_COLOR}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
                    tickLine={false}
                    axisLine={{ stroke: CHART_GRID_COLOR }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="usersCreated"
                    name="Altas en sistema"
                    stroke={CHART_COLORS.green}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="patientsCreated"
                    name="Fichas de paciente"
                    stroke={CHART_COLORS.blue}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="trazadosTotem"
                    name="Altas vía tótem"
                    stroke={CHART_COLORS.orange}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tickets del tótem por día</CardTitle>
            <CardDescription>
              Volumen diario de tickets según su tipo.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {reportQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !ticketTrendData.length ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin tickets para el período seleccionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ticketTrendData}
                  margin={{ top: 10, right: 16, left: -18, bottom: 12 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={CHART_GRID_COLOR}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
                    tickLine={false}
                    axisLine={{ stroke: CHART_GRID_COLOR }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="totalTickets"
                    name="Tickets"
                    stroke="#0F172A"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="scheduled"
                    name="Con turno"
                    stroke={CHART_COLORS.green}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="invited"
                    name="Invitados"
                    stroke={CHART_COLORS.blue}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="administrative"
                    name="Administrativo"
                    stroke="#64748B"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="unregistered"
                    name="DNI no encontrado"
                    stroke={CHART_COLORS.orange}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalle diario del tótem</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {reportQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !visibleDailyItems.length ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Sin tickets del tótem para el período seleccionado.
            </div>
          ) : (
            <TooltipProvider delayDuration={150}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Con turno</TableHead>
                    <TableHead className="text-right">Invitados</TableHead>
                    <TableHead className="text-right">Administrativo</TableHead>
                    <TableHead className="text-right">
                      <ColumnHint
                        label="DNI no encontrado"
                        hint="Tickets en los que el tótem no encontró el DNI en el sistema."
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <ColumnHint
                        label="Resueltos"
                        hint="De los DNI no encontrado, cuántos quedaron resueltos ese día (alta de paciente nuevo o vinculación a uno existente)."
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <ColumnHint
                        label="Altas sistema"
                        hint="Pacientes nuevos dados de alta en el sistema ese día (fuente Historia Clínica)."
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <ColumnHint
                        label="Trazadas Totem"
                        hint="Pacientes nuevos creados a través del tótem ese día."
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <ColumnHint
                        label="Vinculados Totem"
                        hint="Tickets del tótem que ese día se asociaron a un paciente que YA existía en el sistema, en lugar de crear uno nuevo."
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDailyItems.map((item) => {
                    const key = dayKey(item.date);
                    return (
                      <TableRow key={item.date}>
                        <TableCell className="font-medium capitalize">
                          {format(parseTotemDate(item.date), "EEE d MMM", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(item.totalTickets)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(item.scheduled)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(item.invited)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(item.administrative)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(item.unregistered)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(dailyResolvedMap.get(key) ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(dailyRealUsersCreatedMap.get(key) ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(dailyTotemCreatedMap.get(key) ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(
                            dailyTotemLinkedExistingMap.get(key) ?? 0
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 space-y-1 border-t pt-3 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">
                  Trazadas Totem:
                </span>{" "}
                pacientes nuevos creados desde el tótem.
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Vinculados Totem:
                </span>{" "}
                el tótem reconoció a un paciente que ya estaba cargado (no se creó
                uno nuevo).
              </p>
            </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
