import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Building2,
  Calendar,
  Download,
  Eye,
  FileEdit,
  FileImageIcon,
  FileText,
  StethoscopeIcon,
  TestTubeIcon,
  Zap,
} from "lucide-react";
import DeleteStudyDialog from "../Delete/dialog";
import { PacsViewerButton } from "../PacsViewerButton";
import { formatStudyCount, groupByMonthDesc } from "../studyGrouping";

export interface TimelineStudy {
  id: number;
  /** Nombre del tipo de estudio. */
  title: string;
  /** Detalle/observación del estudio. */
  subtitle?: string;
  /** Categoría derivada del tipo, define el icono. */
  category: string;
  /** Fecha cruda del estudio (se usa para ordenar y agrupar). */
  date: Date | string | null | undefined;
  /** Fecha ya formateada para mostrar. */
  dateLabel: string;
  /** URL del documento. Si no hay, el estudio es "sin documento". */
  fileUrl?: string;
  isExternal?: boolean;
  externalInstitution?: string;
  signedDoctorId?: string;
  studyInstanceUID?: string | null;
}

interface StudiesTimelineProps {
  studies: TimelineStudy[];
  /** Permiso de borrado que ya traía la vista: no se amplía acá. */
  canDelete?: boolean;
  patientId?: string;
  currentDoctorId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const getCategoryIcon = (category: string) => {
  const iconClass = "h-5 w-5";
  switch (category) {
    case "Imagenología":
      return <FileImageIcon className={`${iconClass} text-blue-500`} />;
    case "Laboratorio":
      return <TestTubeIcon className={`${iconClass} text-green-500`} />;
    case "Cardiología":
      return <Activity className={`${iconClass} text-red-500`} />;
    case "Neurología":
      return <Zap className={`${iconClass} text-purple-500`} />;
    case "Endocrinología":
      return <StethoscopeIcon className={`${iconClass} text-orange-500`} />;
    default:
      return <FileText className={`${iconClass} text-gray-500`} />;
  }
};

const StudyRow: React.FC<{
  study: TimelineStudy;
  canDelete: boolean;
  patientId?: string;
  currentDoctorId?: string;
}> = ({ study, canDelete, patientId, currentDoctorId }) => {
  const hasFile = !!study.fileUrl;
  const isManualLaboratory = !hasFile && !study.isExternal;

  // Mismas reglas de permisos que la tabla anterior: no se amplía el acceso.
  const canDeleteAsDoctor =
    study.isExternal &&
    study.signedDoctorId &&
    currentDoctorId &&
    study.signedDoctorId === currentDoctorId;
  const canDeleteManualLaboratory =
    isManualLaboratory &&
    study.signedDoctorId &&
    currentDoctorId &&
    study.signedDoctorId === currentDoctorId;
  const showDelete =
    !!patientId &&
    !!(
      (canDelete && !isManualLaboratory) ||
      canDeleteManualLaboratory ||
      canDeleteAsDoctor
    );

  const openFile = () => {
    if (study.fileUrl) {
      window.open(study.fileUrl, "_blank");
    }
  };

  return (
    <div
      data-testid="study-row"
      className={`rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-greenPrimary/50 hover:shadow-md sm:p-4 ${
        study.isExternal
          ? "border-l-4 border-l-orange-500"
          : "border-l-4 border-l-greenPrimary"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 flex-shrink-0">
            {getCategoryIcon(study.category)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold text-gray-900">
              {study.title}
            </p>

            {study.subtitle && (
              <p className="mt-0.5 break-words text-xs text-gray-600">
                {study.subtitle}
              </p>
            )}

            {study.isExternal && study.externalInstitution && (
              <p className="mt-0.5 break-words text-xs text-orange-600">
                {study.externalInstitution}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                {study.dateLabel}
              </span>

              {study.isExternal && (
                <Badge
                  variant="outline"
                  className="border-orange-200 bg-orange-50 text-xs text-orange-700"
                  title={study.externalInstitution || "Estudio externo"}
                >
                  <Building2 className="mr-1 h-3 w-3" />
                  Externo
                </Badge>
              )}

              {isManualLaboratory && (
                <Badge
                  variant="outline"
                  className="border-purple-200 bg-purple-50 text-xs text-purple-700"
                  title="Laboratorio ingresado manualmente"
                >
                  <FileEdit className="mr-1 h-3 w-3" />
                  Manual
                </Badge>
              )}

              {!hasFile && (
                <Badge
                  variant="outline"
                  className="border-gray-200 bg-gray-50 text-xs text-gray-600"
                  title="El estudio no tiene documento adjunto"
                >
                  Sin documento
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:flex-shrink-0 sm:justify-end">
          {hasFile && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                onClick={openFile}
                title="Ver estudio"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                onClick={openFile}
                title="Descargar estudio"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}

          <PacsViewerButton
            studyId={study.id}
            studyInstanceUID={study.studyInstanceUID}
          />

          {showDelete && patientId && (
            <DeleteStudyDialog
              idStudy={study.id}
              userId={parseInt(patientId)}
              studies={[]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Lista de estudios agrupada por mes/año en orden descendente.
 *
 * Es responsive por composición (las filas se apilan en mobile), sin
 * `overflow-x-auto`: la página nunca scrollea de costado.
 */
const StudiesTimeline: React.FC<StudiesTimelineProps> = ({
  studies,
  canDelete = false,
  patientId,
  currentDoctorId,
  emptyTitle = "No hay estudios disponibles",
  emptyDescription = "Los estudios aparecerán acá cuando estén disponibles",
}) => {
  const groups = React.useMemo(
    () => groupByMonthDesc(studies, (study) => study.date),
    [studies]
  );

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-16 w-16 text-gray-300" />
        <p className="text-base font-medium text-gray-500">{emptyTitle}</p>
        <p className="mt-2 text-sm text-gray-400">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {groups.map((group) => (
        <section key={group.key} className="w-full space-y-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-200 pb-2">
            <h3 className="rounded-md bg-greenPrimary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-greenPrimary">
              {group.label}
            </h3>
            <span className="text-xs text-gray-500">
              {formatStudyCount(group.items.length)}
            </span>
          </div>

          <div className="space-y-3">
            {group.items.map((study) => (
              <StudyRow
                key={study.id}
                study={study}
                canDelete={canDelete}
                patientId={patientId}
                currentDoctorId={currentDoctorId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default StudiesTimeline;
