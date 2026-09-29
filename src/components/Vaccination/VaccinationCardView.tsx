import { useId, useMemo, useState } from "react";
import { CheckCircle2, Edit, Loader2, Plus, Syringe, Trash2 } from "lucide-react";

import {
  formatVaccinationDate,
  getVaccinationCalendarOverview,
  sortApplicationsByAppliedDateDesc,
} from "@/common/helpers/vaccination-card.helpers";
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
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useVaccinationCatalog } from "@/hooks/Vaccination/useVaccinationCard";
import { useVaccinationMutations } from "@/hooks/Vaccination/useVaccinationMutations";
import type {
  VaccinationApplication,
  VaccinationCard,
  VaccinationVaccine,
} from "@/types/Vaccination/Vaccination";
import { VaccinationApplicationFormModal } from "./VaccinationApplicationFormModal";
import { VaccinationCalendarSection } from "./VaccinationCalendarSection";
import { VaccinationCardHeader } from "./VaccinationCardHeader";
import { VaccineIcon } from "./VaccineIcon";
import { formatDoseLabel, getVaccineDescription } from "./vaccine-visuals";

interface VaccinationCardViewProps {
  vaccinationCard: VaccinationCard;
  isDoctor?: boolean;
}

interface CarnetRow {
  application: VaccinationApplication;
  vaccine: Pick<VaccinationVaccine, "code" | "name" | "description">;
}

const FALLBACK_VACCINE: CarnetRow["vaccine"] = { code: "", name: "Vacuna" };

const getDoctorName = (application: VaccinationApplication) =>
  application.doctor
    ? `${application.doctor.firstName} ${application.doctor.lastName}`.trim()
    : "Sin dato";

function AppliedStatus() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800 ring-1 ring-inset ring-green-200">
      <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-green-600" />
      Aplicada
    </span>
  );
}

export function VaccinationCardView({
  vaccinationCard,
  isDoctor = false,
}: VaccinationCardViewProps) {
  const titleId = useId();
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

  const rows = useMemo<CarnetRow[]>(() => {
    const vaccineByRule = new Map(
      vaccinationCard.items.map((item) => [item.scheduleRuleId, item.vaccine])
    );
    return sortApplicationsByAppliedDateDesc(vaccinationCard.applications).map(
      (application) => ({
        application,
        vaccine:
          application.vaccine ??
          vaccineByRule.get(application.scheduleRuleId) ??
          FALLBACK_VACCINE,
      })
    );
  }, [vaccinationCard.applications, vaccinationCard.items]);

  const calendarOverview = useMemo(
    () => getVaccinationCalendarOverview(vaccinationCard.items),
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

  const renderActions = ({ application, vaccine }: CarnetRow) => {
    if (!isDoctor || !application.canEdit) return null;
    const label = `${vaccine.name} ${formatDoseLabel(application.doseLabel)}`;

    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-teal-200 text-teal-800 hover:bg-teal-50"
          aria-label={`Editar ${label}`}
          onClick={() => openEditModal(application)}
        >
          <Edit aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-red-700 hover:bg-red-50 hover:text-red-800"
          aria-label={`Eliminar ${label}`}
          onClick={() => setApplicationToDelete(application)}
        >
          <Trash2 aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
          Eliminar
        </Button>
      </div>
    );
  };

  const renderVaccineName = ({ application, vaccine }: CarnetRow) => {
    const description = getVaccineDescription(
      vaccine.code,
      vaccine.description
    );
    return (
      <div className="flex items-center gap-3">
        <VaccineIcon code={vaccine.code} />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{vaccine.name}</p>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
          {application.observations && (
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium">Observaciones:</span>{" "}
              {application.observations}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-greenPrimary"
      >
        <Syringe className="h-6 w-6" />
      </span>
      {isDoctor ? (
        <>
          <p className="font-medium text-slate-800">
            Todavía no hay vacunas cargadas para este paciente.
          </p>
          {canAddApplications && (
            <Button
              onClick={() => openCreateModal()}
              className="mt-4 bg-greenPrimary hover:bg-teal-800"
              disabled={isLoadingCatalog}
            >
              {isLoadingCatalog ? (
                <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
              )}
              Cargar la primera vacuna
            </Button>
          )}
        </>
      ) : (
        <p className="max-w-sm text-slate-700">
          Todavía no hay vacunas cargadas. Las carga tu médico en la consulta.
        </p>
      )}
    </div>
  );

  const headCell =
    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600";

  return (
    <div className="space-y-4">
      {canAddApplications && rows.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => openCreateModal()}
            className="bg-greenPrimary hover:bg-teal-800"
            disabled={isLoadingCatalog}
          >
            {isLoadingCatalog ? (
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            )}
            Cargar vacuna
          </Button>
        </div>
      )}

      <section
        aria-labelledby={titleId}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <VaccinationCardHeader
          titleId={titleId}
          patient={vaccinationCard.patient}
        />

        <div className="border-t border-slate-200">
          {rows.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <table className="hidden w-full text-sm md:table">
                <caption className="sr-only">Vacunas aplicadas</caption>
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th scope="col" className={`${headCell} text-left`}>
                      Vacuna
                    </th>
                    <th scope="col" className={`${headCell} text-center`}>
                      Fecha de aplicación
                    </th>
                    <th scope="col" className={`${headCell} text-center`}>
                      Dosis
                    </th>
                    {isDoctor && (
                      <th scope="col" className={`${headCell} text-left`}>
                        Médico
                      </th>
                    )}
                    <th scope="col" className={`${headCell} text-center`}>
                      Estado
                    </th>
                    {isDoctor && (
                      <th scope="col" className={`${headCell} text-right`}>
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.application.id}>
                      <td className="px-4 py-3">{renderVaccineName(row)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-base text-slate-800">
                        {formatVaccinationDate(row.application.appliedDate)}
                      </td>
                      <td className="px-4 py-3 text-center text-base text-slate-800">
                        {formatDoseLabel(row.application.doseLabel)}
                      </td>
                      {isDoctor && (
                        <td className="px-4 py-3 uppercase text-slate-700">
                          {getDoctorName(row.application)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <AppliedStatus />
                      </td>
                      {isDoctor && (
                        <td className="px-4 py-3">{renderActions(row)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul
                aria-label="Vacunas aplicadas"
                className="divide-y divide-slate-100 md:hidden"
              >
                {rows.map((row) => (
                  <li key={row.application.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      {renderVaccineName(row)}
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs font-medium uppercase text-slate-500">
                          Fecha
                        </dt>
                        <dd className="font-medium text-slate-900">
                          {formatVaccinationDate(row.application.appliedDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase text-slate-500">
                          Dosis
                        </dt>
                        <dd className="font-medium text-slate-900">
                          {formatDoseLabel(row.application.doseLabel)}
                        </dd>
                      </div>
                      {isDoctor && (
                        <div className="col-span-2">
                          <dt className="text-xs font-medium uppercase text-slate-500">
                            Médico
                          </dt>
                          <dd className="uppercase text-slate-800">
                            {getDoctorName(row.application)}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <AppliedStatus />
                      {renderActions(row)}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <VaccinationCalendarSection
        overview={calendarOverview}
        isDoctor={isDoctor}
        canAddApplications={canAddApplications}
        onAddFromCalendar={openCreateModal}
      />

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
              El registro dejará de verse en el carnet de vacunación del
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
