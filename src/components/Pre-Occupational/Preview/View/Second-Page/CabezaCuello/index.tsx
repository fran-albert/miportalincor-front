// src/components/CabezaCuelloHtml.tsx
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export interface CabezaCuello {
  sinAlteraciones: boolean;
  observaciones: string;
}

interface Props {
  data: CabezaCuello;
}

export default function CabezaCuelloHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Cabeza y Cuello</h4>

      <div className="flex items-center space-x-2 text-black">
        <Checkbox
          id="cabeza-sin"
          checked={data.sinAlteraciones}
          disabled
          className="w-5 h-5"
        />
        <Label htmlFor="cabeza-sin">Sin alteraciones</Label>
      </div>

      {data.observaciones && (
        <div>
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{data.observaciones}</p>
        </div>
      )}
    </div>
  );
}
