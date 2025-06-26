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
  return (
    <div className="flex items-center">
      <Label className="whitespace-nowrap mr-4">Aspecto General:</Label>
      <div className="flex items-center gap-8">
        {aspectoOptions.map((opt) => {
          const isChecked = medicalEvaluation.aspectoGeneral === opt;
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
                className={`text-base font-medium ${
                  !isEditing ? "text-gray-500" : ""
                }`}
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
