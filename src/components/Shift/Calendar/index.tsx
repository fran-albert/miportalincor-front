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

// Datos de ejemplo para turnos con más fechas
const turnos = [
  {
    id: 1,
    paciente: "Ana García",
    medico: "Dr. Carlos Rodríguez",
    especialidad: "Cardiología",
    fecha: "2024-01-15",
    hora: "09:00",
    estado: "confirmado",
    telefono: "+54 11 1234-5678",
    obraSocial: "OSDE",
    observaciones: "Control de rutina",
  },
  {
    id: 2,
    paciente: "Luis Martínez",
    medico: "Dra. María López",
    especialidad: "Medicina General",
    fecha: "2024-01-15",
    hora: "09:30",
    estado: "pendiente",
    telefono: "+54 11 2345-6789",
    obraSocial: "Swiss Medical",
    observaciones: "Primera consulta",
  },
  {
    id: 3,
    paciente: "Carmen Silva",
    medico: "Dr. Juan Pérez",
    especialidad: "Dermatología",
    fecha: "2024-01-16",
    hora: "10:00",
    estado: "completado",
    telefono: "+54 11 3456-7890",
    obraSocial: "Galeno",
    observaciones: "Control de lunares",
  },
  {
    id: 4,
    paciente: "Roberto Díaz",
    medico: "Dra. Laura Fernández",
    especialidad: "Traumatología",
    fecha: "2024-01-16",
    hora: "10:30",
    estado: "cancelado",
    telefono: "+54 11 4567-8901",
    obraSocial: "IOMA",
    observaciones: "Dolor en rodilla",
  },
  {
    id: 5,
    paciente: "Elena Morales",
    medico: "Dr. Miguel Torres",
    especialidad: "Ginecología",
    fecha: "2024-01-17",
    hora: "11:00",
    estado: "confirmado",
    telefono: "+54 11 5678-9012",
    obraSocial: "OSECAC",
    observaciones: "Control anual",
  },
  {
    id: 6,
    paciente: "Pedro Ruiz",
    medico: "Dr. Carlos Rodríguez",
    especialidad: "Cardiología",
    fecha: "2024-01-18",
    hora: "14:00",
    estado: "pendiente",
    telefono: "+54 11 6789-0123",
    obraSocial: "OSDE",
    observaciones: "Dolor en el pecho",
  },
  {
    id: 7,
    paciente: "María Fernández",
    medico: "Dra. Ana Ruiz",
    especialidad: "Pediatría",
    fecha: "2024-01-19",
    hora: "15:30",
    estado: "confirmado",
    telefono: "+54 11 7890-1234",
    obraSocial: "Swiss Medical",
    observaciones: "Control de crecimiento",
  },
  {
    id: 8,
    paciente: "José López",
    medico: "Dr. Pablo Sánchez",
    especialidad: "Neurología",
    fecha: "2024-01-22",
    hora: "16:00",
    estado: "pendiente",
    telefono: "+54 11 8901-2345",
    obraSocial: "Galeno",
    observaciones: "Dolor de cabeza recurrente",
  },
];

const especialidades = [
  "Cardiología",
  "Medicina General",
  "Dermatología",
  "Traumatología",
  "Ginecología",
  "Pediatría",
  "Neurología",
  "Oftalmología",
];

const medicos = [
  "Dr. Carlos Rodríguez",
  "Dra. María López",
  "Dr. Juan Pérez",
  "Dra. Laura Fernández",
  "Dr. Miguel Torres",
  "Dra. Ana Ruiz",
  "Dr. Pablo Sánchez",
  "Dra. Lucía Vega",
];

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

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "confirmado":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmado
        </Badge>
      );
    case "pendiente":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Pendiente
        </Badge>
      );
    case "completado":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completado
        </Badge>
      );
    case "cancelado":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelado
        </Badge>
      );
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
}

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
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp.toLowerCase()}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medico">Médico</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar médico" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map((medico) => (
                    <SelectItem key={medico} value={medico.toLowerCase()}>
                      {medico}
                    </SelectItem>
                  ))}
                </SelectContent>
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

function CalendarioMensual({
  fechaActual,
  onCambiarFecha,
  onSeleccionarDia,
  diaSeleccionado,
}: {
  fechaActual: Date;
  onCambiarFecha: (fecha: Date) => void;
  onSeleccionarDia: (dia: number) => void;
  diaSeleccionado: number | null;
}) {
  const año = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  // Primer día del mes
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);

  // Días del mes anterior para completar la primera semana
  const diasMesAnterior = primerDia.getDay();
  const diasEnMes = ultimoDia.getDate();

  const dias = [];

  // Días del mes anterior
  for (let i = diasMesAnterior - 1; i >= 0; i--) {
    const dia = new Date(año, mes, -i);
    dias.push({
      numero: dia.getDate(),
      esDelMes: false,
      fecha: dia,
    });
  }

  // Días del mes actual
  for (let i = 1; i <= diasEnMes; i++) {
    dias.push({
      numero: i,
      esDelMes: true,
      fecha: new Date(año, mes, i),
    });
  }

  // Días del mes siguiente para completar la última semana
  const diasRestantes = 42 - dias.length; // 6 semanas * 7 días
  for (let i = 1; i <= diasRestantes; i++) {
    const dia = new Date(año, mes + 1, i);
    dias.push({
      numero: dia.getDate(),
      esDelMes: false,
      fecha: dia,
    });
  }

  const getTurnosDelDia = (dia: number) => {
    const fechaDia = `${año}-${String(mes + 1).padStart(2, "0")}-${String(
      dia
    ).padStart(2, "0")}`;
    return turnos.filter((turno) => turno.fecha === fechaDia);
  };

  const mesAnterior = () => {
    onCambiarFecha(new Date(año, mes - 1, 1));
  };

  const mesSiguiente = () => {
    onCambiarFecha(new Date(año, mes + 1, 1));
  };

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-greenPrimary">
          {meses[mes]} {año}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={mesAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={mesSiguiente}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1">
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia, index) => {
          const turnosDelDia = dia.esDelMes ? getTurnosDelDia(dia.numero) : [];
          const esSeleccionado = dia.esDelMes && dia.numero === diaSeleccionado;
          const esHoy =
            dia.esDelMes &&
            dia.fecha.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              onClick={() => dia.esDelMes && onSeleccionarDia(dia.numero)}
              className={`
                relative p-2 h-20 border rounded-lg text-left transition-colors
                ${
                  dia.esDelMes
                    ? "hover:bg-muted/50"
                    : "text-muted-foreground bg-muted/20"
                }
                ${
                  esSeleccionado
                    ? "bg-primary/10 border-primary"
                    : "border-border"
                }
                ${esHoy ? "bg-blue-50 border-blue-200" : ""}
              `}
            >
              <span
                className={`text-sm ${esHoy ? "font-bold text-blue-600" : ""}`}
              >
                {dia.numero}
              </span>

              {/* Indicadores de turnos */}
              {turnosDelDia.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="flex gap-1 flex-wrap">
                    {turnosDelDia.slice(0, 3).map((turno) => (
                      <div
                        key={turno.id}
                        className={`w-2 h-2 rounded-full ${
                          turno.estado === "confirmado"
                            ? "bg-green-500"
                            : turno.estado === "pendiente"
                            ? "bg-yellow-500"
                            : turno.estado === "completado"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }`}
                      />
                    ))}
                    {turnosDelDia.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{turnosDelDia.length - 3}
                      </span>
                    )}
                  </div>
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
  const [fechaActual, setFechaActual] = useState(new Date(2024, 0, 1)); // Enero 2024
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(15);

  const turnosDelDiaSeleccionado = diaSeleccionado
    ? turnos.filter((turno) => {
        const fechaDia = `${fechaActual.getFullYear()}-${String(
          fechaActual.getMonth() + 1
        ).padStart(2, "0")}-${String(diaSeleccionado).padStart(2, "0")}`;
        return turno.fecha === fechaDia;
      })
    : [];

  const fechaSeleccionadaString = diaSeleccionado
    ? `${fechaActual.getFullYear()}-${String(
        fechaActual.getMonth() + 1
      ).padStart(2, "0")}-${String(diaSeleccionado).padStart(2, "0")}`
    : undefined;

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
                onSeleccionarDia={setDiaSeleccionado}
                diaSeleccionado={diaSeleccionado}
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
                {turnosDelDiaSeleccionado.length > 0 ? (
                  turnosDelDiaSeleccionado
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map((turno) => (
                      <div
                        key={turno.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {turno.hora}
                            </span>
                            {getEstadoBadge(turno.estado)}
                          </div>
                          <h4 className="font-semibold text-sm">
                            {turno.paciente}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {turno.medico}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {turno.especialidad}
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
                        fechaSeleccionada={fechaSeleccionadaString}
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
