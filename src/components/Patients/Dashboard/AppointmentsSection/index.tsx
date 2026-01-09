import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { usePatientAppointmentsByUserId } from "@/hooks/Appointments";
import { useAppointmentMutations } from "@/hooks/Appointments";
import { CreateAppointmentDialog } from "@/components/Appointments/Dialogs/CreateAppointmentDialog";
import { AppointmentCard } from "@/components/Appointments/Cards/AppointmentCard";
import { AppointmentFullResponseDto, AppointmentStatus } from "@/types/Appointment/Appointment";
import { formatDateAR, formatTimeAR } from "@/common/helpers/timezone";
import { formatDoctorName } from "@/common/helpers/helpers";
import { CalendarCheck, CalendarX, Plus, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useUserRole from "@/hooks/useRoles";

interface AppointmentsSectionProps {
  patientUserId: number;
  patientData?: {
    userId: number;
    firstName: string;
    lastName: string;
    userName?: string;
  };
}

/**
 * Determina si una fecha está en el pasado
 */
const isPastDate = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export const AppointmentsSection = ({ patientUserId, patientData }: AppointmentsSectionProps) => {
  const { toast } = useToast();
  const { isAdmin, isSecretary } = useUserRole();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFullResponseDto | null>(null);

  const canManageAppointments = isAdmin || isSecretary;

  const { appointments, isLoading, refetch } = usePatientAppointmentsByUserId({
    patientUserId,
    enabled: patientUserId > 0,
  });

  const { changeStatus, isChangingStatus } = useAppointmentMutations();

  // Separar turnos próximos y pasados
  const upcomingAppointments = appointments.filter(
    apt =>
      !isPastDate(apt.date) &&
      apt.status !== AppointmentStatus.CANCELLED_BY_PATIENT &&
      apt.status !== AppointmentStatus.CANCELLED_BY_SECRETARY &&
      apt.status !== AppointmentStatus.COMPLETED
  ).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.hour}`);
    const dateB = new Date(`${b.date}T${b.hour}`);
    return dateA.getTime() - dateB.getTime();
  });

  const pastAppointments = appointments.filter(
    apt =>
      isPastDate(apt.date) ||
      apt.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
      apt.status === AppointmentStatus.CANCELLED_BY_SECRETARY ||
      apt.status === AppointmentStatus.COMPLETED
  ).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.hour}`);
    const dateB = new Date(`${b.date}T${b.hour}`);
    return dateB.getTime() - dateA.getTime();
  });

  const handleCancelClick = (appointment: AppointmentFullResponseDto) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      await changeStatus.mutateAsync({
        id: selectedAppointment.id,
        status: AppointmentStatus.CANCELLED_BY_SECRETARY
      });
      toast({
        title: "Turno cancelado",
        description: "El turno fue cancelado correctamente",
      });
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cancelar el turno. Intente nuevamente.",
      });
    }
  };

  const handleChangeStatus = async (id: number, status: AppointmentStatus) => {
    try {
      await changeStatus.mutateAsync({ id, status });
      toast({
        title: "Estado actualizado",
        description: "El estado del turno fue actualizado correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del turno",
      });
    }
  };

  const handleAppointmentCreated = () => {
    refetch();
  };

  return (
    <div id="appointments-section" className="space-y-4">
      {/* Header con botón de crear turno (solo Admin/Secretaria) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-greenPrimary" />
            Turnos del Paciente
          </h2>
          <p className="text-sm text-muted-foreground">
            Historial completo de citas médicas
          </p>
        </div>
        {canManageAppointments && (
          <CreateAppointmentDialog
            defaultPatientId={patientUserId}
            defaultPatient={patientData}
            onSuccess={handleAppointmentCreated}
            trigger={
              <Button className="bg-greenPrimary hover:bg-greenPrimary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Turno
              </Button>
            }
          />
        )}
      </div>

      {/* Cards de resumen */}
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
              {isLoading ? <Skeleton className="h-9 w-12" /> : upcomingAppointments.length}
            </div>
            <p className="text-sm text-muted-foreground">turnos agendados</p>
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
              {isLoading ? <Skeleton className="h-9 w-12" /> : pastAppointments.length}
            </div>
            <p className="text-sm text-muted-foreground">turnos pasados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de próximos/pasados */}
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
                  No hay turnos agendados
                </h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {canManageAppointments
                    ? "Cree un nuevo turno para este paciente"
                    : "El paciente no tiene citas programadas"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {upcomingAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    showActions={canManageAppointments}
                    onChangeStatus={canManageAppointments ? handleChangeStatus : undefined}
                    onDelete={canManageAppointments ? () => handleCancelClick(apt) : undefined}
                  />
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
              <div className="space-y-4 pr-4">
                {pastAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    showActions={false}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmación de cancelación */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {selectedAppointment && (
                  <div className="mt-2 space-y-1">
                    <p><strong>Paciente:</strong> {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
                    <p><strong>Fecha:</strong> {formatDateAR(selectedAppointment.date)}</p>
                    <p><strong>Hora:</strong> {formatTimeAR(selectedAppointment.hour)}</p>
                    <p><strong>Médico:</strong> {selectedAppointment.doctor ? formatDoctorName(selectedAppointment.doctor) : 'No especificado'}</p>
                  </div>
                )}
                <p className="mt-4 text-amber-600">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingStatus}>Volver</AlertDialogCancel>
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
    </div>
  );
};

export default AppointmentsSection;
