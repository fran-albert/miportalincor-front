import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  ClipboardList,
  Eye,
  FileCheck,
  FolderOpen,
  HeartPulse,
  Stethoscope,
  Trash2,
  UserRoundPen,
} from "lucide-react";
import CollaboratorInformationCard from "../Collaborator-Information";
import GeneralTab from "@/components/Tabs/Pre-Occupational/General";
import MedicalHistoryTab from "@/components/Tabs/Pre-Occupational/Medical-History";
import { useBeforeUnload, useBlocker, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  hydrateFormData,
  hydrateReportVisibilityOverrides,
  resetForm,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";
import { useGetAllUrlsByCollaboratorAndMedicalEvaluation } from "@/hooks/Study/useGetAllUrlsByCollaboratorAndMedicalEvaluation";
import { useDataValuesByMedicalEvaluationId } from "@/hooks/Data-Values/useDataValues";
import LoadingAnimation from "@/components/Loading/loading";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import ReportVersioningCard from "../Report-Versioning";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RootState } from "@/store/store";
import VariousTab from "@/components/Tabs/Pre-Occupational/Various";
import { useDoctorWithSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { useCurrentMedicalEvaluationReport } from "@/hooks/Medical-Evaluation-Report-Version/useCurrentMedicalEvaluationReport";
import { ReportStatusBadge } from "@/components/Pre-Occupational/Report-Versioning/report-status";
import { mapExamResults } from "@/common/helpers/examsResults.maps";
import {
  getPreferredDataValueByPossibleNames,
  hasSectionData,
  mapMedicalEvaluation,
  mapOccupationalHistory,
} from "@/common/helpers/maps";
import {
  normalizeReportVisibilityOverrides,
  ReportVisibilityOverrides,
} from "@/common/helpers/report-visibility";
import type {
  IMedicalEvaluation,
  OccupationalHistoryItem,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { DoctorSelect } from "@/components/Select/Doctor/select";
import { useForm } from "react-hook-form";
import { getMedicalEvaluationMaintenanceState } from "@/api/Medical-Evaluation/get-maintenance-state.medical.evaluation";
import { updateMedicalEvaluation } from "@/api/Medical-Evaluation/update.medical.evaluation";
import { deleteMedicalEvaluation } from "@/api/Medical-Evaluation/delete.medical.evaluation";
import useLaboralPermissions from "@/hooks/Laboral/useLaboralPermissions";

interface Props {
  slug: string;
  collaborator: Collaborator;
  medicalEvaluation: MedicalEvaluation;
}

type ExamStageKey =
  | "details"
  | "antecedents"
  | "general"
  | "history"
  | "studies"
  | "closing";

const normalizeOccupationalHistory = (
  items: OccupationalHistoryItem[] | undefined
) =>
  (items ?? [])
    .map((item) => item.description.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

const hasSavedGeneralData = (formData: {
  examResults: Record<string, string>;
  conclusion: string;
  recomendaciones: string;
}) =>
  Object.values(formData.examResults).some((value) => value.trim() !== "") ||
  formData.conclusion.trim() !== "" ||
  formData.recomendaciones.trim() !== "";

const hasSavedMedicalEvaluationData = (
  medicalEvaluation: IMedicalEvaluation | null
) => {
  if (!medicalEvaluation) return false;

  if (medicalEvaluation.aspectoGeneral.trim() !== "") return true;
  if (medicalEvaluation.tiempoLibre.trim() !== "") return true;
  if (Object.values(medicalEvaluation.examenClinico).some((value) => value !== "")) {
    return true;
  }
  if (
    medicalEvaluation.agudezaSc.right.trim() !== "" ||
    medicalEvaluation.agudezaSc.left.trim() !== "" ||
    medicalEvaluation.agudezaCc.right.trim() !== "" ||
    medicalEvaluation.agudezaCc.left.trim() !== "" ||
    (medicalEvaluation.notasVision ?? "").trim() !== ""
  ) {
    return true;
  }

  return [
    medicalEvaluation.piel,
    medicalEvaluation.cabezaCuello,
    medicalEvaluation.bucodental,
    medicalEvaluation.torax,
    medicalEvaluation.respiratorio,
    medicalEvaluation.circulatorio,
    medicalEvaluation.neurologico,
    medicalEvaluation.gastrointestinal,
    medicalEvaluation.genitourinario,
    medicalEvaluation.osteoarticular,
  ].some((section) => hasSectionData(section));
};

export default function PreOccupationalCards({
  slug,
  collaborator,
  medicalEvaluation,
}: Props) {
  const { canManageLaboralExam, canDeleteLaboralExam } = useLaboralPermissions();
  const {
    data: urls,
    isLoading: isLoadingUrls,
    isError: isErrorUrls,
  } = useGetAllUrlsByCollaboratorAndMedicalEvaluation({
    auth: true,
    collaboratorId: collaborator.id,
    medicalEvaluationId: medicalEvaluation.id,
  });
 
  const { data: fields, isLoading: isLoadingFields } = useDataTypes({
    auth: true,
    fetch: true,
    categories: [
      "GENERAL",
      "APTITUDES",
      "ESTUDIOS",
      "HISTORIA_MEDICA",
      "ANTECEDENTES",
      "EXAMEN_CLINICO",
      "EXAMEN_FISICO",
      "MEDICION",
      "EVOLUCION",
    ],
  });

  const {
    data: dataValues,
    isLoading: isLoadingValues,
    isError: isErrorValues,
  } = useDataValuesByMedicalEvaluationId({
    auth: true,
    id: medicalEvaluation.id,
  });

  const [activeStage, setActiveStage] = useState<ExamStageKey>("details");
  const [isEditing] = useState(true);
  const [hasGeneralUnsavedChanges, setHasGeneralUnsavedChanges] = useState(false);
  const [generalFormData, setGeneralFormData] = useState<{
    examResults: Record<string, string>;
    conclusion: string;
    recomendaciones: string;
  }>({
    examResults: {},
    conclusion: "",
    recomendaciones: "",
  });
  const [savedGeneralFormData, setSavedGeneralFormData] = useState<{
    examResults: Record<string, string>;
    conclusion: string;
    recomendaciones: string;
  }>({
    examResults: {},
    conclusion: "",
    recomendaciones: "",
  });
  const [savedOccupationalHistory, setSavedOccupationalHistory] = useState<
    OccupationalHistoryItem[]
  >([]);
  const [savedMedicalEvaluation, setSavedMedicalEvaluation] =
    useState<IMedicalEvaluation | null>(null);
  const [savedReportVisibilityOverrides, setSavedReportVisibilityOverrides] =
    useState<ReportVisibilityOverrides>({});
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { promiseToast } = useToastContext();
  const doctorForm = useForm<{ DoctorId: string }>({
    defaultValues: { DoctorId: "" },
  });
  const occupationalHistory = useSelector(
    (state: RootState) => state.preOccupational.formData.occupationalHistory
  );
  const currentMedicalEvaluation = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );
  const reportVisibilityOverrides = useSelector(
    (state: RootState) => state.preOccupational.reportVisibilityOverrides
  );
  const hasAntecedentsUnsavedChanges =
    JSON.stringify(normalizeOccupationalHistory(occupationalHistory)) !==
    JSON.stringify(normalizeOccupationalHistory(savedOccupationalHistory));
  const hasMedicalHistoryUnsavedChanges =
    JSON.stringify(currentMedicalEvaluation) !==
    JSON.stringify(savedMedicalEvaluation);
  const currentReportVisibilityOverrides = normalizeReportVisibilityOverrides(
    reportVisibilityOverrides
  );
  const hasReportVisibilityUnsavedChanges =
    JSON.stringify(currentReportVisibilityOverrides) !==
    JSON.stringify(savedReportVisibilityOverrides);
  const hasAntecedentsSavedData =
    normalizeOccupationalHistory(savedOccupationalHistory).length > 0;
  const hasUnsavedChanges =
    hasAntecedentsUnsavedChanges ||
    hasMedicalHistoryUnsavedChanges ||
    hasReportVisibilityUnsavedChanges ||
    hasGeneralUnsavedChanges;
  const blocker = useBlocker(hasUnsavedChanges);
  const previewHref = `/incor-laboral/colaboradores/${slug}/examen/${medicalEvaluation.id}/previsualizar-informe`;
  const doctorQueryId = medicalEvaluation.doctorId
    ? String(medicalEvaluation.doctorId)
    : "";
  const examDate = medicalEvaluation.createdAt
    ? format(new Date(medicalEvaluation.createdAt), "dd/MM/yyyy", {
        locale: es,
      })
    : new Date().toLocaleDateString("es-AR");
  const setIsEditing = () => undefined;
  const studiesCategory = useMemo(
    () => fields?.filter((f) => f.category === "ESTUDIOS") ?? [],
    [fields]
  );
  const hasGeneralSavedData = useMemo(
    () => hasSavedGeneralData(savedGeneralFormData),
    [savedGeneralFormData]
  );
  const hasMedicalHistorySavedData = useMemo(
    () => hasSavedMedicalEvaluationData(savedMedicalEvaluation),
    [savedMedicalEvaluation]
  );
  const {
    data: doctorData,
    isError: isDoctorLookupError,
  } = useDoctorWithSignatures({
    id: doctorQueryId,
    auth: Boolean(doctorQueryId),
  });
  const { doctors } = useDoctors({ auth: true, fetchDoctors: true });
  const matchedDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.userId) === doctorQueryId),
    [doctors, doctorQueryId]
  );
  const { currentVersion, hasLegacyCurrentReport, hasReport } =
    useCurrentMedicalEvaluationReport({
      auth: true,
      collaboratorId: collaborator.id,
      medicalEvaluationId: medicalEvaluation.id,
    });
  const {
    data: maintenanceState,
    isLoading: isLoadingMaintenanceState,
  } = useQuery({
    queryKey: ["medical-evaluation-maintenance", medicalEvaluation.id],
    queryFn: () => getMedicalEvaluationMaintenanceState(medicalEvaluation.id),
    enabled: medicalEvaluation.id > 0,
    staleTime: 0,
  });
  const updateMedicalEvaluationMutation = useMutation({
    mutationFn: ({ id, doctorId }: { id: number; doctorId: number }) =>
      updateMedicalEvaluation(id, { doctorId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["medical-evaluation", medicalEvaluation.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["medical-evaluation-maintenance", medicalEvaluation.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["collaborator-medical-evaluation", collaborator.id],
        }),
      ]);
    },
  });
  const deleteMedicalEvaluationMutation = useMutation({
    mutationFn: (id: number) => deleteMedicalEvaluation(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["collaborator-medical-evaluation", collaborator.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["medical-evaluation-maintenance", medicalEvaluation.id],
        }),
      ]);
    },
  });

  // Reset form when medical evaluation changes (switching patients)
  useEffect(() => {
    dispatch(resetForm());
  }, [medicalEvaluation.id, dispatch]);

  useEffect(() => {
    const generalStrings = (dataValues ?? []).filter(
      (dataValue) =>
        dataValue.dataType.dataType === "STRING" &&
        dataValue.dataType.category === "GENERAL"
    );
    const hydratedOccupationalHistory = mapOccupationalHistory(dataValues ?? []);
    const hydratedMedicalEvaluation = mapMedicalEvaluation(dataValues ?? []);
    const examResults = mapExamResults(generalStrings);
    const conclusion = String(
      getPreferredDataValueByPossibleNames(dataValues ?? [], [
        "Conclusion",
        "Conclusión",
        "Aptitud",
        "Aptitudes",
      ])?.value ?? ""
    );
    const recomendaciones = String(
      getPreferredDataValueByPossibleNames(dataValues ?? [], [
        "Recomendaciones",
        "Recomendación",
      ])?.value ?? ""
    );
    const hydratedState = {
      examResults,
      conclusion,
      recomendaciones,
    };
    const hydratedReportVisibilityOverrides = normalizeReportVisibilityOverrides(
      medicalEvaluation.reportVisibilityOverrides
    );
    setSavedOccupationalHistory(hydratedOccupationalHistory);
    setSavedMedicalEvaluation(hydratedMedicalEvaluation);
    setSavedReportVisibilityOverrides(hydratedReportVisibilityOverrides);
    dispatch(
      hydrateFormData({
        occupationalHistory: hydratedOccupationalHistory,
        medicalEvaluation: hydratedMedicalEvaluation,
      })
    );
    dispatch(
      hydrateReportVisibilityOverrides(hydratedReportVisibilityOverrides)
    );

    setGeneralFormData(hydratedState);
    setSavedGeneralFormData(hydratedState);
  }, [dataValues, dispatch, medicalEvaluation.id, medicalEvaluation.reportVisibilityOverrides]);

  useEffect(() => {
    setHasGeneralUnsavedChanges(
      JSON.stringify(generalFormData) !== JSON.stringify(savedGeneralFormData)
    );
  }, [generalFormData, savedGeneralFormData]);

  useEffect(() => {
    doctorForm.reset({
      DoctorId: doctorQueryId,
    });
  }, [doctorForm, doctorQueryId, isDoctorDialogOpen]);

  useBeforeUnload(
    (event) => {
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      event.returnValue = "";
    },
    { capture: true }
  );

  if (isLoadingUrls || isLoadingValues || isLoadingFields) {
    return <LoadingAnimation />;
  }
  if (isErrorUrls || isErrorValues) {
    return <div>Error cargando datos</div>;
  }

  const stages = [
    {
      key: "details" as const,
      label: "Datos del examen",
      description: "Colaborador, médico y fecha",
      icon: ClipboardList,
      status: "Guardado",
    },
    {
      key: "antecedents" as const,
      label: "Antecedentes",
      description: "Historia ocupacional previa",
      icon: HeartPulse,
      status: hasAntecedentsUnsavedChanges
        ? "En curso"
        : hasAntecedentsSavedData
          ? "Guardado"
          : "Pendiente",
    },
    {
      key: "general" as const,
      label: "Resultados y conclusión",
      icon: Stethoscope,
      description: "Resultados, conclusión y recomendaciones",
      status: hasGeneralUnsavedChanges
        ? "En curso"
        : hasGeneralSavedData
          ? "Guardado"
          : "Pendiente",
    },
    {
      key: "history" as const,
      label: "Historia médica y físico",
      description: "Examen físico y sistemas",
      icon: Stethoscope,
      status: hasMedicalHistoryUnsavedChanges
        ? "En curso"
        : hasMedicalHistorySavedData
          ? "Guardado"
          : "Pendiente",
    },
    {
      key: "studies" as const,
      label: "Estudios",
      description: "Archivos por categoría",
      icon: FolderOpen,
      status: urls && urls.length > 0 ? "Guardado" : "Pendiente",
    },
    {
      key: "closing" as const,
      label: "Cierre e informe",
      description: "Informe actual y regeneración",
      icon: FileCheck,
      status: hasReport ? "Guardado" : "Pendiente",
    },
  ];

  const currentStageIndex = stages.findIndex((stage) => stage.key === activeStage);
  const nextStage = stages[currentStageIndex + 1];
  const getStageStatusClasses = (status: string) => {
    switch (status) {
      case "Guardado":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "En curso":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-slate-200 bg-slate-100 text-slate-600";
    }
  };

  const handleConfirmDoctorUpdate = async () => {
    const nextDoctorId = Number(doctorForm.getValues("DoctorId"));

    if (!nextDoctorId || Number.isNaN(nextDoctorId)) {
      return;
    }

    const mutationPromise = updateMedicalEvaluationMutation.mutateAsync({
      id: medicalEvaluation.id,
      doctorId: nextDoctorId,
    });

    try {
      await promiseToast(mutationPromise, {
        loading: {
          title: "Corrigiendo médico",
          description: "Estamos actualizando el médico firmante del examen.",
        },
        success: {
          title: "Médico actualizado",
          description:
            "El examen ya quedó asociado al nuevo médico firmante.",
        },
        error: {
          title: "No se pudo corregir el médico",
          description:
            "Revisá el médico seleccionado e intentá nuevamente.",
        },
      });
      setIsDoctorDialogOpen(false);
    } catch (error) {
      console.error("Error updating exam doctor", error);
    }
  };

  const handleConfirmDelete = async () => {
    const deletePromise = deleteMedicalEvaluationMutation.mutateAsync(
      medicalEvaluation.id
    );

    try {
      await promiseToast(deletePromise, {
        loading: {
          title: "Eliminando examen",
          description: "Estamos eliminando el examen y su contenido asociado.",
        },
        success: {
          title: "Examen eliminado",
          description: "El examen se eliminó correctamente.",
        },
        error: {
          title: "No se pudo eliminar el examen",
          description:
            maintenanceState?.deleteReasons?.[0] ||
            "El backend bloqueó la eliminación por seguridad.",
        },
      });
      setIsDeleteDialogOpen(false);
      navigate(`/incor-laboral/colaboradores/${slug}/examenes`);
    } catch (error) {
      console.error("Error deleting medical evaluation", error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto space-y-4">
        <AlertDialog
          open={blocker.state === "blocked"}
          onOpenChange={(open) => {
            if (!open && blocker.state === "blocked") {
              blocker.reset?.();
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tenés cambios sin guardar</AlertDialogTitle>
              <AlertDialogDescription>
                Si salís ahora, vas a perder la edición en curso de este
                examen. Guardá primero o confirmá que querés salir igual.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => blocker.reset?.()}>
                Seguir editando
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => blocker.proceed?.()}>
                Salir sin guardar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={isDoctorDialogOpen} onOpenChange={setIsDoctorDialogOpen}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>Corregir médico firmante</DialogTitle>
              <DialogDescription>
                Usá esta acción cuando el examen haya quedado con un médico
                incorrecto o con un `doctorId` que no resuelve en Historia
                Clínica.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {doctorQueryId ? (
                  <div className="space-y-1">
                    <div>
                      Médico actual:{" "}
                      <span className="font-semibold">
                        {isDoctorLookupError
                          ? `doctorId ${doctorQueryId} no válido para firma`
                          : doctorData?.fullName || `doctorId ${doctorQueryId}`}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {matchedDoctor
                        ? `HC hoy devuelve ${matchedDoctor.lastName}, ${matchedDoctor.firstName} con userId ${matchedDoctor.userId}.`
                        : doctorQueryId
                          ? `HC hoy no devuelve ningún médico con userId ${doctorQueryId}.`
                          : ""}
                    </div>
                  </div>
                ) : (
                  "Este examen no tiene médico asignado."
                )}
              </div>
              <DoctorSelect control={doctorForm.control} />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDoctorDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDoctorUpdate}
                disabled={updateMedicalEvaluationMutation.isPending}
              >
                {updateMedicalEvaluationMutation.isPending
                  ? "Guardando..."
                  : "Guardar médico"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Eliminar examen</DialogTitle>
              <DialogDescription>
                Esta acción intenta eliminar el examen completo, no solo
                ocultarlo de la lista.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-sm text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                {isLoadingMaintenanceState ? (
                  "Revisando validaciones del examen..."
                ) : (
                  <div className="space-y-1">
                    <div>
                      Completado:{" "}
                      <span className="font-semibold">
                        {maintenanceState?.completed ? "Sí" : "No"}
                      </span>
                    </div>
                    <div>
                      Tiene estudios o informe:{" "}
                      <span className="font-semibold">
                        {maintenanceState?.hasStudies ? "Sí" : "No"}
                      </span>
                    </div>
                    <div>
                      Tiene datos clínicos cargados:{" "}
                      <span className="font-semibold">
                        {maintenanceState?.hasClinicalData ? "Sí" : "No"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {maintenanceState?.deleteReasons?.length ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-900">
                  <div className="font-semibold">
                    No se puede eliminar este examen
                  </div>
                  <ul className="mt-2 list-disc pl-5">
                    {maintenanceState.deleteReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                  Esta acción borra el examen y sus datos asociados. Usala solo
                  si el examen quedó creado por error.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={
                  isLoadingMaintenanceState ||
                  !maintenanceState?.canDelete ||
                  deleteMedicalEvaluationMutation.isPending
                }
              >
                {deleteMedicalEvaluationMutation.isPending
                  ? "Eliminando..."
                  : "Eliminar examen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Examen laboral
                  </div>
                  <div className="text-xl font-semibold text-greenPrimary">
                    {medicalEvaluation.evaluationType.name}
                  </div>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Colaborador
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {collaborator.firstName} {collaborator.lastName}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Médico asignado
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {!doctorQueryId
                        ? "Sin médico asignado"
                        : isDoctorLookupError
                          ? "Médico no válido para firma"
                          : doctorData?.fullName || "Cargando médico"}
                    </div>
                    {doctorQueryId ? (
                      <div className="mt-1 text-xs text-slate-500">
                        {isDoctorLookupError
                          ? matchedDoctor
                            ? `doctorId ${doctorQueryId} existe en HC, pero falló la firma/sello`
                            : `doctorId ${doctorQueryId} no existe hoy en Historia Clínica`
                          : `doctorId ${doctorQueryId}`}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Fecha de creación
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {examDate}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Informe actual
                    </div>
                    <div className="mt-1">
                      <ReportStatusBadge
                        version={currentVersion}
                        hasLegacyReport={hasLegacyCurrentReport}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {canManageLaboralExam ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsDoctorDialogOpen(true)}
                  >
                    <UserRoundPen className="mr-2 h-4 w-4" />
                    Corregir médico
                  </Button>
                ) : null}
                {canDeleteLaboralExam ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar examen
                  </Button>
                ) : null}
                {nextStage ? (
                  <Button
                    size="sm"
                    className="border border-greenPrimary/10 bg-gradient-to-r from-greenSecondary via-greenPrimary to-incor text-white shadow-[0_16px_30px_-18px_rgba(12,72,74,0.9)] hover:from-greenSecondary hover:via-greenSecondary hover:to-greenPrimary"
                    onClick={() => setActiveStage(nextStage.key)}
                  >
                    Continuar con {nextStage.label}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="border border-greenPrimary/10 bg-gradient-to-r from-greenSecondary via-greenPrimary to-incor text-white shadow-[0_16px_30px_-18px_rgba(12,72,74,0.9)] hover:from-greenSecondary hover:via-greenSecondary hover:to-greenPrimary"
                    onClick={() => navigate(previewHref)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ir a previsualización
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {stages.map((stage) => {
                const Icon = stage.icon;
                const isActive = activeStage === stage.key;

                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => setActiveStage(stage.key)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      isActive
                        ? "border-greenPrimary bg-greenPrimary/5 shadow-sm"
                        : "border-slate-200 bg-white hover:border-greenPrimary/30 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex min-h-[104px] flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-greenPrimary">
                          <Icon className="h-4 w-4" />
                          {stage.label}
                        </div>
                        <p className="text-xs leading-5 text-slate-500">
                          {stage.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-end">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStageStatusClasses(
                            stage.status
                          )}`}
                        >
                          {stage.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {activeStage === "details" && (
          <div className="space-y-3">
            <CollaboratorInformationCard collaborator={collaborator} />
          </div>
        )}

        {activeStage === "general" && (
          <GeneralTab
            standalone
            showEditToggle={false}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            formData={generalFormData}
            savedFormData={savedGeneralFormData}
            setFormData={setGeneralFormData}
            setSavedFormData={setSavedGeneralFormData}
            medicalEvaluationId={medicalEvaluation.id}
            dataValues={dataValues}
            fields={fields ?? []}
          />
        )}

        {activeStage === "antecedents" && (
          <MedicalHistoryTab
            standalone
            showEditToggle={false}
            isEditing={isEditing}
            dataValues={dataValues}
            medicalEvaluationId={medicalEvaluation.id}
            setIsEditing={setIsEditing}
            includeOccupationalHistory
            includeMedicalEvaluation={false}
            savedOccupationalHistory={savedOccupationalHistory}
            setSavedOccupationalHistory={setSavedOccupationalHistory}
          />
        )}

        {activeStage === "history" && (
          <MedicalHistoryTab
            standalone
            showEditToggle={false}
            isEditing={isEditing}
            dataValues={dataValues}
            medicalEvaluationId={medicalEvaluation.id}
            setIsEditing={setIsEditing}
            includeOccupationalHistory={false}
            includeMedicalEvaluation
            savedMedicalEvaluation={savedMedicalEvaluation}
            setSavedMedicalEvaluation={setSavedMedicalEvaluation}
            savedReportVisibilityOverrides={savedReportVisibilityOverrides}
            setSavedReportVisibilityOverrides={setSavedReportVisibilityOverrides}
          />
        )}

        {activeStage === "studies" && (
          <VariousTab
            standalone
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            studiesCategory={studiesCategory}
            medicalEvaluationId={medicalEvaluation.id}
            collaborator={collaborator}
            urls={urls ?? []}
            dataValues={dataValues}
          />
        )}

        {activeStage === "closing" && (
          <div className="space-y-3">
            <ReportVersioningCard
              collaborator={collaborator}
              medicalEvaluationId={medicalEvaluation.id}
              previewHref={previewHref}
            />
          </div>
        )}
      </div>
    </div>
  );
}
