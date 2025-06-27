// src/components/BucodentalHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Bucodental {
  sinAlteraciones: boolean;
  caries: boolean;
  faltanPiezas: boolean;
  observaciones: string;
}

interface Props {
  data: Bucodental;
}

export default function BucodentalHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Examen Bucodental</h4>

      <div className="flex flex-wrap gap-6 text-black">
        <div className="flex items-center space-x-2">
          <Checkbox id="buc-sin" checked={data.sinAlteraciones} disabled />
          <Label htmlFor="buc-sin">Sin alteraciones</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="buc-caries" checked={data.caries} disabled />
          <Label htmlFor="buc-caries">Caries</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="buc-faltan" checked={data.faltanPiezas} disabled />
          <Label htmlFor="buc-faltan">Faltan piezas</Label>
        </div>
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
