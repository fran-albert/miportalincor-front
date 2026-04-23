import { useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ClipboardList,
  Database,
  Download,
  Ticket,
  UserCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/Appointments-Analytics/DateRangeFilter";
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

interface TotemMetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
}

const numberFormatter = new Intl.NumberFormat("es-AR");
const TOTEM_OPERATION_START_DATE = "2026-04-06";
const TOTEM_OPERATION_START_LABEL = "6 abr 2026";

const todayDateString = () => format(new Date(), "yyyy-MM-dd");

const isSundayDateString = (date: string) =>
  new Date(`${date}T00:00:00`).getDay() === 0;

const sumBy = <T,>(items: T[], getValue: (item: T) => number) =>
  items.reduce((total, item) => total + getValue(item), 0);

const maxDateString = (first: string, second: string) =>
  first > second ? first : second;

const escapeCsvValue = (value: string | number) =>
  `"${String(value).replace(/"/g, '""')}"`;

const TotemMetricCard = ({
  title,
  value,
  description,
  icon,
}: TotemMetricCardProps) => (
  <Card className="overflow-hidden border-border/70">
    <CardContent className="flex items-start justify-between gap-4 p-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-semibold tracking-tight">
          {typeof value === "number" ? numberFormatter.format(value) : value}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
    </CardContent>
  </Card>
);

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

  const dailyResolvedMap = useMemo(
    () =>
      new Map(
        reportQuery.data?.unregistered.dailyResolved?.map((item) => [
          item.date,
          item.total,
        ]) ?? []
      ),
    [reportQuery.data]
  );

  const dailyCreatedMap = useMemo(
    () =>
      new Map(
        reportQuery.data?.unregistered.dailyCreated?.map((item) => [
          item.date,
          item.total,
        ]) ?? []
      ),
    [reportQuery.data]
  );

  const dailyLinkedExistingMap = useMemo(
    () =>
      new Map(
        reportQuery.data?.unregistered.dailyLinkedExisting?.map((item) => [
          item.date,
          item.total,
        ]) ?? []
      ),
    [reportQuery.data]
  );

  const dailyTotemCreatedMap = useMemo(
    () =>
      new Map(
        reportQuery.data?.registrations?.dailyCreated?.map((item) => [
          item.date,
          item.total,
        ]) ?? []
      ),
    [reportQuery.data]
  );

  const dailyTotemLinkedExistingMap = useMemo(
    () =>
      new Map(
        reportQuery.data?.registrations?.dailyLinkedExisting?.map((item) => [
          item.date,
          item.total,
        ]) ?? []
      ),
    [reportQuery.data]
  );

  const dailyRealUsersCreatedMap = useMemo(
    () =>
      new Map(
        patientRegistrationsQuery.data?.daily.map((item) => [
          item.date,
          item.usersCreated,
        ]) ?? []
      ),
    [patientRegistrationsQuery.data]
  );

  const dailyPatientProfilesCreatedMap = useMemo(
    () =>
      new Map(
        patientRegistrationsQuery.data?.daily.map((item) => [
          item.date,
          item.patientsCreated,
        ]) ?? []
      ),
    [patientRegistrationsQuery.data]
  );

  const visibleRealRegistrationsTotal = useMemo(
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
        ...item,
        label: format(new Date(`${item.date}T00:00:00`), "d MMM", {
          locale: es,
        }),
        trazadosTotem: dailyTotemCreatedMap.get(item.date) ?? 0,
      })),
    [dailyTotemCreatedMap, visibleRegistrationDailyItems]
  );

  const ticketTrendData = useMemo(
    () =>
      visibleDailyItems.map((item) => ({
        ...item,
        label: format(new Date(`${item.date}T00:00:00`), "d MMM", {
          locale: es,
        }),
      })),
    [visibleDailyItems]
  );

  const visibleResolvedTicketsTotal = useMemo(
    () => sumBy(visibleDailyItems, (item) => dailyResolvedMap.get(item.date) ?? 0),
    [dailyResolvedMap, visibleDailyItems]
  );

  const visibleTotemCreatedTotal = useMemo(
    () =>
      sumBy(visibleDailyItems, (item) => dailyTotemCreatedMap.get(item.date) ?? 0),
    [dailyTotemCreatedMap, visibleDailyItems]
  );

  const realRegistrationsValue: number | string =
    patientRegistrationsQuery.isLoading
      ? "..."
      : patientRegistrationsQuery.data
        ? visibleRealRegistrationsTotal
        : "Sin dato";

  const realRegistrationsDescription = patientRegistrationsQuery.data
    ? `Fuente users.createdAt. Fichas paciente: ${numberFormatter.format(
        visiblePatientProfilesTotal
      )}.`
    : patientRegistrationsQuery.isError
      ? "No se pudo consultar Historia Clínica; no usa el conteo técnico del Totem."
      : "Altas reales del sistema asociadas al circuito operativo del Totem.";

  const cards = reportQuery.data
    ? [
        {
          title: "Tickets Totem",
          value: visibleOverview.totalTickets,
          description:
            dateFrom === TOTEM_OPERATION_START_DATE && dateTo === todayDateString()
              ? "Total desde instalación hasta hoy, sin domingos en detalle."
              : "Interacciones iniciadas desde el tótem en el rango visible.",
          icon: <Ticket className="h-5 w-5" />,
        },
        {
          title: "Con turno",
          value: visibleOverview.scheduled,
          description: "Pacientes registrados con turno previo.",
          icon: <UserCheck className="h-5 w-5" />,
        },
        {
          title: "Invitados",
          value: visibleOverview.invited,
          description: "Turnos de invitados que hicieron check-in en tótem.",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Trámite administrativo",
          value: visibleOverview.administrative,
          description: "Tickets administrativos originados en el tótem.",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          title: "DNI no encontrado",
          value: visibleOverview.unregistered,
          description: "Casos detectados por el tótem fuera del sistema.",
          icon: <UserRoundPlus className="h-5 w-5" />,
        },
        {
          title: "No registrados resueltos",
          value: visibleResolvedTicketsTotal,
          description: "Tickets del rango que ya quedaron vinculados o dados de alta.",
          icon: <UserCheck className="h-5 w-5" />,
        },
        {
          title: "No registrados pendientes",
          value: reportQuery.data.unregistered.pendingTickets,
          description: "Tickets del rango que todavía siguen sin resolución.",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          title: "Altas nuevas en sistema",
          value: realRegistrationsValue,
          description: realRegistrationsDescription,
          icon: <Database className="h-5 w-5" />,
        },
        {
          title: "Altas trazadas por Totem",
          value: visibleTotemCreatedTotal,
          description: "Conteo técnico de cola; no es la fuente del KPI principal.",
          icon: <UserRoundPlus className="h-5 w-5" />,
        },
      ]
    : [];

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
      ["No registrados resueltos", visibleResolvedTicketsTotal],
      ["No registrados pendientes", reportQuery.data.unregistered.pendingTickets],
      [
        "Altas nuevas en sistema",
        patientRegistrationsQuery.data ? visibleRealRegistrationsTotal : "Sin dato",
      ],
      [
        "Fichas pacientes creadas",
        patientRegistrationsQuery.data ? visiblePatientProfilesTotal : "Sin dato",
      ],
      [
        "Altas trazadas por Totem",
        visibleTotemCreatedTotal,
      ],
      [],
      ["Detalle diario"],
      [
        "Fecha",
        "Tickets Totem",
        "Con turno",
        "Invitados",
        "Trámite administrativo",
        "DNI no encontrado",
        "Resueltos ese día",
        "Altas reales sistema ese día",
        "Fichas pacientes ese día",
        "Altas trazadas Totem ese día",
        "Vinculados Totem ese día",
      ],
      ...visibleDailyItems.map((item) => [
        item.date,
        item.totalTickets,
        item.scheduled,
        item.invited,
        item.administrative,
        item.unregistered,
        dailyResolvedMap.get(item.date) ?? 0,
        dailyRealUsersCreatedMap.get(item.date) ?? 0,
        dailyPatientProfilesCreatedMap.get(item.date) ?? 0,
        dailyTotemCreatedMap.get(item.date) ?? 0,
        dailyTotemLinkedExistingMap.get(item.date) ?? 0,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-totem-${dateFrom}-${dateTo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-8 ${showHeader ? "p-6" : ""}`}>
      {showHeader && (
        <PageHeader
          breadcrumbItems={[
            { label: "Inicio", href: "/inicio" },
            { label: "Reportes de Turnos" },
            { label: "Totem" },
          ]}
          title="Reporte Totem"
          description="Seguimiento diario de tickets iniciados en el tótem y resolución de pacientes no registrados."
          icon={<Ticket className="h-6 w-6" />}
        />
      )}

      <div className="flex flex-col gap-5 rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white shadow-sm md:p-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Filtros del reporte Totem</h2>
            <p className="max-w-3xl text-sm text-slate-200">
              Operativo desde {TOTEM_OPERATION_START_LABEL}. Las altas reales se
              leen desde Historia Clínica (`users.createdAt`) porque hoy todo
              ingreso pasa por el circuito Totem. Los domingos se ocultan del
              detalle y exportación.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full bg-white text-slate-950 hover:bg-slate-100 xl:w-auto"
              onClick={handleInstallToToday}
            >
              Desde instalación hasta hoy
            </Button>
            <div className="[&_button]:border-white/20 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20">
              <DateRangeFilter
                from={dateFrom}
                to={dateTo}
                minDate={TOTEM_OPERATION_START_DATE}
                maxDate={todayDateString()}
                onRangeChange={handleRangeChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white text-slate-950 hover:bg-white">
              Base Totem: ticket iniciado
            </Badge>
            <Badge className="border-white/30 bg-white/10 text-white hover:bg-white/10">
              Altas reales: users.createdAt
            </Badge>
            <Badge className="border-white/30 bg-white/10 text-white hover:bg-white/10">
              {format(new Date(`${dateFrom}T00:00:00`), "d MMM yyyy", {
                locale: es,
              })}{" "}
              -{" "}
              {format(new Date(`${dateTo}T00:00:00`), "d MMM yyyy", {
                locale: es,
              })}
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-white/25 bg-transparent text-white hover:bg-white hover:text-slate-950 md:w-auto"
            onClick={handleExportCsv}
            disabled={!reportQuery.data}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {reportQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <TotemMetricCard key={card.title} {...card} />
          ))}
        </div>
      )}

      <div className="grid gap-7 xl:grid-cols-2">
        <Card className="overflow-hidden border-emerald-100/80 bg-gradient-to-br from-emerald-50 via-white to-slate-50">
          <CardHeader>
            <CardTitle>Tendencia de altas reales</CardTitle>
            <CardDescription>
              Alta en sistema por día operativo; fuente principal: users.createdAt.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {patientRegistrationsQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : patientRegistrationsQuery.isError ? (
              <div className="flex h-full items-center justify-center px-8 text-center text-sm text-muted-foreground">
                No se pudo consultar Historia Clínica para graficar altas reales.
              </div>
            ) : !registrationTrendData.length ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin altas nuevas para el rango seleccionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={registrationTrendData}
                  margin={{ top: 10, right: 16, left: -18, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={32} />
                  <Line
                    type="monotone"
                    dataKey="usersCreated"
                    name="Altas sistema"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="patientsCreated"
                    name="Fichas paciente"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="trazadosTotem"
                    name="Trazadas por Totem"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Tendencia de tickets Totem</CardTitle>
            <CardDescription>
              Volumen diario por origen para comparar demanda contra altas nuevas.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {reportQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !ticketTrendData.length ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin tickets para el rango seleccionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ticketTrendData}
                  margin={{ top: 10, right: 16, left: -18, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={32} />
                  <Line
                    type="monotone"
                    dataKey="totalTickets"
                    name="Tickets"
                    stroke="#0F172A"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scheduled"
                    name="Con turno"
                    stroke="#16A34A"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="invited"
                    name="Invitados"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="administrative"
                    name="Administrativo"
                    stroke="#64748B"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unregistered"
                    name="DNI no encontrado"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.6fr,1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Detalle diario del Totem</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!visibleDailyItems.length ? (
              <div className="text-sm text-muted-foreground">
                Sin tickets del tótem para el rango seleccionado.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Con turno</TableHead>
                    <TableHead className="text-right">Invitados</TableHead>
                    <TableHead className="text-right">Administrativo</TableHead>
                    <TableHead className="text-right">DNI no encontrado</TableHead>
                    <TableHead className="text-right">Resueltos</TableHead>
                    <TableHead className="text-right">Altas sistema</TableHead>
                    <TableHead className="text-right">Trazadas Totem</TableHead>
                    <TableHead className="text-right">Vinculados Totem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDailyItems.map((item) => (
                    <TableRow key={item.date}>
                      <TableCell className="font-medium">
                        {format(new Date(`${item.date}T00:00:00`), "EEE d MMM", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(item.totalTickets)}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(item.scheduled)}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(item.invited)}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(item.administrative)}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(item.unregistered)}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(dailyResolvedMap.get(item.date) ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(
                          dailyRealUsersCreatedMap.get(item.date) ?? 0
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(
                          dailyTotemCreatedMap.get(item.date) ?? 0
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(
                          dailyTotemLinkedExistingMap.get(item.date) ?? 0
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Resolución de no registrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {reportQuery.data ? (
              <>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="text-sm font-medium">Tasa de resolución</div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight">
                    {reportQuery.data.unregistered.resolutionRate.toFixed(2)}%
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Calculada sobre tickets detectados en el rango filtrado.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="text-sm font-medium">
                    Trazabilidad técnica de altas
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-emerald-700">
                    {numberFormatter.format(visibleTotemCreatedTotal)}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Eventos de cola que quedaron asociados al alta. Puede ser menor
                    que las altas reales del sistema.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>
                      Invitados:{" "}
                      {numberFormatter.format(
                        reportQuery.data.registrations?.createdByFlow?.invited ?? 0
                      )}
                    </span>
                    <span>
                      DNI no encontrado:{" "}
                      {numberFormatter.format(
                        reportQuery.data.registrations?.createdByFlow
                          ?.unregistered ??
                          reportQuery.data.unregistered.createdPatientsInRange ??
                          0
                      )}
                    </span>
                    <span>
                      Administrativo:{" "}
                      {numberFormatter.format(
                        reportQuery.data.registrations?.createdByFlow
                          ?.administrative ?? 0
                      )}
                    </span>
                    <span>
                      Con turno:{" "}
                      {numberFormatter.format(
                        reportQuery.data.registrations?.createdByFlow?.scheduled ??
                          0
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {reportQuery.data.unregistered.dailyDetected
                    .filter((item) => !isSundayDateString(item.date))
                    .map((item) => (
                      <div
                        key={item.date}
                        className="rounded-xl border px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium">
                            {format(
                              new Date(`${item.date}T00:00:00`),
                              "EEEE d MMM",
                              {
                                locale: es,
                              }
                            )}
                          </span>
                          <Badge variant="secondary">
                            {numberFormatter.format(item.total)} detectados
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {numberFormatter.format(
                            dailyResolvedMap.get(item.date) ?? 0
                          )}{" "}
                          resueltos con fecha ese día.{" "}
                          {numberFormatter.format(
                            dailyCreatedMap.get(item.date) ?? 0
                          )}{" "}
                          fueron altas técnicas desde DNI no encontrado y{" "}
                          {numberFormatter.format(
                            dailyLinkedExistingMap.get(item.date) ?? 0
                          )}{" "}
                          fueron vinculaciones a pacientes existentes.
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Sin información disponible para el rango seleccionado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
