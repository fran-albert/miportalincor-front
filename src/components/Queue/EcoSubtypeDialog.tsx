import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  onConfirm: (consultationTypeId: number) => void;
  /** Continuar sin definir subtipo (solo si el catálogo está vacío/mal configurado). */
  onSkip: () => void;
  isSaving: boolean;
}

/**
 * Selector obligatorio del tipo de ecografía: se interpone cuando la
 * secretaria llama (o pasa a espera médica) un turno de eco sin subtipo.
 * Sin subtipo elegido la acción no se completa — el tipo viaja por la
 * worklist al ecógrafo y define qué examen se hace.
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
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedId(null);
    }
  }, [open, entry?.id]);

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
            Elegilo para que el estudio llegue al ecógrafo con los datos del
            paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-1">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Cargando tipos…</p>
          )}
          {!isLoading && ecoSubtypes.length === 0 && (
            <p className="text-sm text-rose-700">
              No hay subtipos de ecografía configurados. Avisale al
              administrador; mientras tanto se puede continuar y corregir el
              tipo desde el calendario.
            </p>
          )}
          {ecoSubtypes.map((subtype) => (
            <Button
              key={subtype.id}
              type="button"
              variant="outline"
              onClick={() => setSelectedId(subtype.id)}
              className={cn(
                "h-auto justify-start whitespace-normal py-2.5 text-left text-sm font-medium",
                selectedId === subtype.id
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
              )}
            >
              {subtype.name}
            </Button>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          {!isLoading && ecoSubtypes.length === 0 ? (
            <Button type="button" variant="outline" onClick={onSkip}>
              Continuar sin definir
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => selectedId !== null && onConfirm(selectedId)}
              disabled={selectedId === null || isSaving}
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
