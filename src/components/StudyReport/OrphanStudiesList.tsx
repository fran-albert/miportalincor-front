import { useEffect, useState } from "react";
import { ImageOff, ScanLine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getOrphanStudyImages,
  getOrphanStudyImagePreview,
} from "@/api/StudyReport/study-report.actions";
import { createRequestGate } from "@/common/helpers/request-gate";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

/**
 * Cuántas miniaturas salen a buscarse a la vez. Mismo número que usa la
 * galería del editor (PREVIEW_CONCURRENCY): es el techo aunque un scroll
 * rápido meta las 80 tarjetas en pantalla.
 */
const THUMBNAIL_CONCURRENCY = 4;

/**
 * Cuánto se adelanta la descarga respecto de lo que está en pantalla. Con la
 * tarjeta rondando los 360 px de alto, 300 px es aproximadamente una tarjeta
 * de anticipo: la miniatura suele estar cuando la ecografista llega a ella,
 * sin bajar la lista entera.
 */
const THUMBNAIL_PREFETCH_MARGIN = "300px";

const thumbnailGate = createRequestGate(THUMBNAIL_CONCURRENCY);

/**
 * Avisa cuándo el elemento entró en pantalla, una sola vez.
 *
 * Si el navegador no trae IntersectionObserver, se baja todo de entrada: peor
 * en pedidos, pero la miniatura es lo único con lo que la ecografista
 * reconoce su estudio y no puede faltar.
 */
const useInViewOnce = (enabled: boolean) => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (!enabled || inView || !node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setInView(true);
      },
      { rootMargin: THUMBNAIL_PREFETCH_MARGIN },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, inView, node]);

  return { ref: setNode, inView };
};

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
 * La miniatura vive en el caché de react-query, no en estado local.
 *
 * Radix desmonta el contenido de la pestaña inactiva. Con la miniatura en
 * useState + useEffect, cada vez que la ecografista iba a "Por informar" y
 * volvía, las 80 tarjetas remontaban desde cero y disparaban 160 pedidos
 * simultáneos: el navegador encolaba, varios fallaban y quedaban con el icono
 * de "sin vista previa". Ese era el "desaparece la carga de imágenes".
 *
 * Cacheado, volver a la pestaña no pide nada: la URL sale del caché.
 */
const orphanThumbnailQueryKey = (sourceInboxItemId: string) =>
  ["study-reports", "orphans", "thumbnail", sourceInboxItemId] as const;

/**
 * Devuelve una object URL viva. A propósito NUNCA se revoca: el caché guarda
 * la URL, así que revocarla en un cleanup dejaría la entrada cacheada
 * apuntando a un blob muerto y la imagen se vería rota al volver. El costo es
 * el blob en memoria hasta que se recargue la página, acotado por la cantidad
 * de tarjetas que la ecografista llegó a mirar.
 */
const fetchOrphanThumbnail = async (
  sourceInboxItemId: string,
): Promise<string> => {
  const instanceIds = await getOrphanStudyImages(sourceInboxItemId);
  if (instanceIds.length === 0) {
    throw new Error("El estudio no tiene imágenes en el PACS");
  }
  // Una sola imagen por tarjeta, a propósito: la lista puede tener decenas de
  // estudios y bajar todas las imágenes de cada uno la dejaría inusable justo
  // en el celular, que es donde se usa. Para ver el resto está el diálogo.
  const blob = await getOrphanStudyImagePreview(
    sourceInboxItemId,
    instanceIds[0],
  );
  return URL.createObjectURL(blob);
};

const OrphanThumbnail = ({ study }: { study: OrphanStudy }) => {
  const { ref, inView } = useInViewOnce(study.hasImages);
  const { data: url, isError } = useQuery({
    queryKey: orphanThumbnailQueryKey(study.sourceInboxItemId),
    queryFn: () =>
      thumbnailGate(() => fetchOrphanThumbnail(study.sourceInboxItemId)),
    // Sólo lo que está en pantalla: con 80 tarjetas, pedir todo de entrada era
    // lo que tiraba las miniaturas abajo.
    enabled: study.hasImages && inView,
    // El estudio ya salió del ecógrafo: el blob no cambia nunca. Sin
    // staleTime/gcTime infinitos, volver a la pestaña dispararía de nuevo los
    // 160 pedidos que este fix viene a matar.
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  if (!study.hasImages || isError) {
    return (
      <div
        ref={ref}
        className="flex aspect-video w-full items-center justify-center rounded-md bg-muted text-muted-foreground"
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Sin vista previa</span>
      </div>
    );
  }

  if (!url) {
    // El ref va en el div y no en Skeleton: Skeleton no reenvía refs, y sin un
    // nodo observado la miniatura no se pediría nunca.
    return (
      <div ref={ref} className="aspect-video w-full">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
    );
  }

  return (
    <img
      ref={ref}
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
              {/*
                Decía "Sin paciente identificado" justo debajo del nombre de
                la paciente, y se leía como una contradicción: el nombre está
                ahí y la paciente existe. Lo que pasa es que ese nombre no
                coincidió con el padrón — y lo que hay que hacer es elegir a
                la persona al reclamar el estudio.
              */}
              {study.needsPatient && (
                <p className="mt-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                  No coincide con el padrón — elegilo al reclamar
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
