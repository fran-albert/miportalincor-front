import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Phone,
  Mail,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
} from "lucide-react";
import { useState } from "react";
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
import CalendarioTurnos from "../Calendar";
import { useSpeciality } from "@/hooks/Speciality/useSpeciality";
import { Speciality } from "@/types/Speciality/Speciality";
import { Doctor } from "@/types/Doctor/Doctor";
import { addDays, format, parse, subDays } from "date-fns";
import { useGetByDate } from "@/hooks/Appointments/useGetByDate";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/Badge/Appointment";
import { capitalizeWords } from "@/common/helpers/helpers";

interface Props {
  doctors: Doctor[];
}

function NuevoTurnoDialog({ doctors }: Props) {
  const [open, setOpen] = useState(false);
  const { specialities } = useSpeciality({ auth: true });

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
                  {specialities.map((esp) => (
                    <SelectItem key={esp.id} value={esp.name}>
                      {esp.name}
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
                  {doctors.map((medico) => (
                    <SelectItem key={medico.id} value={medico.firstName}>
                      {medico.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" />
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

interface ShiftProps {
  specialities: Speciality[];
  doctors: Doctor[];
}
export default function ShifComponent({ specialities, doctors }: ShiftProps) {
  const [currentDate, setCurrentDate] = useState<string>(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useGetByDate({
    date: currentDate,
  });
  const prevDay = () =>
    setCurrentDate((d) =>
      format(subDays(parse(d, "yyyy-MM-dd", new Date()), 1), "yyyy-MM-dd")
    );

  const nextDay = () =>
    setCurrentDate((d) =>
      format(addDays(parse(d, "yyyy-MM-dd", new Date()), 1), "yyyy-MM-dd")
    );
  const today = () => setCurrentDate(format(new Date(), "yyyy-MM-dd"));
  const humanDate = () =>
    format(
      parse(currentDate, "yyyy-MM-dd", new Date()),
      "EEEE, d 'de' MMMM yyyy",
      { locale: es }
    );
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>("all");
  const [filtroMedico, setFiltroMedico] = useState<string>("all");
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [vistaCalendario, setVistaCalendario] = useState(false);
  const turnosFiltrados = appointments.filter((turno) => {
    const matchEspecialidad =
      filtroEspecialidad === "all" ||
      turno.doctor?.specialities?.some(
        (esp) => esp.name === filtroEspecialidad
      );

    const matchMedico =
      filtroMedico === "all" || turno.doctor?.firstName === filtroMedico;

    const matchEstado =
      filtroEstado === "all" || turno.status.toLowerCase() === filtroEstado;

    return matchEspecialidad && matchMedico && matchEstado;
  });
  
  return (
    <div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header de la página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-greenPrimary">
              {vistaCalendario ? "Calendario de Turnos" : "Gestión de Turnos"}
            </h1>
            <p className="text-muted-foreground">
              {vistaCalendario
                ? "Vista mensual de todas las citas médicas"
                : "Administra las citas médicas del sanatorio"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setVistaCalendario(!vistaCalendario)}
            >
              {vistaCalendario ? (
                <>
                  <List className="mr-2 h-4 w-4" />
                  Vista Lista
                </>
              ) : (
                <>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Vista Calendario
                </>
              )}
            </Button>
            <NuevoTurnoDialog doctors={doctors} />
          </div>
        </div>
        {vistaCalendario ? (
          <CalendarioTurnos />
        ) : (
          <>
            {/* Métricas rápidas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Turnos Hoy
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    8 confirmados, 16 pendientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Confirmados
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <p className="text-xs text-muted-foreground">33% del total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pendientes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">16</div>
                  <p className="text-xs text-muted-foreground">67% del total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cancelados
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </CardContent>
              </Card>
            </div>

            <div>
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="grid gap-2">
                      <Label>Especialidad</Label>
                      <Select
                        value={filtroEspecialidad}
                        onValueChange={setFiltroEspecialidad}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las Especialidades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las Especialidades
                          </SelectItem>
                          {specialities.map((esp) => (
                            <SelectItem key={esp.id} value={esp.name}>
                              {esp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Médico</Label>
                      <Select
                        value={filtroMedico}
                        onValueChange={setFiltroMedico}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los médicos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los médicos</SelectItem>
                          {doctors.map((medico) => (
                            <SelectItem
                              key={medico.id}
                              value={medico.firstName}
                            >
                              {medico.firstName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Estado</Label>
                      <Select
                        value={filtroEstado}
                        onValueChange={setFiltroEstado}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="canceled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFiltroEspecialidad("all");
                          setFiltroMedico("all");
                          setFiltroEstado("all");
                        }}
                        className="w-full"
                      >
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              {/* Lista de turnos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Turnos del Día</CardTitle>
                      <CardDescription>
                        {humanDate()} –{" "}
                        {isLoading
                          ? "cargando…"
                          : `${appointments.length} turnos`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={prevDay}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={today}>
                        Hoy
                      </Button>
                      <Button variant="outline" size="sm" onClick={nextDay}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isError && <div>Error al cargar turnos</div>}
                    {isLoading && <div>Cargando turnos…</div>}
                    {!isLoading &&
                      !isError &&
                      turnosFiltrados.map((turno) => (
                        <div
                          key={turno.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {/* hora + fecha */}
                          <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                              <span className="text-sm font-medium">
                                {turno.hour.slice(0, 5)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  parse(turno.date, "yyyy-MM-dd", new Date()),
                                  "dd/MM",
                                  { locale: es }
                                )}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {capitalizeWords(
                                    turno.patient?.lastName ?? ""
                                  )}
                                  ,{" "}
                                  {capitalizeWords(
                                    turno.patient?.firstName ?? ""
                                  )}
                                </h3>
                                <StatusBadge status={turno.status} />
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {turno.doctor &&
                                  `${
                                    turno.doctor.gender === "Masculino"
                                      ? "Dr."
                                      : "Dra."
                                  } ${turno.doctor.firstName} ${
                                    turno.doctor.lastName
                                  } • `}
                                {turno.doctor?.specialities?.map(
                                  (esp) => esp.name
                                )}
                              </p>
                            </div>
                          </div>

                          {/* acciones */}
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirmar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Reprogramar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
