import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
      <div className="flex items-center">
        <Label className="whitespace-nowrap mr-4">Aspecto General:</Label>
        <span className="text-base font-medium">{selectedValue}</span>
      </div>
    );
  }

  // En modo editing, mostrar todas las opciones
  return (
    <div className="flex items-center">
      <Label className="whitespace-nowrap mr-4">Aspecto General:</Label>
      <div className="flex items-center gap-8">
        {aspectoOptions.map((opt) => {
          const isChecked = selectedValue === opt;
          const id = `aspecto-${opt}`;
          return (
            <div key={opt} className="inline-flex items-center space-x-2">
              <Checkbox
                id={id}
                checked={isChecked}
                disabled={!isEditing}
                onCheckedChange={(checked) => {
                  if (!isEditing) return;
                  handleAspectoGeneralChange(checked ? opt : "");
                }}
                className="w-5 h-5"
              />
              <label
                htmlFor={id}
                className="text-base font-medium"
              >
                {opt}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
