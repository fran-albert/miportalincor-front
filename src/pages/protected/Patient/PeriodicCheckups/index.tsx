import { useState } from "react";
import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { usePatientSchedules } from "@/hooks/Periodic-Checkup";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { AssignCheckupDialog } from "@/components/Patients/Dashboard/PeriodicCheckups/AssignCheckupDialog";
import { CompleteCheckupDialog } from "@/components/Patients/Dashboard/PeriodicCheckups/CompleteCheckupDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useDeletePatientSchedule } from "@/hooks/Periodic-Checkup";
import { useToastContext } from "@/hooks/Toast/toast-context";
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

const PatientPeriodicCheckupsPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = slugParts[slugParts.length - 1];

  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient({
    auth: true,
    id,
  });

  const { schedules, isLoading: isLoadingSchedules } = usePatientSchedules(patient?.userId);
  const { mutateAsync: deleteSchedule, isPending: isDeleting } = useDeletePatientSchedule(patient?.userId);
  const { showSuccess, showError } = useToastContext();

  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PatientCheckupSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<PatientCheckupSchedule | null>(null);

  const getStatusBadge = (schedule: PatientCheckupSchedule) => {
    const today = new Date();
    const dueDate = parseISO(schedule.nextDueDate);
    const daysUntilDue = differenceInDays(dueDate, today);

    if (daysUntilDue < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Vencido ({Math.abs(daysUntilDue)} días)
        </Badge>
      );
    }
    if (daysUntilDue <= 30) {
      return (
        <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          Próximo ({daysUntilDue} días)
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3" />
        Al día
      </Badge>
    );
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Sin registro";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    try {
      await deleteSchedule(scheduleToDelete.id);
      showSuccess("Chequeo eliminado correctamente");
      setScheduleToDelete(null);
    } catch {
      showError("Error al eliminar el chequeo");
    }
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
      href: `/pacientes/${patient?.slug}`,
    },
    {
      label: "Chequeos Periódicos",
      href: `/pacientes/${patient?.slug}/chequeos-periodicos`,
    },
  ];

  if (isLoadingPatient) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isLoadingPatient
            ? "Chequeos Periódicos"
            : `Chequeos Periódicos - ${patient?.firstName} ${patient?.lastName}`}
        </title>
        <meta
          name="description"
          content={`Chequeos periódicos del paciente ${patient?.firstName}.`}
        />
      </Helmet>

      {patientError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del paciente.
        </div>
      )}

      <div className="space-y-6 p-6">
        <BreadcrumbComponent items={breadcrumbItems} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Chequeos Periódicos
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {patient?.firstName} {patient?.lastName}
              </p>
            </div>
            <Button onClick={() => setShowAssignDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Chequeo
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarClock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay chequeos periódicos asignados</h3>
                <p className="mb-4">Asigna un chequeo periódico para hacer seguimiento del paciente.</p>
                <Button onClick={() => setShowAssignDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer chequeo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            {schedule.checkupType?.name || "Chequeo"}
                          </h4>
                          {getStatusBadge(schedule)}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {schedule.checkupType?.specialityName && (
                            <span className="mr-2">{schedule.checkupType.specialityName}</span>
                          )}
                          • Frecuencia: cada {schedule.checkupType?.frequencyMonths || 12} meses
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="block text-gray-500 text-xs uppercase tracking-wide">Último chequeo</span>
                            <span className="font-medium">{formatDate(schedule.lastCheckupDate)}</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="block text-gray-500 text-xs uppercase tracking-wide">Próximo chequeo</span>
                            <span className="font-medium">{formatDate(schedule.nextDueDate)}</span>
                          </div>
                          {schedule.notes && (
                            <div className="bg-gray-50 p-3 rounded md:col-span-2">
                              <span className="block text-gray-500 text-xs uppercase tracking-wide">Notas</span>
                              <span className="font-medium">{schedule.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSchedule(schedule)}
                        >
                          Completar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setScheduleToDelete(schedule)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignCheckupDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        patientId={patient?.userId || 0}
        existingSchedules={schedules}
      />

      {selectedSchedule && (
        <CompleteCheckupDialog
          open={!!selectedSchedule}
          onOpenChange={(open) => !open && setSelectedSchedule(null)}
          schedule={selectedSchedule}
          patientId={patient?.userId || 0}
          patientName={`${patient?.firstName} ${patient?.lastName}`}
        />
      )}

      <AlertDialog open={!!scheduleToDelete} onOpenChange={(open) => !open && setScheduleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar chequeo periódico</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el chequeo "{scheduleToDelete?.checkupType?.name}"?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchedule}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PatientPeriodicCheckupsPage;
