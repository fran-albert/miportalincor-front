import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/Appointments/Select/StatusBadge";
import { RequestAppointmentDialog } from "@/components/Appointments/RequestAppointmentDialog";
import { usePatientAppointments, useAppointmentMutations } from "@/hooks/Appointments";
import useUserRole from "@/hooks/useRoles";
import {
  AppointmentFullResponseDto,
  AppointmentStatus
} from "@/types/Appointment/Appointment";
import { formatDateAR, formatTimeAR, isPastDateAR } from "@/common/helpers/timezone";
import {
  Calendar,
  Clock,
  Stethoscope,
  ArrowLeft,
  XCircle,
  CalendarCheck,
  CalendarX,
  Loader2,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const MyAppointmentsPage = () => {
  const { toast } = useToast();
  const { session } = useUserRole();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFullResponseDto | null>(null);

  const patientId = session?.id ? Number(session.id) : 0;

  const { appointments, isLoading } = usePatientAppointments({
    patientId,
    enabled: !!patientId
  });

  const { changeStatus, isChangingStatus } = useAppointmentMutations();

  // Separate upcoming and past appointments
  const upcomingAppointments = appointments.filter(
    apt => !isPastDateAR(apt.date) &&
      apt.status !== AppointmentStatus.CANCELLED_BY_PATIENT &&
      apt.status !== AppointmentStatus.CANCELLED_BY_SECRETARY &&
      apt.status !== AppointmentStatus.COMPLETED
  );

  const pastAppointments = appointments.filter(
    apt => isPastDateAR(apt.date) ||
      apt.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
      apt.status === AppointmentStatus.CANCELLED_BY_SECRETARY ||
      apt.status === AppointmentStatus.COMPLETED
  );

  const canCancel = (apt: AppointmentFullResponseDto) => {
    return (
      apt.status === AppointmentStatus.PENDING ||
      apt.status === AppointmentStatus.WAITING
    );
  };

  const handleCancelClick = (apt: AppointmentFullResponseDto) => {
    setSelectedAppointment(apt);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await changeStatus.mutateAsync({
        id: selectedAppointment.id,
        status: AppointmentStatus.CANCELLED_BY_PATIENT
      });
      toast({
        title: "Turno cancelado",
        description: "Tu turno ha sido cancelado correctamente",
      });
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cancelar el turno. Por favor intenta nuevamente.",
      });
    }
  };

  const AppointmentCardPatient = ({ appointment }: { appointment: AppointmentFullResponseDto }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={appointment.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDateAR(appointment.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeAR(appointment.hour)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
              </span>
              {appointment.doctor?.specialities && appointment.doctor.specialities.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {appointment.doctor.specialities[0].name}
                </Badge>
              )}
            </div>
          </div>

          {canCancel(appointment) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancelClick(appointment)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-greenPrimary flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Mis Turnos
          </h1>
          <p className="text-muted-foreground mt-1">
            Consultá y gestioná tus turnos médicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setRequestDialogOpen(true)}
            className="bg-greenPrimary hover:bg-greenPrimary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Solicitar Turno
          </Button>
          <Link to="/inicio">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-green-600" />
              Próximos Turnos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {upcomingAppointments.length}
            </div>
            <p className="text-sm text-muted-foreground">
              turnos agendados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarX className="h-5 w-5 text-muted-foreground" />
              Historial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              {pastAppointments.length}
            </div>
            <p className="text-sm text-muted-foreground">
              turnos pasados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="flex-1">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Próximos ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CalendarX className="h-4 w-4" />
            Historial ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No tenés turnos agendados
                </h3>
                <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
                  Solicitá un nuevo turno o contactá a la secretaría
                </p>
                <Button
                  onClick={() => setRequestDialogOpen(true)}
                  className="bg-greenPrimary hover:bg-greenPrimary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Solicitar Turno
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <AppointmentCardPatient key={apt.id} appointment={apt} />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarX className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No hay turnos en el historial
                </h3>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {pastAppointments.map((apt) => (
                  <AppointmentCardPatient key={apt.id} appointment={apt} />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAppointment && (
                <div className="mt-2 space-y-1">
                  <p>
                    <strong>Fecha:</strong> {formatDateAR(selectedAppointment.date)}
                  </p>
                  <p>
                    <strong>Hora:</strong> {formatTimeAR(selectedAppointment.hour)}
                  </p>
                  <p>
                    <strong>Médico:</strong> Dr. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}
                  </p>
                </div>
              )}
              <p className="mt-4 text-amber-600">
                Esta acción no se puede deshacer. Si necesitás reagendar, contactá a la secretaría.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingStatus}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isChangingStatus}
              className="bg-red-600 hover:bg-red-700"
            >
              {isChangingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, cancelar turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Appointment Dialog */}
      <RequestAppointmentDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
      />
    </div>
  );
};

export default MyAppointmentsPage;
