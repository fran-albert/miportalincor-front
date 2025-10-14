import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Eye } from "lucide-react";
import { useGetByDoctorId } from "@/hooks/Appointments/useGetByDoctorId";
import { StatusBadge } from "@/components/Badge/Appointment";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { AppointmentResponseDto, AppointmentWithPatientDto } from "@/types/Appointment/Appointment";

interface Props {
  doctorId: number;
}

function VerDetallesTurnoDialog({ turno }: { turno: AppointmentResponseDto | AppointmentWithPatientDto }) {
  const [open, setOpen] = useState(false);

  // Helper para obtener el nombre del paciente
  const getPatientName = () => {
    if ('paciente' in turno && turno.paciente) {
      return turno.paciente;
    }
    if (turno.patient) {
      return `${turno.patient.lastName || ''} ${turno.patient.firstName || ''}`.trim();
    }
    return 'Paciente';
  };

  // Helper para obtener el estado
  const getEstado = () => {
    if ('estado' in turno && turno.estado) {
      return turno.estado;
    }
    return turno.status;
  };

  // Helper para obtener la fecha
  const getFecha = () => {
    if ('fecha' in turno && turno.fecha) {
      return new Date(turno.fecha).toLocaleDateString("es-ES");
    }
    return new Date(turno.date).toLocaleDateString("es-ES");
  };

  // Helper para obtener la hora
  const getHora = () => {
    if ('hora' in turno && turno.hora) {
      return turno.hora;
    }
    return turno.hour;
  };

  // Helper para obtener el tipo
  const getTipo = () => {
    if ('tipo' in turno && turno.tipo) {
      return turno.tipo;
    }
    return 'Consulta';
  };

  const patientName = getPatientName();
  const estado = getEstado();
  const fecha = getFecha();
  const hora = getHora();
  const tipo = getTipo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Turno</DialogTitle>
          <DialogDescription>
            Información completa del turno de {patientName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Paciente</Label>
              <p className="text-sm">{patientName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Estado</Label>
              <Badge
                variant={
                  estado === "completado" || estado === "COMPLETED" ? "default" : "secondary"
                }
              >
                {estado}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Fecha</Label>
              <p className="text-sm">{fecha}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Hora</Label>
              <p className="text-sm">{hora}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Tipo de Consulta</Label>
              <p className="text-sm">{tipo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Duración</Label>
              <p className="text-sm">30 minutos</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Motivo de Consulta</Label>
            <p className="text-sm text-muted-foreground">
              {tipo === "Control"
                ? "Control de rutina programado"
                : tipo === "Consulta"
                ? "Primera consulta por síntomas"
                : "Procedimiento especializado"}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Observaciones</Label>
            <p className="text-sm text-muted-foreground">
              {estado === "completado" || estado === "COMPLETED"
                ? "Consulta realizada sin complicaciones. Paciente en buen estado."
                : "Turno programado - Sin observaciones previas"}
            </p>
          </div>

          {(estado === "completado" || estado === "COMPLETED") && (
            <div>
              <Label className="text-sm font-medium">Diagnóstico</Label>
              <p className="text-sm text-muted-foreground">
                Evaluación cardiológica normal. Se recomienda control en 6
                meses.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
          {(estado === "programado" || estado === "PENDING") && (
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar Turno
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DoctorAppointments = ({ doctorId }: Props) => {
  const { data, isLoading } = useGetByDoctorId({
    auth: true,
    id: doctorId,
  });

  const turnosRecientes = data?.slice(0, 5) || [];
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p>Cargando turnos...</p>
      </div>
    );
  }
  if (turnosRecientes.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No hay turnos recientes.</p>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Turnos Recientes
          </CardTitle>
          <CardDescription>
            Últimos turnos y consultas del médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turnosRecientes.map((turno) => (
                <TableRow key={turno.id}>
                  <TableCell className="font-medium">
                    {turno.patient?.lastName} {turno.patient?.firstName}
                  </TableCell>
                  <TableCell>
                    {new Date(turno.date + "T00:00:00").toLocaleDateString(
                      "es-AR"
                    )}
                  </TableCell>
                  <TableCell>{turno.hour.slice(0, 5)} hs</TableCell>
                  <TableCell>
                    <StatusBadge status={turno.status} />
                  </TableCell>
                  <TableCell>
                    <VerDetallesTurnoDialog turno={turno} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointments;
