import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getStudyInboxPacsImages } from "@/api/StudyInbox/get-study-inbox-pacs-images.action";
import { getStudyInboxPacsImagePreview } from "@/api/StudyInbox/get-study-inbox-pacs-image-preview.action";
import { EcoTypeNoteField } from "./EcoTypeNoteField";
import { ConfirmStudyInboxGroup } from "@/types/StudyInbox/StudyInbox.types";
import {
  buildSplitGroups,
  instancesOfGroup,
  SplitGroupKey,
  SplitState,
  validateSplit,
} from "./split-groups.helpers";

interface SplitStudyPanelProps {
  itemId: string;
  hasReport: boolean;
  detectedSubtype: string | null;
  isPending: boolean;
  onConfirm: (groups: ConfirmStudyInboxGroup[]) => void;
  onCancel: () => void;
}

const GROUP_STYLE: Record<SplitGroupKey, string> = {
  A: "bg-sky-600",
  B: "bg-fuchsia-600",
};

/**
 * Caso "1 examen con 2 ecos": el estudio DICOM llegó con todas las imágenes
 * juntas y la secretaria las reparte en 2 estudios. Cada imagen arranca en el
 * estudio A; un click la pasa a B (así ninguna queda sin asignar). Cada grupo
 * lleva su tipo/nota, y uno se lleva el informe.
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

  const [state, setState] = useState<SplitState>({
    assignment: {},
    notes: { A: "", B: "" },
    reportGroup: "A",
  });

  // Todas las imágenes arrancan en el estudio A (asignación completa = sin
  // huérfanas). La secretaria mueve a B las que correspondan.
  useEffect(() => {
    if (!instanceIds) return;
    setState((prev) => ({
      ...prev,
      assignment: Object.fromEntries(instanceIds.map((id) => [id, "A"])),
    }));
  }, [instanceIds]);

  const toggle = (id: string) =>
    setState((prev) => ({
      ...prev,
      assignment: {
        ...prev.assignment,
        [id]: prev.assignment[id] === "A" ? "B" : "A",
      },
    }));

  const setNote = (group: SplitGroupKey, value: string) =>
    setState((prev) => ({
      ...prev,
      notes: { ...prev.notes, [group]: value },
    }));

  const validationError = useMemo(
    () => (instanceIds ? validateSplit(instanceIds, state) : "cargando"),
    [instanceIds, state],
  );

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

  const groupPanel = (group: SplitGroupKey, title: string) => {
    const count = instancesOfGroup(instanceIds, state.assignment, group).length;
    return (
      <div className="space-y-2 rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
              GROUP_STYLE[group],
            )}
          >
            {group}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {title} ({count} {count === 1 ? "imagen" : "imágenes"})
          </span>
        </div>
        <EcoTypeNoteField
          value={state.notes[group]}
          onChange={(v) => setNote(group, v)}
          detectedSubtype={detectedSubtype}
        />
        {hasReport && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="report-group"
              checked={state.reportGroup === group}
              onChange={() =>
                setState((prev) => ({ ...prev, reportGroup: group }))
              }
            />
            El informe va a este estudio
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Tocá cada imagen para pasarla del estudio <b>A</b> al <b>B</b>. Todas
        arrancan en A; ninguna puede quedar sin asignar.
      </p>

      <div className="grid max-h-[40vh] grid-cols-4 gap-2 overflow-y-auto pr-1">
        {instanceIds.map((instanceId, index) => (
          <SplitThumb
            key={instanceId}
            itemId={itemId}
            instanceId={instanceId}
            index={index}
            group={state.assignment[instanceId] ?? "A"}
            onToggle={() => toggle(instanceId)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {groupPanel("A", "Estudio A")}
        {groupPanel("B", "Estudio B")}
      </div>

      {validationError && validationError !== "cargando" && (
        <p className="text-xs text-rose-700">{validationError}</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar división
        </Button>
        <Button
          type="button"
          className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white"
          disabled={!!validationError || isPending}
          onClick={() =>
            onConfirm(buildSplitGroups(instanceIds, state, hasReport))
          }
        >
          {isPending ? "Cargando…" : "Confirmar 2 estudios"}
        </Button>
      </div>
    </div>
  );
};

interface SplitThumbProps {
  itemId: string;
  instanceId: string;
  index: number;
  group: SplitGroupKey;
  onToggle: () => void;
}

const SplitThumb = ({
  itemId,
  instanceId,
  index,
  group,
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
      title={`Imagen ${index + 1} — estudio ${group} (tocá para cambiar)`}
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
          GROUP_STYLE[group],
        )}
      >
        {group}
      </span>
    </button>
  );
};
