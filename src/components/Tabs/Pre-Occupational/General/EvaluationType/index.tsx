 
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
  isEditing: boolean;
}

export default function EvaluationType({ isEditing }: Props) {
  const [selected, setSelected] = useState("preocupacional");

  const options = [
    { value: "preocupacional", label: "Preocupacional" },
    { value: "periodico", label: "Periódico" },
    { value: "salida", label: "Salida (Retiro)" },
    { value: "cambio", label: "Cambio de puesto" },
    { value: "libreta", label: "Libreta sanitaria" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={option.value}
            checked={selected === option.value}
            onCheckedChange={() => isEditing && setSelected(option.value)}
            disabled={!isEditing} // 🚀 Deshabilita cuando no está en edición
            className="rounded-md transition-all text-greenPrimary disabled:opacity-50"
          />
          <Label htmlFor={option.value} className="text-sm font-medium">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
