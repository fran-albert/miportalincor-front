import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, FileText, Save } from "lucide-react";

interface MonthlySummaryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  patientName?: string;
  programName?: string;
  monthValue: string;
  onMonthChange: (value: string) => void;
  titleValue: string;
  onTitleChange: (value: string) => void;
  situation: string;
  onSituationChange: (value: string) => void;
  evolution: string;
  onEvolutionChange: (value: string) => void;
  nextObjective: string;
  onNextObjectiveChange: (value: string) => void;
  visibleToPatient: boolean;
  onVisibleToPatientChange: (value: boolean) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function MonthlySummaryFormDialog({
  open,
  onOpenChange,
  mode,
  patientName,
  programName,
  monthValue,
  onMonthChange,
  titleValue,
  onTitleChange,
  situation,
  onSituationChange,
  evolution,
  onEvolutionChange,
  nextObjective,
  onNextObjectiveChange,
  visibleToPatient,
  onVisibleToPatientChange,
  onSubmit,
  isSubmitting = false,
}: MonthlySummaryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-h-[88vh] max-w-3xl overflow-hidden p-0 sm:w-full sm:rounded-2xl">
        <div className="flex h-full max-h-[88vh] flex-col">
          <DialogHeader className="border-b bg-gradient-to-r from-cyan-50 via-white to-slate-50 px-5 py-5 sm:px-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <DialogTitle>
                  {mode === "create" ? "Nuevo resumen" : "Editar resumen"}
                </DialogTitle>
                <p className="text-sm text-slate-500">
                  Completá el resumen del mes y decidí si querés compartirlo con el paciente.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    Paciente
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {patientName || "-"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    Programa
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {programName || "-"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    Acción
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {mode === "create" ? "Crear resumen" : "Actualizar resumen"}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="summary-month">Mes</Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="summary-month"
                    type="month"
                    value={monthValue}
                    onChange={(event) => onMonthChange(event.target.value)}
                    disabled={mode === "edit"}
                    className="h-10 pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary-title-dialog">Título</Label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="summary-title-dialog"
                    value={titleValue}
                    onChange={(event) => onTitleChange(event.target.value)}
                    className="h-10 pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary-situation-dialog">Situación general</Label>
                <Textarea
                  id="summary-situation-dialog"
                  value={situation}
                  onChange={(event) => onSituationChange(event.target.value)}
                  rows={5}
                  className="min-h-[120px] text-sm leading-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary-evolution-dialog">Evolución observada</Label>
                <Textarea
                  id="summary-evolution-dialog"
                  value={evolution}
                  onChange={(event) => onEvolutionChange(event.target.value)}
                  rows={5}
                  className="min-h-[120px] text-sm leading-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary-next-objective-dialog">
                  Objetivo próximo mes
                </Label>
                <Textarea
                  id="summary-next-objective-dialog"
                  value={nextObjective}
                  onChange={(event) => onNextObjectiveChange(event.target.value)}
                  rows={4}
                  className="min-h-[110px] text-sm leading-6"
                />
              </div>

              <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-3">
                <Switch
                  checked={visibleToPatient}
                  onCheckedChange={onVisibleToPatientChange}
                />
                <span className="text-sm font-medium text-slate-700">
                  Visible para paciente
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t px-5 py-4 sm:px-6">
            <Button
              className="h-10 px-4 text-sm font-semibold"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
