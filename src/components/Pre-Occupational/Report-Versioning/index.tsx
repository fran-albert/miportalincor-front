import { useState } from "react";
import {
  FileClock,
  FileText,
  History,
  Loader2,
  Save,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { MedicalEvaluationReportVersion } from "@/types/Medical-Evaluation-Report-Version";
import { getSignedUrlByCollaboratorIdAndFileName } from "@/api/Study/Collaborator/get-signed-url.collaborators.action";
import { useMedicalEvaluationReportVersionMutations } from "@/hooks/Medical-Evaluation-Report-Version/useMedicalEvaluationReportVersionMutations";
import useUserRole from "@/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatReportDate,
  getReportStatus,
  ReportStatusBadge,
} from "./report-status";
import { useCurrentMedicalEvaluationReport } from "@/hooks/Medical-Evaluation-Report-Version/useCurrentMedicalEvaluationReport";

interface Props {
  collaborator: Collaborator;
  medicalEvaluationId: number;
  previewHref: string;
}

export default function ReportVersioningCard({
  collaborator,
  medicalEvaluationId,
  previewHref,
}: Props) {
  const navigate = useNavigate();
  const { isSecretary, isAdmin } = useUserRole();
  const [openingVersionId, setOpeningVersionId] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { markAsFinalMutation } =
    useMedicalEvaluationReportVersionMutations(medicalEvaluationId);
  const {
    reportVersions,
    currentVersion,
    finalVersion,
    currentUrl,
    hasReport,
    hasLegacyCurrentReport,
    isLoading,
    isError,
  } = useCurrentMedicalEvaluationReport({
    auth: true,
    collaboratorId: collaborator.id,
    medicalEvaluationId,
  });

  const currentStatus = getReportStatus(currentVersion, hasLegacyCurrentReport);
  const canMarkFinal = isSecretary || isAdmin;

  const openVersion = async (version: MedicalEvaluationReportVersion) => {
    try {
      setOpeningVersionId(version.id);
      const { url } = await getSignedUrlByCollaboratorIdAndFileName(
        collaborator.id,
        version.fileName
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningVersionId(null);
    }
  };

  const renderVersionBadges = (version: MedicalEvaluationReportVersion) => (
    <div className="flex flex-wrap gap-2">
      {version.isCurrent && <Badge variant="greenPrimary">Actual</Badge>}
      {version.isFinal && <Badge variant="success">Final</Badge>}
      {version.outdatedByExamChanges && (
        <Badge variant="warning">Desactualizada</Badge>
      )}
    </div>
  );

  const handleOpenCurrentReport = () => {
    if (!currentUrl) return;

    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No se pudo cargar el estado del informe.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-greenPrimary/15 shadow-[0_20px_50px_-34px_rgba(12,72,74,0.45)]">
      <CardContent className="p-4">
        <div className="rounded-xl border border-greenPrimary/15 bg-[linear-gradient(135deg,rgba(12,72,74,0.09)_0%,rgba(24,123,128,0.12)_24%,rgba(255,255,255,0.97)_60%,rgba(1,169,164,0.06)_100%)] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-greenPrimary/15 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-greenSecondary shadow-sm backdrop-blur-sm">
                <FileClock className="h-4 w-4" />
                Estado del informe
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-greenSecondary">
                  Informe actual del examen
                </h3>
                <p className="max-w-2xl text-sm leading-6 text-slate-700">
                  El PDF de la tabla sigue siendo el informe actual. Desde acá
                  solo ves su estado y las acciones principales para generar o
                  regenerar el documento.
                </p>
              </div>
            </div>
            <ReportStatusBadge
              version={currentVersion}
              hasLegacyReport={hasLegacyCurrentReport}
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-greenPrimary/10 bg-white/90 p-4 shadow-[0_12px_28px_-24px_rgba(12,72,74,0.45)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Informe actual
              </div>
              <div className="mt-2 font-medium text-greenSecondary">
                {isLoading
                  ? "Cargando estado..."
                  : currentVersion
                    ? `Versión ${currentVersion.version}`
                    : hasLegacyCurrentReport
                      ? "Informe generado en flujo anterior"
                      : "Todavía no hay informe generado"}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                {isLoading
                  ? "Estamos consultando el documento actual."
                  : currentVersion
                    ? `Generado el ${formatReportDate(currentVersion.generatedAt)}`
                    : hasLegacyCurrentReport
                      ? "El examen ya tiene un PDF disponible y seguirá siendo el informe actual hasta que regeneres uno nuevo."
                      : "Cuando generes el primer informe, va a quedar disponible desde la tabla del colaborador."}
              </div>
              {currentVersion?.generatedByEmail && (
                <div className="mt-1 text-sm text-slate-500">
                  Generado por {currentVersion.generatedByEmail}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-greenPrimary/10 bg-white/90 p-4 shadow-[0_12px_28px_-24px_rgba(12,72,74,0.45)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Última final entregada
              </div>
              <div className="mt-2 font-medium text-greenSecondary">
                {finalVersion
                  ? `Versión ${finalVersion.version}`
                  : "Sin versión final marcada"}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                {finalVersion
                  ? `Marcada como final el ${formatReportDate(finalVersion.generatedAt)}`
                  : "Podés marcar como final la versión vigente cuando sea la entrega formal."}
              </div>
              {finalVersion && finalVersion.id !== currentVersion?.id && (
                <div className="mt-2">
                  {renderVersionBadges(finalVersion)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-greenPrimary/20 bg-white/80 text-greenSecondary hover:border-greenPrimary/35 hover:bg-greenPrimary/5"
              onClick={handleOpenCurrentReport}
              disabled={!hasReport || !currentUrl}
            >
              <FileText className="mr-2 h-4 w-4" />
              Ver informe actual
            </Button>
            <Button
              variant="default"
              size="sm"
              className="border border-greenPrimary/10 bg-gradient-to-r from-greenSecondary via-greenPrimary to-incor text-white shadow-[0_16px_30px_-18px_rgba(12,72,74,0.9)] hover:from-greenSecondary hover:via-greenSecondary hover:to-greenPrimary"
              onClick={() => navigate(previewHref)}
            >
              <Save className="mr-2 h-4 w-4" />
              {hasReport ? "Regenerar desde previsualización" : "Generar informe"}
            </Button>
            {reportVersions?.versions.length ? (
              <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    Ver historial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Historial de informes</DialogTitle>
                    <DialogDescription>
                      Mostramos el detalle de versiones como información
                      secundaria para que el flujo principal siga siendo simple.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {(reportVersions?.versions ?? []).map((version) => (
                      <div
                        key={version.id}
                        className="rounded-lg border bg-muted/20 p-4 space-y-3"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">
                              Versión {version.version}
                            </div>
                            <div className="text-sm text-muted-foreground break-all">
                              {version.fileName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatReportDate(version.generatedAt)}
                            </div>
                            {version.generatedByEmail && (
                              <div className="text-sm text-muted-foreground">
                                Generada por {version.generatedByEmail}
                              </div>
                            )}
                          </div>
                          {renderVersionBadges(version)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openVersion(version)}
                            disabled={openingVersionId === version.id}
                          >
                            {openingVersionId === version.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="mr-2 h-4 w-4" />
                            )}
                            Ver informe
                          </Button>
                          {canMarkFinal && !version.isFinal && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                markAsFinalMutation.mutate(version.id)
                              }
                              disabled={markAsFinalMutation.isPending}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Marcar como final
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            ) : null}
            {canMarkFinal && currentVersion && !currentVersion.isFinal && (
              <Button
                size="sm"
                variant="outline"
                className="border-greenPrimary/20 bg-white/80 text-greenSecondary hover:border-greenPrimary/35 hover:bg-greenPrimary/5"
                onClick={() => markAsFinalMutation.mutate(currentVersion.id)}
                disabled={markAsFinalMutation.isPending}
              >
                {markAsFinalMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Marcar actual como final
              </Button>
            )}
          </div>

          {!isLoading && currentStatus.variant === "warning" && (
            <div className="mt-4 rounded-lg border border-yellow-300/80 bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-3 text-sm text-yellow-900 shadow-[0_12px_24px_-20px_rgba(202,138,4,0.6)]">
              Este examen tuvo cambios después del último PDF. El informe actual
              sigue disponible, pero conviene regenerarlo desde la
              previsualización.
            </div>
          )}

          {!isLoading && hasLegacyCurrentReport && (
            <div className="mt-4 rounded-lg border border-greenPrimary/12 bg-white/95 px-4 py-3 text-sm leading-6 text-slate-700 shadow-[0_12px_24px_-22px_rgba(12,72,74,0.35)]">
              Este examen tiene un informe del flujo anterior. Cuando regeneres
              desde la previsualización, el sistema empezará a guardar versiones
              nuevas sin cambiar cómo trabaja secretaría.
            </div>
          )}

          {isLoading && (
            <div className="mt-4 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Cargando estado del informe...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
