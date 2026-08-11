import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Pencil, Plus, Stethoscope } from "lucide-react";
import { useMedicalEvaluation } from "@/hooks/Program/useMedicalEvaluation";
import { useMeasurements } from "@/hooks/Program/useMeasurements";
import { useCurrentPlan } from "@/hooks/Program/useCurrentPlan";
import { ProgramActivity } from "@/types/Program/ProgramActivity";
import {
  MedicalEvaluationFieldLabels,
  NextControlScheduleLabels,
  TherapeuticExerciseTypeLabels,
} from "@/types/Program/ProgramClinicalIntake";
import MedicalEvaluationDialog from "./MedicalEvaluationDialog";
import AddMeasurementDialog from "./AddMeasurementDialog";
import PainScoreChart from "./PainScoreChart";

interface ClinicalIntakeTabProps {
  enrollmentId: string;
  activities: ProgramActivity[];
  canRegisterClinicalIntake: boolean;
}

const toDisplayDate = (isoDate?: string) =>
  isoDate ? isoDate.split("-").reverse().join("/") : "";

const authorName = (firstName?: string, lastName?: string) =>
  [firstName, lastName].filter(Boolean).join(" ") || "—";

export default function ClinicalIntakeTab({
  enrollmentId,
  activities,
  canRegisterClinicalIntake,
}: ClinicalIntakeTabProps) {
  const { evaluation, completeness, isLoading } =
    useMedicalEvaluation(enrollmentId);
  const { series } = useMeasurements(enrollmentId);
  const { currentPlan } = useCurrentPlan(enrollmentId);

  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Cargando ficha...</div>;
  }

  const entries = series?.entries ?? [];
  const metric = series?.metric;
  const referralActivities = currentPlan?.activities ?? [];

  return (
    <div className="space-y-6">
      {completeness && completeness.missingRequired.length > 0 && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ficha de ingreso incompleta</AlertTitle>
          <AlertDescription>
            Falta cargar:{" "}
            {completeness.missingRequired
              .map((field) => MedicalEvaluationFieldLabels[field])
              .join(" · ")}
            .
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4" />
            Evaluación médica de ingreso
          </CardTitle>
          {canRegisterClinicalIntake && (
            <Button
              size="sm"
              variant={evaluation ? "outline" : "default"}
              onClick={() => setIsEvaluationOpen(true)}
            >
              {evaluation ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar ficha
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Cargar ficha
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!evaluation ? (
            <p className="text-sm text-gray-500">
              Todavía no se cargó la ficha de ingreso de este paciente.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-gray-500">Diagnóstico</p>
                  <p className="whitespace-pre-line text-sm font-medium">
                    {evaluation.diagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Nivel de dolor inicial
                  </p>
                  <p className="text-sm font-medium">
                    {evaluation.initialScore ?? "—"}
                    {evaluation.initialScore != null && " de 10"}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {toDisplayDate(evaluation.evaluatedAt)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Tratamiento farmacológico
                  </p>
                  <p className="whitespace-pre-line text-sm">
                    {evaluation.pharmacologicalTreatment || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Zonas a evitar / contraindicaciones
                  </p>
                  <p className="whitespace-pre-line text-sm">
                    {evaluation.contraindications || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Próximo control
                  </p>
                  <p className="text-sm">
                    {evaluation.nextControlSchedule
                      ? NextControlScheduleLabels[evaluation.nextControlSchedule]
                      : "—"}
                    {evaluation.nextControlDate &&
                      ` · ${toDisplayDate(evaluation.nextControlDate)}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Cargada por</p>
                  <p className="text-sm">
                    {authorName(
                      evaluation.authorFirstName,
                      evaluation.authorLastName
                    )}
                  </p>
                </div>
              </div>

            </>
          )}

          {referralActivities.length > 0 && (
            <div>
              <p className="pb-2 text-xs uppercase text-gray-500">
                Esquema de derivación vigente
              </p>
              <div className="divide-y rounded-lg border">
                {referralActivities.map((activity) => (
                  <div key={activity.id} className="space-y-1 p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {activity.activityName}
                      </span>
                      {activity.frequencyCount != null && (
                        <Badge variant="secondary">
                          {activity.frequencyCount} x semana
                        </Badge>
                      )}
                      {activity.totalSessions != null && (
                        <Badge variant="secondary">
                          {activity.totalSessions} sesiones
                        </Badge>
                      )}
                    </div>
                    {activity.therapeuticGoal && (
                      <p className="text-gray-600">
                        Objetivo: {activity.therapeuticGoal}
                      </p>
                    )}
                    {activity.exerciseTypes &&
                      activity.exerciseTypes.length > 0 && (
                        <p className="text-gray-600">
                          Tipo de trabajo:{" "}
                          {activity.exerciseTypes
                            .map((type) => TherapeuticExerciseTypeLabels[type])
                            .join(", ")}
                        </p>
                      )}
                    {activity.notes && (
                      <p className="text-gray-600">
                        Observaciones: {activity.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">
            Evolución del {metric?.label.toLowerCase() ?? "dolor"}
          </CardTitle>
          {canRegisterClinicalIntake && metric && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMeasurementOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar control
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.length === 0 || !metric ? (
            <p className="text-sm text-gray-500">
              Todavía no hay mediciones. La primera se carga con la ficha de
              ingreso.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-xs uppercase text-gray-500">Al ingreso</p>
                  <p className="text-lg font-semibold">{series?.firstValue}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Último</p>
                  <p className="text-lg font-semibold">{series?.lastValue}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Diferencia</p>
                  <p
                    className={
                      series?.delta == null || series.delta === 0
                        ? "text-lg font-semibold text-gray-600"
                        : (series.delta < 0) === metric.lowerIsBetter
                          ? "text-lg font-semibold text-green-600"
                          : "text-lg font-semibold text-red-600"
                    }
                  >
                    {series?.delta != null && series.delta > 0 ? "+" : ""}
                    {series?.delta ?? 0}
                  </p>
                </div>
              </div>

              {entries.length === 1 ? (
                <p className="text-sm text-gray-500">
                  Con una sola medición todavía no hay curva. Registrá el
                  próximo control para verla.
                </p>
              ) : (
                <PainScoreChart entries={entries} metric={metric} />
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-gray-500">
                      <th className="py-2 pr-4">Fecha</th>
                      <th className="py-2 pr-4">Valor</th>
                      <th className="py-2 pr-4">Cargado por</th>
                      <th className="py-2">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          {toDisplayDate(entry.measuredAt)}
                          {entry.isInitial && (
                            <Badge variant="secondary" className="ml-2">
                              Ingreso
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 pr-4 font-medium">{entry.value}</td>
                        <td className="py-2 pr-4">
                          {authorName(
                            entry.authorFirstName,
                            entry.authorLastName
                          )}
                        </td>
                        <td className="py-2 text-gray-600">
                          {entry.note || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {canRegisterClinicalIntake && (
        <MedicalEvaluationDialog
          enrollmentId={enrollmentId}
          activities={activities}
          evaluation={evaluation}
          isOpen={isEvaluationOpen}
          setIsOpen={setIsEvaluationOpen}
        />
      )}
      {canRegisterClinicalIntake && metric && (
        <AddMeasurementDialog
          enrollmentId={enrollmentId}
          metric={metric}
          isOpen={isMeasurementOpen}
          setIsOpen={setIsMeasurementOpen}
        />
      )}
    </div>
  );
}
