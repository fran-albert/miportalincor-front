import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEcoSubtypes } from "@/hooks/ConsultationType";
import type { QueueEntry } from "@/types/Queue";

interface EcoSubtypeDialogProps {
  /** Entrada de cola pendiente de subtipo; null = diálogo cerrado. */
  entry: QueueEntry | null;
  /** Texto del botón de confirmar según la acción que sigue (llamar / pasar). */
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: (consultationTypeIds: number[]) => void;
  /** Continuar sin definir subtipo (solo si el catálogo está vacío/mal configurado). */
  onSkip: () => void;
  isSaving: boolean;
}

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Selector obligatorio del tipo de ecografía: se interpone cuando la
 * secretaria llama (o pasa a espera médica) un turno de eco sin subtipo.
 * La secretaria escribe para buscar y elige uno o varios tipos (un paciente
 * puede hacerse más de una eco en el mismo turno); los elegidos quedan como
 * chips. Sin al menos un tipo elegido la acción no se completa — los tipos
 * viajan por la worklist al ecógrafo y definen qué examen se hace.
 */
export function EcoSubtypeDialog({
  entry,
  confirmLabel,
  onCancel,
  onConfirm,
  onSkip,
  isSaving,
}: EcoSubtypeDialogProps) {
  const open = entry !== null;
  const { ecoSubtypes, isLoading } = useEcoSubtypes({ enabled: open });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch("");
    }
  }, [open, entry?.id]);

  const toggleSubtype = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const selectedSubtypes = useMemo(
    () => ecoSubtypes.filter((s) => selectedIds.includes(s.id)),
    [ecoSubtypes, selectedIds],
  );

  const filtered = useMemo(() => {
    const term = normalize(search).trim();
    if (!term) return ecoSubtypes;
    return ecoSubtypes.filter((s) => normalize(s.name).includes(term));
  }, [ecoSubtypes, search]);

  const catalogEmpty = !isLoading && ecoSubtypes.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) {
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Qué ecografía se va a hacer?</DialogTitle>
          <DialogDescription>
            El turno de <span className="font-semibold">{entry?.patientName}</span>{" "}
            con {entry?.doctorName} no tiene el tipo de ecografía definido.
            Buscá y elegí uno o más (si el paciente se hace varias) para que el
            estudio llegue al ecógrafo con los datos del paciente.
          </DialogDescription>
        </DialogHeader>

        {catalogEmpty ? (
          <p className="py-1 text-sm text-rose-700">
            No hay subtipos de ecografía configurados. Avisale al administrador;
            mientras tanto se puede continuar y corregir el tipo desde el
            calendario.
          </p>
        ) : (
          <div className="grid gap-2 py-1">
            {selectedSubtypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedSubtypes.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900"
                  >
                    {s.name}
                    <button
                      type="button"
                      aria-label={`Quitar ${s.name}`}
                      onClick={() => toggleSubtype(s.id)}
                      className="rounded-full text-emerald-700 hover:text-emerald-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <Command shouldFilter={false} className="rounded-md border">
              <CommandInput
                placeholder="Escribí el tipo (abdominal, doppler, mama…)"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {isLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    Cargando tipos…
                  </p>
                ) : (
                  <>
                    <CommandEmpty>Sin coincidencias.</CommandEmpty>
                    {filtered.map((s) => {
                      const isSelected = selectedIds.includes(s.id);
                      return (
                        <CommandItem
                          key={s.id}
                          value={s.name}
                          onSelect={() => {
                            toggleSubtype(s.id);
                            setSearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-emerald-600",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {s.name}
                        </CommandItem>
                      );
                    })}
                  </>
                )}
              </CommandList>
            </Command>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          {catalogEmpty ? (
            <Button type="button" variant="outline" onClick={onSkip}>
              Continuar sin definir
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => selectedIds.length > 0 && onConfirm(selectedIds)}
              disabled={selectedIds.length === 0 || isSaving}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSaving ? "Guardando…" : confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
