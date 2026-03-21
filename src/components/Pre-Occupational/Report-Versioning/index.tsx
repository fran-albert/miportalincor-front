import { useMemo, useState } from "react";
import { FileText, History, Loader2, Save, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import {
  MedicalEvaluationReportVersion,
  MedicalEvaluationReportVersionsSummary,
} from "@/types/Medical-Evaluation-Report-Version";
import { getSignedUrlByCollaboratorIdAndFileName } from "@/api/Study/Collaborator/get-signed-url.collaborators.action";
import { useMedicalEvaluationReportVersionMutations } from "@/hooks/Medical-Evaluation-Report-Version/useMedicalEvaluationReportVersionMutations";
import useUserRole from "@/hooks/useRoles";

interface Props {
  collaborator: Collaborator;
  medicalEvaluationId: number;
  previewHref: string;
  reportVersions: MedicalEvaluationReportVersionsSummary | undefined;
  isLoading: boolean;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentStatus(version: MedicalEvaluationReportVersion | null): {
  label: string;
  variant: "greenPrimary" | "warning" | "success" | "outline";
} {
  if (!version) {
    return { label: "Sin informe generado", variant: "outline" };
  }

  if (version.outdatedByExamChanges) {
    return {
      label: "Vigente, pero hay cambios sin regenerar",
      variant: "warning",
    };
  }

  if (version.isFinal) {
    return { label: "Final entregada", variant: "success" };
  }

  return { label: "Vigente", variant: "greenPrimary" };
}

export default function ReportVersioningCard({
  collaborator,
  medicalEvaluationId,
  previewHref,
  reportVersions,
  isLoading,
}: Props) {
  const navigate = useNavigate();
  const { isSecretary, isAdmin } = useUserRole();
  const [openingVersionId, setOpeningVersionId] = useState<number | null>(null);
  const { markAsFinalMutation } =
    useMedicalEvaluationReportVersionMutations(medicalEvaluationId);

  const currentVersion = reportVersions?.currentVersion ?? null;
  const finalVersion = reportVersions?.finalVersion ?? null;

  const previousVersions = useMemo(() => {
    return (reportVersions?.versions ?? []).filter(
      (version) => version.id !== currentVersion?.id
    );
  }, [currentVersion?.id, reportVersions?.versions]);

  const currentStatus = getCurrentStatus(currentVersion);
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

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-greenPrimary" />
              Informe actual
            </CardTitle>
            <CardDescription>
              Muestra cuál es el PDF vigente del examen y si quedó viejo después
              de cambios posteriores.
            </CardDescription>
          </div>
          <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Cargando versiones del informe...
          </div>
        ) : currentVersion ? (
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="font-medium">Versión {currentVersion.version}</div>
                <div className="text-sm text-muted-foreground break-all">
                  {currentVersion.fileName}
                </div>
                <div className="text-sm text-muted-foreground">
                  Generada el {formatDate(currentVersion.generatedAt)}
                </div>
                {currentVersion.generatedByEmail && (
                  <div className="text-sm text-muted-foreground">
                    Generada por {currentVersion.generatedByEmail}
                  </div>
                )}
              </div>
              {renderVersionBadges(currentVersion)}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openVersion(currentVersion)}
                disabled={openingVersionId === currentVersion.id}
              >
                {openingVersionId === currentVersion.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Ver informe
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(previewHref)}
              >
                <Save className="mr-2 h-4 w-4" />
                Generar nueva versión
              </Button>
              {canMarkFinal && !currentVersion.isFinal && (
                <Button
                  size="sm"
                  className="bg-greenPrimary hover:bg-teal-800"
                  onClick={() => markAsFinalMutation.mutate(currentVersion.id)}
                  disabled={markAsFinalMutation.isPending}
                >
                  {markAsFinalMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="mr-2 h-4 w-4" />
                  )}
                  Marcar como final
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 space-y-3">
            <div className="text-sm text-muted-foreground">
              Todavía no hay ningún informe generado para este examen.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(previewHref)}
            >
              <Save className="mr-2 h-4 w-4" />
              Generar informe
            </Button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="space-y-1">
              <div className="font-medium">Última versión final entregada</div>
              <div className="text-sm text-muted-foreground">
                Sirve para distinguir la entrega formal si después hubo otras
                regeneraciones.
              </div>
            </div>
            {finalVersion ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Versión {finalVersion.version}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    • {formatDate(finalVersion.generatedAt)}
                  </span>
                </div>
                {renderVersionBadges(finalVersion)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openVersion(finalVersion)}
                  disabled={openingVersionId === finalVersion.id}
                >
                  {openingVersionId === finalVersion.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Ver versión final
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Todavía no hay una versión marcada como final entregada.
              </div>
            )}
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <History className="h-4 w-4 text-muted-foreground" />
                Versiones anteriores
              </div>
              <div className="text-sm text-muted-foreground">
                Muestra el historial previo del informe para evitar confusión
                sobre cuál PDF quedó vigente.
              </div>
            </div>
            {previousVersions.length > 0 ? (
              <div className="space-y-3">
                {previousVersions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-md border bg-muted/20 p-3 space-y-2"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">Versión {version.version}</div>
                        <div className="text-sm text-muted-foreground break-all">
                          {version.fileName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(version.generatedAt)}
                        </div>
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
                          onClick={() => markAsFinalMutation.mutate(version.id)}
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
            ) : (
              <div className="text-sm text-muted-foreground">
                No hay versiones anteriores para este examen.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
