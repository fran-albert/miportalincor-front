import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getStudyReportInboxImagePreview,
  getStudyReportInboxImages,
} from "@/api/StudyReport/study-report.actions";
import type {
  StudyReportSplitGroup,
  StudyReportTemplate,
} from "@/types/StudyReport/StudyReport.types";
import {
  instancesOfGroup,
  SplitGroupKey,
  SplitState,
  validateSplit,
} from "@/components/StudyInbox/Dialogs/split-groups.helpers";

const GROUPS: SplitGroupKey[] = ["A", "B"];
const PREVIEW_CONCURRENCY = 4;

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

const GROUP_STYLE: Record<SplitGroupKey, string> = {
  A: "bg-sky-600",
  B: "bg-fuchsia-600",
};

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
  const [instanceIds, setInstanceIds] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [previews, setPreviews] = useState<PreviewState>({
    status: "loading",
    urls: {},
  });
  const [state, setState] = useState<SplitState>({
    assignment: {},
    notes: { A: "", B: "" },
    reportGroup: "A",
  });
  const [templateKeys, setTemplateKeys] = useState<Record<SplitGroupKey, string>>({
    A: templates[0]?.key ?? "",
    B: templates[0]?.key ?? "",
  });

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
        setState((current) => ({
          ...current,
          assignment: Object.fromEntries(ids.map((id) => [id, "A"])),
        }));
        if (ids.length === 0) {
          setPreviews({ status: "ready", urls: {} });
          return;
        }
        const urls = await loadPreviews(
          itemId,
          ids,
          () => active,
          createdUrls,
        );
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

  const validationError = useMemo(
    () =>
      instanceIds
        ? validateSplit(instanceIds, state) ??
          (GROUPS.some((group) => !templateKeys[group])
            ? "Cada grupo debe tener una plantilla."
            : null)
        : "cargando",
    [instanceIds, state, templateKeys],
  );

  const toggle = (instanceId: string) => {
    setState((current) => ({
      ...current,
      assignment: {
        ...current.assignment,
        [instanceId]: current.assignment[instanceId] === "A" ? "B" : "A",
      },
    }));
  };

  const setLabel = (group: SplitGroupKey, label: string) => {
    setState((current) => ({
      ...current,
      notes: { ...current.notes, [group]: label },
    }));
  };

  const setTemplate = (group: SplitGroupKey, templateKey: string) => {
    setTemplateKeys((current) => ({ ...current, [group]: templateKey }));
  };

  const confirm = () => {
    if (!instanceIds || validationError) return;
    onConfirm(
      GROUPS.map((group) => ({
        assignedInstanceIds: instancesOfGroup(
          instanceIds,
          state.assignment,
          group,
        ),
        templateKey: templateKeys[group],
        label: state.notes[group].trim(),
      })),
    );
  };

  if (previews.status === "loading" || !instanceIds) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Cargando imágenes del estudio…</p>
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
        <p>{loadError ? "No se pudieron cargar las imágenes para dividir." : "Este estudio no tiene imágenes para dividir."}</p>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Todas las imágenes arrancan en A. Tocá una miniatura para pasarla a B;
        cada grupo debe conservar al menos una imagen.
      </p>

      <div className="grid max-h-[38vh] grid-cols-3 gap-2 overflow-y-auto pr-1 md:grid-cols-5">
        {instanceIds.map((instanceId, index) => {
          const group = state.assignment[instanceId] ?? "A";
          const url = previews.urls[instanceId];
          return (
            <button
              key={instanceId}
              type="button"
              onClick={() => toggle(instanceId)}
              className="relative overflow-hidden rounded-md border transition hover:ring-2 hover:ring-emerald-500"
              title={`Imagen ${index + 1} — grupo ${group}`}
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
                  GROUP_STYLE[group],
                )}
              >
                {group}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {GROUPS.map((group) => {
          const count = instancesOfGroup(instanceIds, state.assignment, group).length;
          return (
            <div key={group} className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">
                <span className={cn("mr-2 rounded-full px-2 py-1 text-xs text-white", GROUP_STYLE[group])}>
                  {group}
                </span>
                {count} {count === 1 ? "imagen" : "imágenes"}
              </p>
              <label className="grid gap-1 text-sm font-medium">
                <span>Nombre del informe {group}</span>
                <Input
                  value={state.notes[group]}
                  onChange={(event) => setLabel(group, event.target.value)}
                  placeholder={group === "A" ? "Ej. Ginecológica" : "Ej. Mamaria"}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                <span>Plantilla {group}</span>
                <select
                  className="h-10 rounded-md border bg-background px-3"
                  value={templateKeys[group]}
                  onChange={(event) => setTemplate(group, event.target.value)}
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
          );
        })}
      </div>

      {validationError && validationError !== "cargando" && (
        <p className="text-sm text-rose-700">{validationError}</p>
      )}

      <div className="flex justify-between gap-3 border-t pt-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" disabled={Boolean(validationError) || isPending} onClick={confirm}>
          {isPending ? "Dividiendo…" : "Confirmar división"}
        </Button>
      </div>
    </div>
  );
};
