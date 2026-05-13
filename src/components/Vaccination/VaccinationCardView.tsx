import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  Syringe,
  Trash2,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useVaccinationCatalog } from "@/hooks/Vaccination/useVaccinationCard";
import { useVaccinationMutations } from "@/hooks/Vaccination/useVaccinationMutations";
import type {
  VaccinationApplication,
  VaccinationCard,
  VaccinationCardItem,
} from "@/types/Vaccination/Vaccination";
import { VaccinationApplicationFormModal } from "./VaccinationApplicationFormModal";

interface VaccinationCardViewProps {
  vaccinationCard: VaccinationCard;
  isDoctor?: boolean;
}

type AppliedVaccinationCardItem = VaccinationCardItem & {
  application: VaccinationApplication;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

const getDoctorName = (application?: VaccinationApplication) => {
  if (!application?.doctor) return "-";
  return `${application.doctor.firstName} ${application.doctor.lastName}`;
};

export function VaccinationCardView({
  vaccinationCard,
  isDoctor = false,
}: VaccinationCardViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<VaccinationApplication | null>(null);
  const [initialScheduleRuleId, setInitialScheduleRuleId] = useState<
    string | undefined
  >();
  const [applicationToDelete, setApplicationToDelete] =
    useState<VaccinationApplication | null>(null);

  const canAddApplications =
    isDoctor && vaccinationCard.canAddApplications === true;
  const { catalog, isLoading: isLoadingCatalog } =
    useVaccinationCatalog(canAddApplications);
  const { deleteApplicationMutation } = useVaccinationMutations();
  const { showSuccess, showError } = useToastContext();

  const appliedItems = useMemo(
    () =>
      vaccinationCard.items
        .filter(
          (item): item is AppliedVaccinationCardItem =>
            item.application !== undefined
        )
        .sort((left, right) =>
          right.application.appliedDate.localeCompare(
            left.application.appliedDate
          )
        ),
    [vaccinationCard.items]
  );

  const openCreateModal = (scheduleRuleId?: string) => {
    setSelectedApplication(null);
    setInitialScheduleRuleId(scheduleRuleId);
    setIsFormOpen(true);
  };

  const openEditModal = (application: VaccinationApplication) => {
    setSelectedApplication(application);
    setInitialScheduleRuleId(undefined);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setSelectedApplication(null);
    setInitialScheduleRuleId(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      await deleteApplicationMutation.mutateAsync({
        applicationId: applicationToDelete.id,
      });
      showSuccess("Vacuna eliminada correctamente");
      setApplicationToDelete(null);
    } catch {
      showError("Error al eliminar la vacuna");
    }
  };

  const renderApplicationActions = (item: AppliedVaccinationCardItem) => {
    const application = item.application;

    if (!isDoctor || !application.canEdit) {
      return null;
    }

    return (
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
          aria-label={`Editar ${item.vaccine.name} ${item.doseLabel}`}
          onClick={() => openEditModal(application)}
        >
          <Edit className="mr-1 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
          aria-label={`Eliminar ${item.vaccine.name} ${item.doseLabel}`}
          onClick={() => setApplicationToDelete(application)}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>
    );
  };

  const renderVaccinationCard = (item: AppliedVaccinationCardItem) => (
    <Card key={item.scheduleRuleId} className="border-gray-200 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-950">
              {item.vaccine.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{item.doseLabel}</p>
          </div>
          <Badge variant="success" className="gap-1 whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3" />
            Aplicada
          </Badge>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Fecha</p>
            <p className="mt-1 font-medium text-gray-900">
              {formatDate(item.application.appliedDate)}
            </p>
          </div>
          {item.application.doctor && (
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Medico
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {getDoctorName(item.application)}
              </p>
            </div>
          )}
        </div>

        {item.application.observations && (
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Observaciones
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {item.application.observations}
            </p>
          </div>
        )}

        {renderApplicationActions(item)}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Syringe className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-950">
            Carnet de vacunacion
          </h2>
        </div>

        {canAddApplications && (
          <Button
            onClick={() => openCreateModal()}
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoadingCatalog}
          >
            {isLoadingCatalog ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Cargar vacuna
          </Button>
        )}
      </div>

      {appliedItems.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Syringe className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            No hay vacunas aplicadas cargadas
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {appliedItems.map(renderVaccinationCard)}
        </div>
      )}

      <VaccinationApplicationFormModal
        isOpen={isFormOpen}
        onClose={closeFormModal}
        patientUserId={vaccinationCard.patientUserId}
        catalog={catalog}
        application={selectedApplication}
        initialScheduleRuleId={initialScheduleRuleId}
      />

      <AlertDialog
        open={Boolean(applicationToDelete)}
        onOpenChange={(open) => {
          if (!open) setApplicationToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar vacuna aplicada</AlertDialogTitle>
            <AlertDialogDescription>
              El registro dejara de verse en el carnet de vacunacion del
              paciente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
