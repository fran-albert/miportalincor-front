import { useMemo, useState, type ReactNode } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  ClipboardList,
  Download,
  Ticket,
  UserCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/Appointments-Analytics/DateRangeFilter";
import { useTotemAnalyticsReport } from "@/hooks/Totem-Analytics";
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
  value: number;
  description: string;
  icon: ReactNode;
}

const numberFormatter = new Intl.NumberFormat("es-AR");

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
          {numberFormatter.format(value)}
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
  const [dateFrom, setDateFrom] = useState(() =>
    format(subDays(new Date(), 6), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const reportQuery = useTotemAnalyticsReport({ dateFrom, dateTo });

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

  const registrationTrendData = useMemo(
    () =>
      reportQuery.data?.registrations?.dailyCreated?.map((item) => ({
        ...item,
        label: format(new Date(`${item.date}T00:00:00`), "d MMM", {
          locale: es,
        }),
        vinculados:
          reportQuery.data?.registrations?.dailyLinkedExisting?.find(
            (linked) => linked.date === item.date
          )?.total ?? 0,
      })) ?? [],
    [reportQuery.data]
  );

  const ticketTrendData = useMemo(
    () =>
      reportQuery.data?.daily.map((item) => ({
        ...item,
        label: format(new Date(`${item.date}T00:00:00`), "d MMM", {
          locale: es,
        }),
      })) ?? [],
    [reportQuery.data]
  );

  const cards = reportQuery.data
    ? [
        {
          title: "Tickets Totem",
          value: reportQuery.data.overview.totalTickets,
          description: "Interacciones iniciadas desde el tótem en el rango.",
          icon: <Ticket className="h-5 w-5" />,
        },
        {
          title: "Con turno",
          value: reportQuery.data.overview.scheduled,
          description: "Pacientes registrados con turno previo.",
          icon: <UserCheck className="h-5 w-5" />,
        },
        {
          title: "Invitados",
          value: reportQuery.data.overview.invited,
          description: "Turnos de invitados que hicieron check-in en tótem.",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Trámite administrativo",
          value: reportQuery.data.overview.administrative,
          description: "Tickets administrativos originados en el tótem.",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          title: "DNI no encontrado",
          value: reportQuery.data.overview.unregistered,
          description: "Casos detectados por el tótem fuera del sistema.",
          icon: <UserRoundPlus className="h-5 w-5" />,
        },
        {
          title: "No registrados resueltos",
          value: reportQuery.data.unregistered.resolvedTickets,
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
          title: "Pacientes nuevos desde Totem",
          value:
            reportQuery.data.registrations?.createdPatientsInRange ??
            reportQuery.data.unregistered.createdPatientsInRange ??
            0,
          description: "Altas nuevas originadas por cualquier ticket del tótem.",
          icon: <UserRoundPlus className="h-5 w-5" />,
        },
        {
          title: "Vinculados desde Totem",
          value:
            reportQuery.data.registrations?.linkedExistingPatientsInRange ??
            reportQuery.data.unregistered.linkedExistingPatientsInRange ??
            0,
          description: "Tickets del tótem asociados a pacientes existentes.",
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
      ["Tickets Totem", reportQuery.data.overview.totalTickets],
      ["Con turno", reportQuery.data.overview.scheduled],
      ["Invitados", reportQuery.data.overview.invited],
      ["Trámite administrativo", reportQuery.data.overview.administrative],
      ["DNI no encontrado", reportQuery.data.overview.unregistered],
      ["No registrados resueltos", reportQuery.data.unregistered.resolvedTickets],
      ["No registrados pendientes", reportQuery.data.unregistered.pendingTickets],
      [
        "Pacientes nuevos desde Totem",
        reportQuery.data.registrations?.createdPatientsInRange ??
          reportQuery.data.unregistered.createdPatientsInRange ??
          0,
      ],
      [
        "Vinculados desde Totem",
        reportQuery.data.registrations?.linkedExistingPatientsInRange ??
          reportQuery.data.unregistered.linkedExistingPatientsInRange ??
          0,
      ],
      [
        "Pacientes nuevos desde DNI no encontrado",
        reportQuery.data.unregistered.createdPatientsInRange ?? 0,
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
        "Pacientes nuevos Totem ese día",
        "Vinculados Totem ese día",
        "Pacientes nuevos desde DNI no encontrado ese día",
      ],
      ...reportQuery.data.daily.map((item) => [
        item.date,
        item.totalTickets,
        item.scheduled,
        item.invited,
        item.administrative,
        item.unregistered,
        dailyResolvedMap.get(item.date) ?? 0,
        dailyTotemCreatedMap.get(item.date) ?? 0,
        dailyTotemLinkedExistingMap.get(item.date) ?? 0,
        dailyCreatedMap.get(item.date) ?? 0,
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

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Filtros del reporte Totem</h2>
            <p className="text-sm text-muted-foreground">
              El detalle diario usa como base cada ticket iniciado en el tótem. Las
              altas nuevas se miden para todo el circuito Totem y se desglosan por
              origen del ticket.
            </p>
          </div>
          <DateRangeFilter
            from={dateFrom}
            to={dateTo}
            onRangeChange={(nextFrom: string, nextTo: string) => {
              setDateFrom(nextFrom);
              setDateTo(nextTo);
            }}
          />
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Base: ticket iniciado en tótem
            </Badge>
            <Badge variant="outline">
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
            className="w-full md:w-auto"
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
            <CardTitle>Tendencia de altas nuevas</CardTitle>
            <CardDescription>
              Pacientes creados desde cualquier ticket iniciado en el tótem.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {reportQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
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
                    dataKey="total"
                    name="Nuevos Totem"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
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
                    dataKey="unregistered"
                    name="DNI no encontrado"
                    stroke="#F97316"
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
            {!reportQuery.data?.daily.length ? (
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
                    <TableHead className="text-right">Nuevos Totem</TableHead>
                    <TableHead className="text-right">Vinculados Totem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportQuery.data.daily.map((item) => (
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
                    Pacientes nuevos desde Totem
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-emerald-700">
                    {numberFormatter.format(
                      reportQuery.data.registrations?.createdPatientsInRange ??
                        reportQuery.data.unregistered.createdPatientsInRange ??
                        0
                    )}
                  </div>
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
                  {reportQuery.data.unregistered.dailyDetected.map((item) => (
                    <div
                      key={item.date}
                      className="rounded-xl border px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">
                          {format(new Date(`${item.date}T00:00:00`), "EEEE d MMM", {
                            locale: es,
                          })}
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
                        fueron pacientes nuevos desde DNI no encontrado y{" "}
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
