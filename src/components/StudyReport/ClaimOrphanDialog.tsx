import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import {
  getOrphanStudyImages,
  getOrphanStudyImagePreview,
} from "@/api/StudyReport/study-report.actions";
import { PatientSelect } from "@/components/Appointments/Select/PatientSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

const PREVIEW_CONCURRENCY = 4;

const formatStudyDate = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString("es-AR", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin fecha";

/**
 * Todas las imágenes del estudio, no sólo la miniatura.
 *
 * En la lista alcanza con una para descartar; para CONFIRMAR que el estudio es
 * propio hace falta ver el examen entero. Reclamar el equivocado deja un
 * estudio en la historia de otra persona.
 */
const OrphanGallery = ({ study }: { study: OrphanStudy }) => {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!study.hasImages) {
      setUrls([]);
      return;
    }
    let active = true;
    const created: string[] = [];

    void (async () => {
      try {
        const instanceIds = await getOrphanStudyImages(
          study.sourceInboxItemId,
        );
        const resolved: (string | null)[] = instanceIds.map(() => null);
        let next = 0;
        const worker = async () => {
          while (next < instanceIds.length) {
            const index = next;
            next += 1;
            try {
              const blob = await getOrphanStudyImagePreview(
                study.sourceInboxItemId,
                instanceIds[index],
              );
              const url = URL.createObjectURL(blob);
              if (!active) {
                URL.revokeObjectURL(url);
                continue;
              }
              created.push(url);
              resolved[index] = url;
            } catch {
              // Una miniatura suelta puede fallar sin tapar las demás.
            }
          }
        };
        await Promise.all(
          Array.from(
            { length: Math.min(PREVIEW_CONCURRENCY, instanceIds.length) },
            () => worker(),
          ),
        );
        if (!active) return;
        setUrls(resolved.filter((url): url is string => url !== null));
      } catch {
        if (active) setFailed(true);
      }
    })();

    return () => {
      active = false;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [study.sourceInboxItemId, study.hasImages]);

  if (failed || (urls !== null && urls.length === 0)) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
        <ImageOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        No se pudieron mostrar las imágenes del estudio.
      </p>
    );
  }

  if (urls === null) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="aspect-square w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
      {urls.map((url, index) => (
        <img
          key={url}
          src={url}
          alt={`Imagen ${index + 1} del estudio`}
          className="aspect-square w-full rounded-md bg-black object-contain"
        />
      ))}
    </div>
  );
};

interface ClaimOrphanDialogProps {
  study: OrphanStudy;
  isPending: boolean;
  onConfirm: (patientUserId: string | undefined) => void;
  onCancel: () => void;
}

export const ClaimOrphanDialog = ({
  study,
  isPending,
  onConfirm,
  onCancel,
}: ClaimOrphanDialogProps) => {
  const [patientUserId, setPatientUserId] = useState<number | undefined>(
    undefined,
  );
  const missingPatient = study.needsPatient && patientUserId === undefined;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Estudio del {formatStudyDate(study.studyDate)}
          {study.studySubtype ? ` · ${study.studySubtype}` : ""}
        </p>
        <p className="font-medium">
          Nombre cargado en el equipo:{" "}
          {study.detectedPatientName ?? "(vacío)"}
        </p>
      </div>

      <OrphanGallery study={study} />

      {study.needsPatient && (
        <div className="grid gap-1.5">
          <Label>Paciente</Label>
          <p className="text-sm text-muted-foreground">
            El estudio llegó sin datos para identificar al paciente. Elegilo del
            padrón.
          </p>
          <PatientSelect
            value={patientUserId}
            onValueChange={setPatientUserId}
            searchMode="dni-name"
            placeholder="Buscar por DNI o apellido"
          />
        </div>
      )}

      <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Reclamarlo lo pasa a tu cola de <strong>Por informar</strong>. No firma
        ni carga nada en la historia clínica, y mientras no lo firmes se puede
        soltar y vuelve a esta lista.
      </p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          disabled={isPending || missingPatient}
          onClick={() =>
            onConfirm(
              patientUserId === undefined ? undefined : String(patientUserId),
            )
          }
        >
          Sí, es mío
        </Button>
      </div>
    </div>
  );
};
