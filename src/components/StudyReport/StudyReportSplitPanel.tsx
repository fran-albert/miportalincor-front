import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import {
  getStudyReportInboxImagePreview,
  getStudyReportInboxImages,
} from "@/api/StudyReport/study-report.actions";
import type {
  StudyReportSplitGroup,
  StudyReportTemplate,
} from "@/types/StudyReport/StudyReport.types";

const PREVIEW_CONCURRENCY = 4;
const MAX_GROUPS = 6;

// Un color por informe (A, B, C, …); se elige por posición del grupo.
const GROUP_COLORS = [
  "bg-sky-600",
  "bg-fuchsia-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
];

const groupLetter = (index: number): string => String.fromCharCode(65 + index);

interface SplitGroup {
  key: string;
  label: string;
  templateKey: string;
}

interface StudyReportSplitPanelProps {
  itemId: string;
  templates: StudyReportTemplate[];
  isPending: boolean;
  onConfirm: (groups: StudyReportSplitGroup[]) => void;
  onCancel: () => void;
}

interface PreviewState {
  status: "loading" | "error" | "ready";
  urls: Record<string, string>;
}

const loadPreviews = async (
  itemId: string,
  instanceIds: string[],
  isActive: () => boolean,
  createdUrls: string[],
): Promise<Record<string, string>> => {
  const urls: Record<string, string> = {};
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < instanceIds.length) {
      const index = nextIndex;
      nextIndex += 1;
      const instanceId = instanceIds[index];
      try {
        const blob = await getStudyReportInboxImagePreview(itemId, instanceId);
        const url = URL.createObjectURL(blob);
        if (!isActive()) {
          URL.revokeObjectURL(url);
          continue;
        }
        createdUrls.push(url);
        urls[instanceId] = url;
      } catch {
        // Una miniatura caída no bloquea el reparto del resto del estudio.
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(PREVIEW_CONCURRENCY, instanceIds.length) },
      () => worker(),
    ),
  );
  return urls;
};

export const StudyReportSplitPanel = ({
  itemId,
  templates,
  isPending,
  onConfirm,
  onCancel,
}: StudyReportSplitPanelProps) => {
  const defaultTemplateKey = templates[0]?.key ?? "";
  const [instanceIds, setInstanceIds] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [previews, setPreviews] = useState<PreviewState>({
    status: "loading",
    urls: {},
  });
  const nextKey = useRef(3);
  const [groups, setGroups] = useState<SplitGroup[]>([
    { key: "g1", label: "", templateKey: defaultTemplateKey },
    { key: "g2", label: "", templateKey: defaultTemplateKey },
  ]);
  // A qué informe (group.key) está asignada cada imagen. Siempre todas.
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const createdUrls: string[] = [];
    setLoadError(false);
    setInstanceIds(null);
    setPreviews({ status: "loading", urls: {} });

    const load = async (): Promise<void> => {
      try {
        const ids = await getStudyReportInboxImages(itemId);
        if (!active) return;
        setInstanceIds(ids);
        // Todas arrancan en el primer informe.
        setAssignment(Object.fromEntries(ids.map((id) => [id, "g1"])));
        if (ids.length === 0) {
          setPreviews({ status: "ready", urls: {} });
          return;
        }
        const urls = await loadPreviews(itemId, ids, () => active, createdUrls);
        if (active) setPreviews({ status: "ready", urls });
      } catch {
        if (active) {
          setLoadError(true);
          setPreviews({ status: "error", urls: {} });
        }
      }
    };

    void load();
    return () => {
      active = false;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [itemId]);

  const countOf = (key: string): number =>
    (instanceIds ?? []).filter((id) => assignment[id] === key).length;

  const validationError = useMemo(() => {
    if (!instanceIds) return "cargando";
    for (const group of groups) {
      const count = instanceIds.filter((id) => assignment[id] === group.key)
        .length;
      if (count === 0)
        return "Cada informe debe tener al menos una imagen asignada.";
      if (!group.label.trim()) return "Cada informe necesita un nombre.";
      if (!group.templateKey) return "Cada informe necesita una plantilla.";
    }
    const labels = groups.map((group) => group.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length)
      return "Los nombres de los informes deben ser distintos.";
    return null;
  }, [instanceIds, groups, assignment]);

  // Un click en la miniatura la pasa al siguiente informe (A → B → C → A).
  const cycleImage = (instanceId: string) => {
    setAssignment((current) => {
      const currentKey = current[instanceId] ?? groups[0].key;
      const currentIndex = groups.findIndex((g) => g.key === currentKey);
      const nextGroup = groups[(currentIndex + 1) % groups.length];
      return { ...current, [instanceId]: nextGroup.key };
    });
  };

  const setLabel = (key: string, label: string) => {
    setGroups((current) =>
      current.map((group) => (group.key === key ? { ...group, label } : group)),
    );
  };

  const setTemplate = (key: string, templateKey: string) => {
    setGroups((current) =>
      current.map((group) =>
        group.key === key ? { ...group, templateKey } : group,
      ),
    );
  };

  const addGroup = () => {
    if (groups.length >= MAX_GROUPS) return;
    const key = `g${nextKey.current}`;
    nextKey.current += 1;
    setGroups((current) => [
      ...current,
      { key, label: "", templateKey: defaultTemplateKey },
    ]);
  };

  const removeGroup = (key: string) => {
    if (groups.length <= 2) return;
    const fallback = groups.find((group) => group.key !== key)?.key ?? "g1";
    setGroups((current) => current.filter((group) => group.key !== key));
    setAssignment((current) => {
      const next: Record<string, string> = {};
      for (const [instanceId, groupKey] of Object.entries(current)) {
        next[instanceId] = groupKey === key ? fallback : groupKey;
      }
      return next;
    });
  };

  const confirm = () => {
    if (!instanceIds || validationError) return;
    onConfirm(
      groups.map((group) => ({
        assignedInstanceIds: instanceIds.filter(
          (id) => assignment[id] === group.key,
        ),
        templateKey: group.templateKey,
        label: group.label.trim(),
      })),
    );
  };

  if (previews.status === "loading" || !instanceIds) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Cargando imágenes del estudio…
        </p>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (loadError || instanceIds.length === 0) {
    return (
      <div className="space-y-3 rounded-md border border-dashed p-5 text-sm text-muted-foreground">
        <p>
          {loadError
            ? "No se pudieron cargar las imágenes para dividir."
            : "Este estudio no tiene imágenes para dividir."}
        </p>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Volver
        </Button>
      </div>
    );
  }

  const colorOf = (key: string): string => {
    const index = groups.findIndex((group) => group.key === key);
    return GROUP_COLORS[index % GROUP_COLORS.length];
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Todas las imágenes arrancan en A. Tocá una miniatura para pasarla al
        siguiente informe (A → B → C…); cada informe debe conservar al menos una
        imagen.
      </p>

      <div className="grid max-h-[38vh] grid-cols-3 gap-2 overflow-y-auto pr-1 md:grid-cols-5">
        {instanceIds.map((instanceId, index) => {
          const key = assignment[instanceId] ?? groups[0].key;
          const letterIndex = groups.findIndex((group) => group.key === key);
          const url = previews.urls[instanceId];
          return (
            <button
              key={instanceId}
              type="button"
              onClick={() => cycleImage(instanceId)}
              className="relative overflow-hidden rounded-md border transition hover:ring-2 hover:ring-emerald-500"
              title={`Imagen ${index + 1} — informe ${groupLetter(letterIndex)}`}
            >
              {url ? (
                <img
                  src={url}
                  alt={`Imagen ${index + 1} para dividir`}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <span className="flex aspect-square items-center justify-center text-xs text-muted-foreground">
                  Sin preview
                </span>
              )}
              <span
                className={cn(
                  "absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
                  colorOf(key),
                )}
              >
                {groupLetter(letterIndex)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {groups.map((group, index) => (
          <div key={group.key} className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                <span
                  className={cn(
                    "mr-2 rounded-full px-2 py-1 text-xs text-white",
                    GROUP_COLORS[index % GROUP_COLORS.length],
                  )}
                >
                  {groupLetter(index)}
                </span>
                {countOf(group.key)}{" "}
                {countOf(group.key) === 1 ? "imagen" : "imágenes"}
              </p>
              {groups.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(group.key)}
                  title="Quitar este informe"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <label className="grid gap-1 text-sm font-medium">
              <span>Nombre del informe {groupLetter(index)}</span>
              <Input
                value={group.label}
                onChange={(event) => setLabel(group.key, event.target.value)}
                placeholder="Ej. Ginecológica"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              <span>Plantilla {groupLetter(index)}</span>
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={group.templateKey}
                onChange={(event) => setTemplate(group.key, event.target.value)}
              >
                <option value="">Seleccionar plantilla</option>
                {templates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
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
          Agregar informe
        </Button>
      )}

      {validationError && validationError !== "cargando" && (
        <p className="text-sm text-rose-700">{validationError}</p>
      )}

      <div className="flex justify-between gap-3 border-t pt-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={Boolean(validationError) || isPending}
          onClick={confirm}
        >
          {isPending
            ? "Dividiendo…"
            : `Confirmar división (${groups.length})`}
        </Button>
      </div>
    </div>
  );
};
