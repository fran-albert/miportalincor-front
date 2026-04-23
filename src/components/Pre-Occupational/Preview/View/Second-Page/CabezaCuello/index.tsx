// src/components/CabezaCuelloHtml.tsx
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export interface CabezaCuello {
  sinAlteraciones?: boolean;
  observaciones?: string;
}

interface Props {
  data: CabezaCuello;
}

export default function CabezaCuelloHtml({ data }: Props) {
  // Si no hay ningún dato, no mostrar la sección
  const hasData = data.sinAlteraciones !== undefined || data.observaciones?.trim();
  if (!hasData) return null;

  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Cabeza y Cuello</h4>

      {data.sinAlteraciones !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Checkbox
            id="cabeza-sin"
            checked={data.sinAlteraciones === true}
            disabled
            className="w-5 h-5"
          />
          <Label htmlFor="cabeza-sin">Sin alteraciones</Label>
        </div>
      )}

      {data.observaciones?.trim() && (
        <div>
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{data.observaciones}</p>
        </div>
      )}
    </div>
  );
}
