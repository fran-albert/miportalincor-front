import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useCurrentPlan } from "@/hooks/Program/useCurrentPlan";
import { useClinicalIntakeMutations } from "@/hooks/Program/useClinicalIntakeMutations";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import { FrequencyPeriod, ScheduleType } from "@/types/Program/ProgramPlan";
import {
  MedicalEvaluationResponse,
  NextControlSchedule,
  NextControlScheduleLabels,
  TherapeuticExerciseType,
  TherapeuticExerciseTypeLabels,
  UpsertMedicalEvaluationDto,
} from "@/types/Program/ProgramClinicalIntake";
import { getArgentinaTodayDate } from "@/common/helpers/argentinaDate";
import PainScaleInput from "./PainScaleInput";

interface MedicalEvaluationDialogProps {
  enrollmentId: string;
  activities: ProgramActivity[];
  evaluation: MedicalEvaluationResponse | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface ReferralRowState {
  included: boolean;
  frequencyCount: number;
  totalSessions: string;
  therapeuticGoal: string;
  exerciseTypes: TherapeuticExerciseType[];
  notes: string;
}

const emptyRow: ReferralRowState = {
  included: false,
  frequencyCount: 2,
  totalSessions: "",
  therapeuticGoal: "",
  exerciseTypes: [],
  notes: "",
};

const PAIN_MIN = 1;
const PAIN_MAX = 10;

/**
 * La ficha de papel de la Unidad Integral del Dolor, en pantalla y en el mismo
 * orden. Va con estado propio (no react-hook-form) porque incorpora la misma
 * grilla por actividad que `CreatePlanVersionDialog`, su hermano directo:
 * mezclar dos sistemas de formulario en un solo diálogo sería peor que
 * cualquiera de los dos.
 */
export default function MedicalEvaluationDialog({
  enrollmentId,
  activities,
  evaluation,
  isOpen,
  setIsOpen,
}: MedicalEvaluationDialogProps) {
  const { currentPlan } = useCurrentPlan(enrollmentId);
  const { createEvaluationMutation, updateEvaluationMutation } =
    useClinicalIntakeMutations(enrollmentId);
  const { promiseToast } = useToastContext();

  const isEdit = Boolean(evaluation);
  const activeActivities = activities.filter((activity) => activity.isActive);

  const [evaluatedAt, setEvaluatedAt] = useState(getArgentinaTodayDate);
  const [diagnosis, setDiagnosis] = useState("");
  const [initialScore, setInitialScore] = useState<number | null>(null);
  const [pharmacologicalTreatment, setPharmacologicalTreatment] = useState("");
  const [contraindications, setContraindications] = useState("");
  const [nextControlSchedule, setNextControlSchedule] = useState<
    NextControlSchedule | ""
  >("");
  const [nextControlDate, setNextControlDate] = useState("");
  const [rows, setRows] = useState<Record<string, ReferralRowState>>({});
  const [editReferral, setEditReferral] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setEvaluatedAt(evaluation?.evaluatedAt ?? getArgentinaTodayDate());
    setDiagnosis(evaluation?.diagnosis ?? "");
    setInitialScore(evaluation?.initialScore ?? null);
    setPharmacologicalTreatment(evaluation?.pharmacologicalTreatment ?? "");
    setContraindications(evaluation?.contraindications ?? "");
    setNextControlSchedule(evaluation?.nextControlSchedule ?? "");
    setNextControlDate(evaluation?.nextControlDate ?? "");
    setError(null);
    // Al crear la ficha la derivación es obligatoria; al editarla sólo se
    // reemplaza el plan si el médico lo pide (crea una versión nueva).
    setEditReferral(!evaluation);

    const planned = currentPlan?.activities ?? [];
    const nextRows: Record<string, ReferralRowState> = {};
    for (const activity of activities.filter((item) => item.isActive)) {
      const match = planned.find((item) => item.activityId === activity.id);
      nextRows[activity.id] = match
        ? {
            included: true,
            frequencyCount: match.frequencyCount ?? emptyRow.frequencyCount,
            totalSessions: match.totalSessions
              ? String(match.totalSessions)
              : "",
            therapeuticGoal: match.therapeuticGoal ?? "",
            exerciseTypes: match.exerciseTypes ?? [],
            notes: match.notes ?? "",
          }
        : { ...emptyRow };
    }
    setRows(nextRows);
  }, [isOpen, evaluation, activities, currentPlan]);

  const updateRow = (activityId: string, patch: Partial<ReferralRowState>) => {
    setRows((prev) => ({
      ...prev,
      [activityId]: { ...(prev[activityId] ?? emptyRow), ...patch },
    }));
  };

  const toggleExerciseType = (
    activityId: string,
    type: TherapeuticExerciseType
  ) => {
    const row = rows[activityId] ?? emptyRow;
    updateRow(activityId, {
      exerciseTypes: row.exerciseTypes.includes(type)
        ? row.exerciseTypes.filter((item) => item !== type)
        : [...row.exerciseTypes, type],
    });
  };

  const buildDto = (): UpsertMedicalEvaluationDto | null => {
    if (!diagnosis.trim()) {
      setError("El diagnóstico es obligatorio.");
      return null;
    }
    if (initialScore === null) {
      setError(
        "El nivel de dolor inicial es obligatorio: es el dato que arma la curva."
      );
      return null;
    }
    if (nextControlSchedule === NextControlSchedule.OTHER && !nextControlDate) {
      setError("Indicá la fecha estimada del próximo control.");
      return null;
    }

    const dto: UpsertMedicalEvaluationDto = {
      evaluatedAt,
      diagnosis: diagnosis.trim(),
      initialScore,
      ...(pharmacologicalTreatment.trim() && {
        pharmacologicalTreatment: pharmacologicalTreatment.trim(),
      }),
      ...(contraindications.trim() && {
        contraindications: contraindications.trim(),
      }),
      ...(nextControlSchedule && { nextControlSchedule }),
      ...(nextControlSchedule === NextControlSchedule.OTHER &&
        nextControlDate && { nextControlDate }),
    };

    if (!editReferral) {
      setError(null);
      return dto;
    }

    const included = activeActivities.filter(
      (activity) => rows[activity.id]?.included
    );
    if (included.length === 0) {
      setError(
        "Marcá al menos una actividad de derivación con su frecuencia semanal."
      );
      return null;
    }
    for (const activity of included) {
      const row = rows[activity.id];
      if (!row.frequencyCount || row.frequencyCount < 1) {
        setError(`${activity.name}: la frecuencia debe ser al menos 1.`);
        return null;
      }
    }

    dto.referral = {
      validFrom: evaluatedAt,
      activities: included.map((activity) => {
        const row = rows[activity.id];
        const totalSessions = Number(row.totalSessions);
        return {
          activityId: activity.id,
          scheduleType: ScheduleType.FREQUENCY,
          frequencyCount: row.frequencyCount,
          frequencyPeriod: FrequencyPeriod.WEEKLY,
          ...(row.totalSessions && totalSessions > 0 && { totalSessions }),
          ...(row.therapeuticGoal.trim() && {
            therapeuticGoal: row.therapeuticGoal.trim(),
          }),
          ...(row.exerciseTypes.length > 0 && {
            exerciseTypes: row.exerciseTypes,
          }),
          ...(row.notes.trim() && { notes: row.notes.trim() }),
        };
      }),
    };
    setError(null);
    return dto;
  };

  const handleSubmit = async () => {
    const dto = buildDto();
    if (!dto) return;

    const mutation = isEdit
      ? updateEvaluationMutation
      : createEvaluationMutation;

    try {
      await promiseToast(mutation.mutateAsync(dto), {
        loading: { title: "Guardando ficha...", description: "Procesando" },
        success: {
          title: isEdit ? "Ficha actualizada" : "Ficha de ingreso cargada",
          description: "La evaluación médica quedó registrada.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo guardar la ficha de ingreso.",
        }),
      });
      setIsOpen(false);
    } catch (submitError) {
      console.error("Error guardando la ficha de ingreso:", submitError);
    }
  };

  const isPending =
    createEvaluationMutation.isPending || updateEvaluationMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar ficha de ingreso" : "Ficha de ingreso"}
          </DialogTitle>
          <DialogDescription>
            Evaluación médica y esquema de derivación. Diagnóstico, nivel de
            dolor y derivación con frecuencia son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-gray-600">
              Evaluación médica y diagnóstico
            </h3>

            <div className="flex items-center gap-3">
              <Label htmlFor="evaluatedAt" className="shrink-0">
                Fecha
              </Label>
              <Input
                id="evaluatedAt"
                type="date"
                value={evaluatedAt}
                onChange={(event) => setEvaluatedAt(event.target.value)}
                className="w-44"
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnóstico *</Label>
              <Textarea
                id="diagnosis"
                rows={2}
                placeholder="Ej: gonartrosis bilateral, genu varo"
                value={diagnosis}
                onChange={(event) => setDiagnosis(event.target.value)}
              />
            </div>

            <div>
              <Label>Nivel de dolor inicial (1 al 10) *</Label>
              <div className="pt-1">
                <PainScaleInput
                  value={initialScore}
                  onChange={setInitialScore}
                  min={PAIN_MIN}
                  max={PAIN_MAX}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pharmacologicalTreatment">
                Tratamiento médico / farmacológico actual
              </Label>
              <Textarea
                id="pharmacologicalTreatment"
                rows={2}
                value={pharmacologicalTreatment}
                onChange={(event) =>
                  setPharmacologicalTreatment(event.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="contraindications">
                Zonas a evitar o movimientos contraindicados
              </Label>
              <Textarea
                id="contraindications"
                rows={2}
                placeholder="Lo ven el kinesiólogo y el profesor antes de cada sesión"
                value={contraindications}
                onChange={(event) => setContraindications(event.target.value)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase text-gray-600">
                Esquema de derivación y tratamiento
              </h3>
              {isEdit && (
                <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                  <Checkbox
                    checked={editReferral}
                    onCheckedChange={(checked) =>
                      setEditReferral(checked === true)
                    }
                  />
                  Cambiar la derivación (crea una versión nueva del plan)
                </label>
              )}
            </div>

            {!editReferral ? (
              <p className="text-sm text-gray-500">
                Se mantiene la derivación vigente del plan.
              </p>
            ) : activeActivities.length === 0 ? (
              <p className="text-sm text-gray-500">
                El programa no tiene actividades activas. Creá las actividades
                antes de cargar la ficha.
              </p>
            ) : (
              <div className="divide-y rounded-lg border">
                {activeActivities.map((activity) => {
                  const row = rows[activity.id] ?? emptyRow;
                  return (
                    <div key={activity.id} className="space-y-3 p-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={row.included}
                          onCheckedChange={(checked) =>
                            updateRow(activity.id, {
                              included: checked === true,
                            })
                          }
                        />
                        <span className="font-medium">{activity.name}</span>
                      </label>

                      {row.included && (
                        <div className="space-y-3 pl-8">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label
                                htmlFor={`frequency-${activity.id}`}
                                className="text-xs"
                              >
                                Veces por semana *
                              </Label>
                              <Input
                                id={`frequency-${activity.id}`}
                                type="number"
                                min={1}
                                value={row.frequencyCount}
                                onChange={(event) =>
                                  updateRow(activity.id, {
                                    frequencyCount: Number(event.target.value),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`total-sessions-${activity.id}`}
                                className="text-xs"
                              >
                                Total de sesiones indicadas
                              </Label>
                              <Input
                                id={`total-sessions-${activity.id}`}
                                type="number"
                                min={1}
                                value={row.totalSessions}
                                onChange={(event) =>
                                  updateRow(activity.id, {
                                    totalSessions: event.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor={`therapeutic-goal-${activity.id}`}
                              className="text-xs"
                            >
                              Objetivo terapéutico
                            </Label>
                            <Input
                              id={`therapeutic-goal-${activity.id}`}
                              value={row.therapeuticGoal}
                              onChange={(event) =>
                                updateRow(activity.id, {
                                  therapeuticGoal: event.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label className="text-xs">
                              Tipo de ejercicio indicado
                            </Label>
                            <div className="flex flex-col gap-1 pt-1">
                              {Object.entries(
                                TherapeuticExerciseTypeLabels
                              ).map(([key, label]) => (
                                <label
                                  key={key}
                                  className="flex cursor-pointer items-center gap-2 text-sm"
                                >
                                  <Checkbox
                                    checked={row.exerciseTypes.includes(
                                      key as TherapeuticExerciseType
                                    )}
                                    onCheckedChange={() =>
                                      toggleExerciseType(
                                        activity.id,
                                        key as TherapeuticExerciseType
                                      )
                                    }
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor={`referral-notes-${activity.id}`}
                              className="text-xs"
                            >
                              Observaciones para el profesional
                            </Label>
                            <Textarea
                              id={`referral-notes-${activity.id}`}
                              rows={2}
                              placeholder="Ej: ejercicios de genu varo y cuádriceps"
                              value={row.notes}
                              onChange={(event) =>
                                updateRow(activity.id, {
                                  notes: event.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-gray-600">
              Próximo control médico
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs" htmlFor="nextControlSchedule">
                  Reevaluación programada
                </Label>
                <Select
                  value={nextControlSchedule}
                  onValueChange={(value) =>
                    setNextControlSchedule(value as NextControlSchedule)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin definir" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(NextControlScheduleLabels).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              {nextControlSchedule === NextControlSchedule.OTHER && (
                <div>
                  <Label className="text-xs" htmlFor="nextControlDate">
                    Fecha estimada de control
                  </Label>
                  <Input
                    id="nextControlDate"
                    type="date"
                    value={nextControlDate}
                    onChange={(event) => setNextControlDate(event.target.value)}
                  />
                </div>
              )}
            </div>
          </section>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isEdit ? "Guardar cambios" : "Guardar ficha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
