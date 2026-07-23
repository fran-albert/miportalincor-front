import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getStudyInboxPacsImages } from "@/api/StudyInbox/get-study-inbox-pacs-images.action";
import { getStudyInboxPacsImagePreview } from "@/api/StudyInbox/get-study-inbox-pacs-image-preview.action";
import { getStudyInbox } from "@/api/StudyInbox/get-study-inbox.action";
import { EcoTypeNoteField } from "./EcoTypeNoteField";
import { ConfirmStudyInboxGroup } from "@/types/StudyInbox/StudyInbox.types";

const MAX_GROUPS = 6;

// Un color por estudio (A, B, C…); se elige por posición del grupo.
const GROUP_COLORS = [
  "bg-sky-600",
  "bg-fuchsia-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
];

const groupLetter = (index: number): string => String.fromCharCode(65 + index);

/** Un estudio del split: sus imágenes, su tipo/nota y de dónde sale su informe. */
interface SplitGroup {
  key: string;
  note: string;
  /** "" = sin informe · "own" = el PDF propio del item · itemId = un informe de "Para revisar". */
  reportSource: string;
}

interface SplitStudyPanelProps {
  itemId: string;
  hasReport: boolean;
  detectedSubtype: string | null;
  isPending: boolean;
  onConfirm: (groups: ConfirmStudyInboxGroup[]) => void;
  onCancel: () => void;
}

/**
 * Caso "1 examen con varias ecos": el estudio DICOM llegó con todas las
 * imágenes juntas y la secretaria las reparte en N estudios. A cada estudio le
 * asigna su tipo/nota y su informe: el PDF propio del item, o el informe que
 * Andrea mandó por mail aparte (otro item de "Para revisar").
 */
export const SplitStudyPanel = ({
  itemId,
  hasReport,
  detectedSubtype,
  isPending,
  onConfirm,
  onCancel,
}: SplitStudyPanelProps) => {
  const {
    data: instanceIds,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["study-inbox-pacs-images", itemId],
    queryFn: () => getStudyInboxPacsImages(itemId),
    staleTime: Infinity,
  });

  // Informes de "Para revisar" (los PDF que Andrea mandó por mail) para
  // adjuntar a los grupos; se muestran por nombre de archivo.
  const { data: reviewData } = useQuery({
    queryKey: ["study-inbox", "REQUIERE_REVISION", "para-adjuntar"],
    queryFn: () => getStudyInbox({ status: "REQUIERE_REVISION", limit: 100 }),
    staleTime: 1000 * 30,
  });
  const availableReports = useMemo(
    () => (reviewData?.data ?? []).filter((item) => item.attachmentId),
    [reviewData],
  );

  const nextKey = useRef(3);
  const [groups, setGroups] = useState<SplitGroup[]>([
    { key: "g1", note: "", reportSource: "" },
    { key: "g2", note: "", reportSource: "" },
  ]);
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  // Todas las imágenes arrancan en el estudio A (asignación completa = sin
  // huérfanas). La secretaria las reparte tocándolas.
  useEffect(() => {
    if (!instanceIds) return;
    setAssignment(Object.fromEntries(instanceIds.map((id) => [id, "g1"])));
  }, [instanceIds]);

  const countOf = (key: string): number =>
    (instanceIds ?? []).filter((id) => assignment[id] === key).length;

  const cycleImage = (id: string) =>
    setAssignment((current) => {
      const currentKey = current[id] ?? groups[0].key;
      const index = groups.findIndex((g) => g.key === currentKey);
      const next = groups[(index + 1) % groups.length];
      return { ...current, [id]: next.key };
    });

  const setNote = (key: string, note: string) =>
    setGroups((current) =>
      current.map((g) => (g.key === key ? { ...g, note } : g)),
    );

  const setReportSource = (key: string, reportSource: string) =>
    setGroups((current) =>
      current.map((g) => (g.key === key ? { ...g, reportSource } : g)),
    );

  const addGroup = () => {
    if (groups.length >= MAX_GROUPS) return;
    const key = `g${nextKey.current}`;
    nextKey.current += 1;
    setGroups((current) => [...current, { key, note: "", reportSource: "" }]);
  };

  const removeGroup = (key: string) => {
    if (groups.length <= 2) return;
    const fallback = groups.find((g) => g.key !== key)?.key ?? "g1";
    setGroups((current) => current.filter((g) => g.key !== key));
    setAssignment((current) => {
      const next: Record<string, string> = {};
      for (const [id, groupKey] of Object.entries(current)) {
        next[id] = groupKey === key ? fallback : groupKey;
      }
      return next;
    });
  };

  const validationError = useMemo(() => {
    if (!instanceIds) return "cargando";
    for (const group of groups) {
      const count = instanceIds.filter(
        (id) => assignment[id] === group.key,
      ).length;
      if (count === 0) return "Cada estudio debe tener al menos una imagen.";
      if (!group.note.trim()) return "Cada estudio necesita su tipo/nota.";
    }
    const owns = groups.filter((g) => g.reportSource === "own").length;
    if (owns > 1) return "El informe del estudio solo puede ir a un grupo.";
    const externals = groups
      .map((g) => g.reportSource)
      .filter((s) => s && s !== "own");
    if (new Set(externals).size !== externals.length)
      return "Un mismo informe no puede ir a dos estudios.";
    return null;
  }, [instanceIds, groups, assignment]);

  const confirm = () => {
    if (!instanceIds || validationError) return;
    onConfirm(
      groups.map((group) => ({
        instanceIds: instanceIds.filter((id) => assignment[id] === group.key),
        note: group.note.trim(),
        includeReport: group.reportSource === "own" ? true : undefined,
        reportAttachmentItemId:
          group.reportSource && group.reportSource !== "own"
            ? group.reportSource
            : undefined,
      })),
    );
  };

  if (isLoading) {
    return <Skeleton className="h-[40vh] w-full" />;
  }

  if (error || !instanceIds || instanceIds.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-rose-200 p-4 text-sm text-rose-700">
        <span>No se pudieron cargar las imágenes para dividir.</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          Reintentar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Tocá cada imagen para pasarla al siguiente estudio (A → B → C…). Todas
        arrancan en A; ninguna puede quedar sin asignar.
      </p>

      <div className="grid max-h-[40vh] grid-cols-4 gap-2 overflow-y-auto pr-1">
        {instanceIds.map((instanceId, index) => {
          const key = assignment[instanceId] ?? groups[0].key;
          const letterIndex = groups.findIndex((g) => g.key === key);
          return (
            <SplitThumb
              key={instanceId}
              itemId={itemId}
              instanceId={instanceId}
              index={index}
              letterIndex={letterIndex < 0 ? 0 : letterIndex}
              onToggle={() => cycleImage(instanceId)}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {groups.map((group, index) => (
          <div
            key={group.key}
            className="space-y-2 rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
                    GROUP_COLORS[index % GROUP_COLORS.length],
                  )}
                >
                  {groupLetter(index)}
                </span>
                Estudio {groupLetter(index)} ({countOf(group.key)}{" "}
                {countOf(group.key) === 1 ? "imagen" : "imágenes"})
              </span>
              {groups.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(group.key)}
                  title="Quitar este estudio"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <EcoTypeNoteField
              value={group.note}
              onChange={(v) => setNote(group.key, v)}
              detectedSubtype={detectedSubtype}
            />
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              <span>Informe</span>
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={group.reportSource}
                onChange={(e) => setReportSource(group.key, e.target.value)}
              >
                <option value="">Sin informe</option>
                {hasReport && (
                  <option value="own">Informe adjunto a este estudio</option>
                )}
                {availableReports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.attachmentFileName ??
                      report.detectedPatientName ??
                      report.id}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      {groups.length < MAX_GROUPS && (
        <Button type="button" variant="outline" size="sm" onClick={addGroup}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar estudio
        </Button>
      )}

      {validationError && validationError !== "cargando" && (
        <p className="text-xs text-rose-700">{validationError}</p>
      )}

      <div className="flex items-center justify-between gap-3 border-t pt-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar división
        </Button>
        <Button
          type="button"
          className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white"
          disabled={!!validationError || isPending}
          onClick={confirm}
        >
          {isPending ? "Cargando…" : `Confirmar ${groups.length} estudios`}
        </Button>
      </div>
    </div>
  );
};

interface SplitThumbProps {
  itemId: string;
  instanceId: string;
  index: number;
  letterIndex: number;
  onToggle: () => void;
}

const SplitThumb = ({
  itemId,
  instanceId,
  index,
  letterIndex,
  onToggle,
}: SplitThumbProps) => {
  const { data: blob } = useQuery({
    queryKey: ["study-inbox-pacs-image", itemId, instanceId],
    queryFn: () => getStudyInboxPacsImagePreview(itemId, instanceId),
    staleTime: Infinity,
  });

  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  if (!objectUrl) {
    return <Skeleton className="aspect-square w-full rounded-md" />;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative overflow-hidden rounded-md border border-gray-200 transition hover:ring-2 hover:ring-greenPrimary"
      title={`Imagen ${index + 1} — estudio ${groupLetter(letterIndex)} (tocá para cambiar)`}
    >
      <img
        src={objectUrl}
        alt={`Imagen ${index + 1}`}
        className="aspect-square w-full object-cover"
        loading="lazy"
      />
      <span
        className={cn(
          "absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
          GROUP_COLORS[letterIndex % GROUP_COLORS.length],
        )}
      >
        {groupLetter(letterIndex)}
      </span>
    </button>
  );
};
