// src/components/NeurologicoHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Neurologico {
  sinAlteraciones: boolean;
  observaciones: string;
}

interface Props {
  data: Neurologico;
}

export default function NeurologicoHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Neurológico
      </h4>

      {/* Sin alteraciones */}
      <div className="flex items-center space-x-2 text-black">
        <Checkbox id="neu-sin" checked={data.sinAlteraciones} disabled />
        <Label htmlFor="neu-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones */}
      {data.observaciones && (
        <div>
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{data.observaciones}</p>
        </div>
      )}
    </div>
  );
}
