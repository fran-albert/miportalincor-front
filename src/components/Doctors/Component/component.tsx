"use client";
import {
  User,
  Edit,
  Phone,
  Mail,
  Award,
  Star,
  Plus,
  Trash2,
  MapPin,
  GraduationCap,
  CalendarX,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Doctor } from "@/types/Doctor/Doctor";
import { formatMatricula } from "@/common/helpers/helpers";
import ScheduleDoctor from "../Schedule";
import DoctorAppointments from "../Appointments";

// Datos del médico (simulando que viene de una API)
const medico = {
  id: 1,
  nombre: "Carlos",
  apellido: "Rodríguez",
  matricula: "MN12345",
  dni: "12345678",
  especialidad: "Cardiología",
  subespecialidad: "Hemodinamia",
  telefono: "+54 11 1234-5678",
  email: "carlos.rodriguez@sanatorio.com",
  direccion: "Av. Corrientes 1234, CABA",
  fechaNacimiento: "1975-05-15",
  fechaIngreso: "2018-03-15",
  estado: "activo",
  consultorio: "201",
  universidad: "Universidad de Buenos Aires",
  añoGraduacion: "2000",
  añosExperiencia: 15,
  turnosHoy: 8,
  turnosSemana: 45,
  turnosMes: 180,
  calificacion: 4.8,
  observaciones:
    "Especialista en cateterismo cardíaco con amplia experiencia en procedimientos complejos",
  certificaciones: [
    "Cardiología Intervencionista",
    "Ecocardiografía",
    "Medicina Nuclear Cardíaca",
  ],
  contactoEmergencia: "María Rodríguez - +54 11 9876-5432",
};

// Ausencias programadas
const ausencias = [
  {
    id: 1,
    tipo: "Vacaciones",
    fechaInicio: "2024-02-15",
    fechaFin: "2024-02-29",
    motivo: "Vacaciones anuales",
    estado: "aprobada",
  },
  {
    id: 2,
    tipo: "Licencia Médica",
    fechaInicio: "2024-03-10",
    fechaFin: "2024-03-12",
    motivo: "Consulta médica personal",
    estado: "pendiente",
  },
  {
    id: 3,
    tipo: "Congreso",
    fechaInicio: "2024-04-20",
    fechaFin: "2024-04-22",
    motivo: "Congreso Internacional de Cardiología",
    estado: "aprobada",
  },
];

function getEstadoAusenciaBadge(estado: string) {
  switch (estado) {
    case "aprobada":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Aprobada
        </Badge>
      );
    case "pendiente":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pendiente
        </Badge>
      );
    case "rechazada":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Rechazada
        </Badge>
      );
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
}

function NuevaAusenciaDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Ausencia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Programar Ausencia</DialogTitle>
          <DialogDescription>
            Configure una nueva ausencia para el médico.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tipo">Tipo de Ausencia</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacaciones">Vacaciones</SelectItem>
                <SelectItem value="licencia-medica">Licencia Médica</SelectItem>
                <SelectItem value="congreso">Congreso/Capacitación</SelectItem>
                <SelectItem value="personal">Motivos Personales</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha-inicio">Fecha de Inicio</Label>
              <Input id="fecha-inicio" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha-fin">Fecha de Fin</Label>
              <Input id="fecha-fin" type="date" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              placeholder="Descripción del motivo de la ausencia..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reemplazo">Médico de Reemplazo (Opcional)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dr-lopez">Dr. María López</SelectItem>
                <SelectItem value="dr-perez">Dr. Juan Pérez</SelectItem>
                <SelectItem value="dr-torres">Dr. Miguel Torres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setOpen(false)}>Programar Ausencia</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditarMedicoDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Editar Información
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Información del Médico</DialogTitle>
          <DialogDescription>
            Modifique los datos del Dr. {medico.nombre} {medico.apellido}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Datos Personales</TabsTrigger>
            <TabsTrigger value="profesional">
              Información Profesional
            </TabsTrigger>
            <TabsTrigger value="contacto">Contacto</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" defaultValue={medico.nombre} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" defaultValue={medico.apellido} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" defaultValue={medico.dni} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha-nacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fecha-nacimiento"
                  type="date"
                  defaultValue={medico.fechaNacimiento}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" defaultValue={medico.direccion} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contacto-emergencia">
                Contacto de Emergencia
              </Label>
              <Input
                id="contacto-emergencia"
                defaultValue={medico.contactoEmergencia}
              />
            </div>
          </TabsContent>

          <TabsContent value="profesional" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input id="matricula" defaultValue={medico.matricula} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="consultorio">Consultorio</Label>
                <Input id="consultorio" defaultValue={medico.consultorio} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="especialidad">Especialidad</Label>
                <Input id="especialidad" defaultValue={medico.especialidad} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subespecialidad">Subespecialidad</Label>
                <Input
                  id="subespecialidad"
                  defaultValue={medico.subespecialidad}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="universidad">Universidad</Label>
                <Input id="universidad" defaultValue={medico.universidad} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="año-graduacion">Año de Graduación</Label>
                <Input
                  id="año-graduacion"
                  defaultValue={medico.añoGraduacion}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                defaultValue={medico.observaciones}
              />
            </div>
          </TabsContent>

          <TabsContent value="contacto" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" defaultValue={medico.telefono} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={medico.email} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select defaultValue={medico.estado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="licencia">En Licencia</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setOpen(false)}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
interface Props {
  doctor: Doctor;
}
export default function MedicoDetallePage({ doctor }: Props) {
  const doctorName =
    (doctor.gender === "male" ? "Dr." : "Dra.") +
    ` ${doctor.firstName} ${doctor.lastName}`;

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  return (
    <SidebarProvider>
      <SidebarInset>
        {/* <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/medicos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Médicos
              </Link>
            </Button>
            <div className="flex flex-1 items-center gap-2 justify-end">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <img
                      src="/placeholder.svg?height=32&width=32&text=DM"
                      width="32"
                      height="32"
                      className="rounded-full"
                      alt="Avatar"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Dr. María González</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configuración</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header> */}

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header del médico */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck className="w-12 h-12 text-primary" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold text-greenPrimary">
                  {doctorName}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {doctor?.specialities.map((speciality) => (
                    <span>{speciality.name}</span>
                  ))}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {/* {getEstadoBadge(medico.estado)} */}
                  {/* <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{medico.calificacion}</span>
                  </div> */}
                  <Badge variant="outline">
                    Matrícula: {formatMatricula(doctor.matricula)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Llamar
              </Button>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <EditarMedicoDialog />
            </div>
          </div>

          {/* Contenido principal con pestañas */}
          <Tabs defaultValue="informacion" className="space-y-4">
            <TabsList>
              <TabsTrigger value="informacion">
                Información Personal
              </TabsTrigger>
              <TabsTrigger value="horarios">Horarios</TabsTrigger>
              <TabsTrigger value="ausencias">Ausencias</TabsTrigger>
              <TabsTrigger value="turnos">Turnos</TabsTrigger>
              <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="informacion" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Información Personal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Datos Personales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">DNI:</span>
                        <p>{medico.dni}</p>
                      </div>
                      <div>
                        <span className="font-medium">Edad:</span>
                        <p>{calcularEdad(medico.fechaNacimiento)} años</p>
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span>
                        <p>{medico.telefono}</p>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <p>{medico.email}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Dirección:</span>
                      <p className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {medico.direccion}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">
                        Contacto de Emergencia:
                      </span>
                      <p>{medico.contactoEmergencia}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Información Profesional */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Información Profesional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Matrícula:</span>
                        <p>{medico.matricula}</p>
                      </div>
                      <div>
                        <span className="font-medium">Especialidad:</span>
                        <p>{medico.especialidad}</p>
                      </div>
                      <div>
                        <span className="font-medium">Subespecialidad:</span>
                        <p>{medico.subespecialidad}</p>
                      </div>
                      <div>
                        <span className="font-medium">Experiencia:</span>
                        <p>{medico.añosExperiencia} años</p>
                      </div>
                      <div>
                        <span className="font-medium">Universidad:</span>
                        <p>{medico.universidad}</p>
                      </div>
                      <div>
                        <span className="font-medium">Año de Graduación:</span>
                        <p>{medico.añoGraduacion}</p>
                      </div>
                      <div>
                        <span className="font-medium">Fecha de Ingreso:</span>
                        <p>
                          {new Date(medico.fechaIngreso).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Certificaciones:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {medico.certificaciones.map((cert, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Award className="w-3 h-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Observaciones:</span>
                      <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                        {medico.observaciones}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="horarios" className="space-y-6">
              <ScheduleDoctor doctorId={doctor.userId} />
            </TabsContent>

            <TabsContent value="ausencias" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarX className="h-5 w-5" />
                      Gestión de Ausencias
                    </CardTitle>
                    <NuevaAusenciaDialog />
                  </div>
                  <CardDescription>
                    Administre las ausencias programadas del médico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha Inicio</TableHead>
                        <TableHead>Fecha Fin</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ausencias.map((ausencia) => (
                        <TableRow key={ausencia.id}>
                          <TableCell className="font-medium">
                            {ausencia.tipo}
                          </TableCell>
                          <TableCell>
                            {new Date(ausencia.fechaInicio).toLocaleDateString(
                              "es-ES"
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(ausencia.fechaFin).toLocaleDateString(
                              "es-ES"
                            )}
                          </TableCell>
                          <TableCell>{ausencia.motivo}</TableCell>
                          <TableCell>
                            {getEstadoAusenciaBadge(ausencia.estado)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="turnos" className="space-y-6">
              <DoctorAppointments doctorId={doctor.userId} />
            </TabsContent>

            <TabsContent value="estadisticas" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento Mensual</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Turnos Completados</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Turnos Cancelados</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tasa de Asistencia</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Tiempo Promedio por Consulta
                      </span>
                      <span className="font-medium">25 min</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Calificaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {medico.calificacion}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.floor(medico.calificacion)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>5 estrellas</span>
                        <span>68%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>4 estrellas</span>
                        <span>22%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>3 estrellas</span>
                        <span>8%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>2 estrellas</span>
                        <span>2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>1 estrella</span>
                        <span>0%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
