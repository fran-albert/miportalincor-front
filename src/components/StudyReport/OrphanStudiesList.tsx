import { useEffect, useState } from "react";
import { ImageOff, ScanLine } from "lucide-react";
import {
  getOrphanStudyImages,
  getOrphanStudyImagePreview,
} from "@/api/StudyReport/study-report.actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

/**
 * Fecha del estudio. `timeZone: "UTC"` como en el resto de la bandeja: la fecha
 * llega a medianoche UTC y sin esto en UTC-3 se muestra el día anterior.
 */
const formatStudyDate = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString("es-AR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin fecha";

/** Hora en que el estudio llegó del ecógrafo, en hora local (no es UTC). */
const formatReceivedTime = (value: string | null): string | null =>
  value
    ? new Date(value).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

const imageCountLabel = (count: number): string =>
  count === 1 ? "1 imagen" : `${count} imágenes`;

/**
 * La miniatura del estudio: la primera imagen del examen.
 *
 * Una sola por tarjeta, a propósito. La lista puede tener decenas de estudios
 * (88 acumulados el 24/08) y bajar todas las imágenes de cada uno la dejaría
 * inusable justo en el celular, que es donde se usa: la ecografista mira esto
 * de pie, con el equipo al lado. Para ver el resto está el diálogo de reclamo.
 */
const OrphanThumbnail = ({ study }: { study: OrphanStudy }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!study.hasImages) return;
    let active = true;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const instanceIds = await getOrphanStudyImages(
          study.sourceInboxItemId,
        );
        if (!active || instanceIds.length === 0) {
          if (active) setFailed(true);
          return;
        }
        const blob = await getOrphanStudyImagePreview(
          study.sourceInboxItemId,
          instanceIds[0],
        );
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (active) setFailed(true);
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [study.sourceInboxItemId, study.hasImages]);

  if (!study.hasImages || failed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
        <ImageOff className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Sin vista previa</span>
      </div>
    );
  }

  if (!url) {
    return <Skeleton className="aspect-video w-full rounded-md" />;
  }

  return (
    <img
      src={url}
      alt={`Primera imagen del estudio del ${formatStudyDate(study.studyDate)}`}
      className="aspect-video w-full rounded-md bg-black object-contain"
    />
  );
};

interface OrphanStudiesListProps {
  studies: OrphanStudy[];
  isLoading: boolean;
  onClaim: (study: OrphanStudy) => void;
}

/**
 * Los estudios que llegaron del ecógrafo sin poder atribuirse a nadie.
 *
 * Va en tarjetas y no en tabla, y no es capricho: reconocer el estudio propio
 * es una tarea VISUAL —la miniatura y la hora—, no una comparación de columnas.
 * Además se usa de pie y en el celular, donde una tabla de seis columnas obliga
 * a scrollear en horizontal para llegar al botón.
 */
export const OrphanStudiesList = ({
  studies,
  isLoading,
  onClaim,
}: OrphanStudiesListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (studies.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        No hay estudios sin dueño en este período. Los estudios de turnos
        cargados llegan solos a &quot;Por informar&quot;.
      </p>
    );
  }

  return (
    <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
      {studies.map((study) => {
        const receivedTime = formatReceivedTime(study.receivedAt);
        return (
          <li
            key={study.sourceInboxItemId}
            className="flex flex-col gap-3 rounded-lg border bg-card p-3"
          >
            <OrphanThumbnail study={study} />

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-base font-semibold">
                {formatStudyDate(study.studyDate)}
              </span>
              {receivedTime && (
                <span className="text-sm text-muted-foreground">
                  {receivedTime} h
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium">
                {study.detectedPatientName ?? "Sin nombre"}
              </p>
              {study.detectedDni && (
                <p className="text-sm text-muted-foreground">
                  DNI {study.detectedDni}
                </p>
              )}
              {study.needsPatient && (
                <p className="mt-1 inline-flex rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                  Sin paciente identificado
                </p>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ScanLine className="h-4 w-4 shrink-0" aria-hidden="true" />
              {imageCountLabel(study.imageCount)}
              {study.studySubtype ? ` · ${study.studySubtype}` : ""}
            </p>

            <Button
              className="mt-auto w-full"
              size="lg"
              onClick={() => onClaim(study)}
            >
              Es mío
            </Button>
          </li>
        );
      })}
    </ul>
  );
};
