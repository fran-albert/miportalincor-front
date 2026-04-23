import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const aspectoOptions = ["Bueno", "Regular", "Malo"] as const;

interface Props {
  isEditing: boolean;
  medicalEvaluation: { aspectoGeneral?: string };
  handleAspectoGeneralChange: (value: string) => void;
}

export default function AspectoGeneralCheckboxes({
  isEditing,
  medicalEvaluation,
  handleAspectoGeneralChange,
}: Props) {
  const selectedValue = medicalEvaluation.aspectoGeneral;

  // En modo view, solo mostrar si hay un valor seleccionado
  if (!isEditing) {
    if (!selectedValue?.trim()) return null;
    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-greenPrimary">
          Aspecto general
        </Label>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
          {selectedValue}
        </div>
      </div>
    );
  }

  // En modo editing, mostrar todas las opciones
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-greenPrimary">
        Aspecto general
      </Label>
      <div className="grid gap-3 sm:grid-cols-3">
        {aspectoOptions.map((opt) => {
          const isSelected = selectedValue === opt;
          const id = `aspecto-${opt}`;
          return (
            <button
              key={opt}
              id={id}
              type="button"
              disabled={!isEditing}
              onClick={() => handleAspectoGeneralChange(selectedValue === opt ? "" : opt)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors",
                isSelected
                  ? "border-greenPrimary bg-greenPrimary/8 text-greenSecondary shadow-sm"
                  : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-greenPrimary/30 hover:bg-white",
                !isEditing && "cursor-default opacity-80"
              )}
            >
              <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                Aspecto
              </span>
              <span className="mt-1 block">
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
