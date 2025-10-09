import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { useGetByMonthYear } from "@/hooks/Appointments/useGetByMonthYear";
import {
  CountByDay,
  useCountsFromMonthlyAppointments,
} from "@/hooks/Appointments/useCountFromMonthYear";
import { StatusBadge } from "@/components/Badge/Appointment";
import { capitalizeWords } from "@/common/helpers/helpers";

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function NuevoTurnoDialog({
  fechaSeleccionada,
}: {
  fechaSeleccionada?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-greenPrimary text-white hover:bg-greenPrimary/80">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Turno
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Turno</DialogTitle>
          <DialogDescription>
            Complete los datos para agendar un nuevo turno médico.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="paciente">Paciente</Label>
              <Input id="paciente" placeholder="Buscar paciente..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" placeholder="+54 11 1234-5678" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medico">Médico</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar médico" />
                </SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" defaultValue={fechaSeleccionada} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" type="time" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="obra-social">Obra Social</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar obra social" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="osde">OSDE</SelectItem>
                <SelectItem value="swiss">Swiss Medical</SelectItem>
                <SelectItem value="galeno">Galeno</SelectItem>
                <SelectItem value="ioma">IOMA</SelectItem>
                <SelectItem value="osecac">OSECAC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Motivo de la consulta..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setOpen(false)}>Crear Turno</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const statusColor: Record<string, string> = {
  confirmado: "bg-green-500",
  pendiente: "bg-yellow-500",
  completado: "bg-blue-500",
  cancelado: "bg-red-500",
};

interface Props {
  fechaActual: Date;
  onCambiarFecha: (d: Date) => void;
  onSeleccionarDia: (n: number) => void;
  diaSeleccionado: number | null;
  countsByDay: CountByDay[];
  loadingCounts: boolean;
}

function CalendarioMensual({
  fechaActual,
  onCambiarFecha,
  onSeleccionarDia,
  diaSeleccionado,
  countsByDay,
  loadingCounts,
}: Props) {
  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  // 1) Construir array de 42 celdas (6 semanas)
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  const diasMesPrev = primerDia.getDay();
  const diasEnMes = ultimoDia.getDate();
  const totalCeldas = 6 * 7;
  const dias: { numero: number; esDelMes: boolean }[] = [];

  // Mes anterior
  for (let i = diasMesPrev - 1; i >= 0; i--) {
    const d = new Date(año, mes, -i);
    dias.push({ numero: d.getDate(), esDelMes: false });
  }
  // Mes actual
  for (let i = 1; i <= diasEnMes; i++) {
    dias.push({ numero: i, esDelMes: true });
  }
  // Mes siguiente
  while (dias.length < totalCeldas) {
    const idx = dias.length;
    const next = new Date(año, mes + 1, idx - diasEnMes - diasMesPrev + 1);
    dias.push({ numero: next.getDate(), esDelMes: false });
  }

  const mesAnterior = () => onCambiarFecha(new Date(año, mes - 1, 1));
  const mesSiguiente = () => onCambiarFecha(new Date(año, mes + 1, 1));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {meses[mes]} {año}
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={mesAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={mesSiguiente}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {diasSemana.map((d) => (
          <div
            key={d}
            className="p-1 text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Celdas del mes */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map((celda, idx) => {
          // buscamos conteos para ese día
          const entry = countsByDay.find((e) => {
            const d = parseISO(e.date);
            return (
              d.getFullYear() === año &&
              d.getMonth() === mes &&
              d.getDate() === celda.numero
            );
          });

          const esHoy =
            celda.esDelMes &&
            new Date().getFullYear() === año &&
            new Date().getMonth() === mes &&
            new Date().getDate() === celda.numero;
          const esSeleccionado =
            celda.esDelMes && celda.numero === diaSeleccionado;

          return (
            <button
              key={idx}
              disabled={!celda.esDelMes}
              onClick={() => onSeleccionarDia(celda.numero)}
              className={`
                relative p-2 h-20 border rounded-lg text-left
                ${
                  !celda.esDelMes
                    ? "bg-muted/20 text-muted-foreground"
                    : "hover:bg-muted/50"
                }
                ${
                  esSeleccionado
                    ? "bg-primary/10 border-primary"
                    : "border-border"
                }
                ${esHoy ? "bg-blue-50 border-blue-200" : ""}
              `}
            >
              <span className={esHoy ? "font-bold text-blue-600" : ""}>
                {celda.numero}
              </span>

              {/* loading */}
              {loadingCounts && celda.esDelMes && (
                <div className="absolute bottom-1 left-1 text-xs">…</div>
              )}

              {/* indicadores de estado */}
              {!loadingCounts && entry && (
                <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
                  {(
                    Object.entries(entry.counts) as [
                      keyof typeof entry.counts,
                      number
                    ][]
                  ).map(([status, cnt]) =>
                    cnt > 0 ? (
                      <div
                        key={status}
                        className={`w-2 h-2 rounded-full ${statusColor[status]}`}
                      />
                    ) : null
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default function CalendarioTurnos() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(15);
  const month = String(fechaActual.getMonth() + 1).padStart(2, "0");
  const year = String(fechaActual.getFullYear());
  const { data: monthTurns = [], isLoading: loadingMonth } = useGetByMonthYear({
    year,
    month,
  });
  const { countsByDay, isLoading: loadingCounts } =
    useCountsFromMonthlyAppointments(year, month);

  const fechaSeleccionadaString = diaSeleccionado
    ? format(
        new Date(Number(year), parseInt(month) - 1, diaSeleccionado),
        "yyyy-MM-dd"
      )
    : null;

  const turnosDelDiaSeleccionado = fechaSeleccionadaString
    ? monthTurns.filter((t) => t.date === fechaSeleccionadaString)
    : [];

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Métricas rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                turnos programados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">89</div>
              <p className="text-xs text-muted-foreground">57% del total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">52</div>
              <p className="text-xs text-muted-foreground">33% del total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Disponibilidad
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">78%</div>
              <p className="text-xs text-muted-foreground">
                capacidad utilizada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Calendario */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-greenPrimary">
                Calendario Mensual
              </CardTitle>
              <CardDescription>
                Haga clic en un día para ver los turnos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarioMensual
                fechaActual={fechaActual}
                onCambiarFecha={setFechaActual}
                diaSeleccionado={diaSeleccionado}
                onSeleccionarDia={setDiaSeleccionado}
                countsByDay={countsByDay}
                loadingCounts={loadingCounts}
              />
            </CardContent>
          </Card>

          {/* Panel de turnos del día */}
          <Card>
            <CardHeader>
              <CardTitle>
                {diaSeleccionado
                  ? `Turnos del ${diaSeleccionado} de ${
                      meses[fechaActual.getMonth()]
                    }`
                  : "Seleccione un día"}
              </CardTitle>
              <CardDescription>
                {turnosDelDiaSeleccionado.length} turnos programados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingMonth || loadingCounts ? (
                  <p>Cargando mes…</p>
                ) : turnosDelDiaSeleccionado.length > 0 ? (
                  turnosDelDiaSeleccionado
                    .sort((a, b) => a.hour.localeCompare(b.hour))
                    .map((turno) => (
                      <div
                        key={turno.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors space-"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {turno.hour}
                            </span>
                            <StatusBadge status={turno.status} />
                          </div>
                          <h4 className="font-semibold text-sm">
                            {capitalizeWords(turno.patient?.lastName ?? "")},{" "}
                            {capitalizeWords(turno.patient?.firstName ?? "")}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {turno.doctor &&
                              `${
                                turno.doctor.gender === "Masculino"
                                  ? "Dr."
                                  : "Dra."
                              } ${turno.doctor.firstName} ${
                                turno.doctor.lastName
                              }`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {turno.doctor?.specialities?.map((esp) => esp.name)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Llamar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay turnos programados para este día</p>
                    {diaSeleccionado && (
                      <NuevoTurnoDialog
                        fechaSeleccionada={String(fechaSeleccionadaString)}
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leyenda */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leyenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Confirmado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Cancelado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
