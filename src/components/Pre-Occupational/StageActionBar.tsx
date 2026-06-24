import { Button } from "@/components/ui/button";

interface StageActionBarProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  className?: string;
}

export default function StageActionBar({
  onCancel,
  onSave,
  isSaving = false,
  saveLabel = "Guardar cambios",
  savingLabel = "Guardando...",
  className = "",
}: StageActionBarProps) {
  return (
    <div
      className={`mt-4 flex justify-end gap-4 rounded-lg border border-slate-200 bg-white p-4 ${className}`}
    >
      <Button variant="destructive" className="shadow-sm" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        className="border border-greenPrimary/10 bg-gradient-to-r from-greenSecondary via-greenPrimary to-incor text-white shadow-[0_16px_30px_-18px_rgba(12,72,74,0.9)] hover:from-greenSecondary hover:via-greenSecondary hover:to-greenPrimary"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}
