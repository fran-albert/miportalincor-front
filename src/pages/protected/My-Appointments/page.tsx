import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { RescheduleAppointmentDialog } from "@/components/Appointments/Dialogs/RescheduleAppointmentDialog";
import { usePatientAppointments, useReschedulePatientAppointment } from "@/hooks/Appointments";
import { useAppointmentMutations } from "@/hooks/Appointments";
import useUserRole from "@/hooks/useRoles";
import {
  AppointmentFullResponseDto,
  AppointmentStatus
} from "@/types/Appointment/Appointment";
import {
  formatDateAR,
  formatTimeAR,
  getMinutesUntilAppointment,
  isPastDateAR,
  isPastTimeAR
} from "@/common/helpers/timezone";
import { formatDoctorName } from "@/common/helpers/helpers";
import type { ApiError } from "@/types/Error/ApiError";
import { getAppointmentConsultationTypes } from "@/common/helpers/appointment-consultation-types";
import {
  Calendar,
  Clock,
  Stethoscope,
  ArrowLeft,
  XCircle,
  CalendarCheck,
  CalendarX,
  CalendarDays,
  Loader2,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

const CANCELLATION_WINDOW_HOURS = 24;

const MyAppointmentsPage = () => {
  const { toast } = useToast();
  const { session } = useUserRole();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFullResponseDto | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<AppointmentFullResponseDto | null>(null);

  const patientId = session?.id ? Number(session.id) : 0;

  const { appointments, isLoading } = usePatientAppointments({
    patientId,
    enabled: !!patientId
  });

  const { changeStatus, isChangingStatus } = useAppointmentMutations();
  const reschedulePatient = useReschedulePatientAppointment();

  const isAppointmentExpired = (apt: AppointmentFullResponseDto) => {
    return isPastDateAR(apt.date) || isPastTimeAR(apt.date, apt.hour);
  };

  const isTerminalStatus = (apt: AppointmentFullResponseDto) => {
    return (
      apt.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
      apt.status === AppointmentStatus.CANCELLED_BY_SECRETARY ||
      apt.status === AppointmentStatus.COMPLETED
    );
  };

  const shouldShowAsFinishedForPatient = (apt: AppointmentFullResponseDto) => {
    return isAppointmentExpired(apt) && !isTerminalStatus(apt);
  };

  // Separate upcoming and past appointments
  const upcomingAppointments = appointments.filter(
    apt => !isAppointmentExpired(apt) && !isTerminalStatus(apt)
  );

  const pastAppointments = appointments.filter(
    apt => isAppointmentExpired(apt) || isTerminalStatus(apt)
  );

  const canCancel = (apt: AppointmentFullResponseDto) => {
    return (
      !isAppointmentExpired(apt) &&
      (
        apt.status === AppointmentStatus.PENDING ||
        apt.status === AppointmentStatus.WAITING
      )
    );
  };

  // Misma regla que el backend: el paciente no puede cancelar con menos
  // de 24 hs de anticipación (secretaría sí puede).
  const isWithinCancellationWindow = (apt: AppointmentFullResponseDto) => {
    return getMinutesUntilAppointment(apt.date, apt.hour) < CANCELLATION_WINDOW_HOURS * 60;
  };

  const canReschedule = (apt: AppointmentFullResponseDto) => {
    return !isAppointmentExpired(apt) && apt.status === AppointmentStatus.PENDING;
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
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description:
          apiError.response?.data?.message ||
          "No se pudo cancelar el turno. Por favor intenta nuevamente.",
      });
    }
  };

  const AppointmentCardPatient = ({ appointment }: { appointment: AppointmentFullResponseDto }) => {
    const consultationTypes = getAppointmentConsultationTypes(appointment);
    const doctorName = appointment.doctor ? formatDoctorName(appointment.doctor) : "Médico no especificado";
    const primarySpeciality = appointment.doctor?.specialities?.[0]?.name;
    const isFinished = shouldShowAsFinishedForPatient(appointment);
    const isCancelled =
      appointment.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
      appointment.status === AppointmentStatus.CANCELLED_BY_SECRETARY;
    const showConsultationTypes = !isFinished && !isCancelled;
    const showActions = canReschedule(appointment) || canCancel(appointment);

    return (
      <Card
        className={cn(
          "overflow-hidden border-l-4 transition-shadow hover:shadow-sm",
          isCancelled || isFinished
            ? "border-l-slate-300 bg-slate-50/70"
            : "border-l-greenPrimary bg-white",
        )}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {isFinished ? (
                  <Badge
                    variant="outline"
                    className="border-0 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                  >
                    Finalizado
                  </Badge>
                ) : (
                  <StatusBadge status={appointment.status} />
                )}
                {showConsultationTypes &&
                  consultationTypes.map((consultationType) => (
                    <Badge
                      key={consultationType.id}
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: consultationType.color || undefined,
                        color: consultationType.color || undefined,
                        backgroundColor: consultationType.color
                          ? `${consultationType.color}12`
                          : undefined,
                      }}
                    >
                      {consultationType.name}
                    </Badge>
                  ))}
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-3 sm:bg-transparent sm:p-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fecha y hora
                </p>
                <div className="mt-2 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                  <div className="flex items-center gap-2 text-lg font-semibold leading-tight text-slate-950">
                    <Calendar className="h-5 w-5 shrink-0 text-greenPrimary" />
                    <span>{formatDateAR(appointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-800">
                    <Clock className="h-5 w-5 shrink-0 text-greenPrimary" />
                    <span>{formatTimeAR(appointment.hour)} hs</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 space-y-1">
                  <p className="break-words font-medium text-slate-900">{doctorName}</p>
                  {primarySpeciality && (
                    <Badge variant="secondary" className="text-xs">
                      {primarySpeciality}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {showActions && (
              <div className="grid gap-2 sm:min-w-[150px]">
                {canReschedule(appointment) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRescheduleAppointment(appointment);
                      setRescheduleDialogOpen(true);
                    }}
                    className="h-10 w-full justify-center text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Reprogramar
                  </Button>
                )}
                {canCancel(appointment) &&
                  (isWithinCancellationWindow(appointment) ? (
                    <div className="space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-10 w-full justify-center text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Para cancelar con menos de 24 hs comunicate con la clínica.
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelClick(appointment)}
                      className="h-10 w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mis Turnos" },
  ];

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <Helmet>
        <title>Mis Turnos</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Mis Turnos"
        description="Consultá y gestioná tus turnos médicos"
        icon={<Calendar className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => setRequestDialogOpen(true)}
              className="bg-greenPrimary hover:bg-greenPrimary/90 shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Solicitar Turno
            </Button>
            <Link to="/inicio">
              <Button variant="outline" className="shadow-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="flex-1">
        <TabsList className="grid w-full grid-cols-2 sm:max-w-md">
          <TabsTrigger value="upcoming" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <CalendarCheck className="h-4 w-4" />
            Próximos ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
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
            <div className="space-y-3 sm:space-y-4">
              {upcomingAppointments.map((apt) => (
                <AppointmentCardPatient key={apt.id} appointment={apt} />
              ))}
            </div>
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
            <div className="space-y-3 sm:space-y-4">
              {pastAppointments.map((apt) => (
                <AppointmentCardPatient key={apt.id} appointment={apt} />
              ))}
            </div>
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
                    <strong>Médico:</strong> {selectedAppointment.doctor ? formatDoctorName(selectedAppointment.doctor) : 'No especificado'}
                  </p>
                </div>
              )}
              <p className="mt-4 text-amber-600">
                Esta acción no se puede deshacer. Si querés cambiar la fecha u hora, usá el botón "Reprogramar".
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

      {/* Reschedule Appointment Dialog */}
      <RescheduleAppointmentDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        appointment={rescheduleAppointment}
        onReschedule={async (id, dto) => {
          await reschedulePatient.mutateAsync({ id, dto });
          toast({
            title: "Turno reprogramado",
            description: "Tu turno ha sido reprogramado exitosamente",
          });
          setRescheduleAppointment(null);
        }}
        isRescheduling={reschedulePatient.isPending}
      />
    </div>
  );
};

export default MyAppointmentsPage;
