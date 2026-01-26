// src/components/BucodentalHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Bucodental {
  sinAlteraciones?: boolean;
  caries?: boolean;
  faltanPiezas?: boolean;
  observaciones?: string;
}

interface Props {
  data: Bucodental;
}

export default function BucodentalHtml({ data }: Props) {
  // Si no hay ningún dato, no mostrar la sección
  const hasData =
    data.sinAlteraciones !== undefined ||
    data.caries !== undefined ||
    data.faltanPiezas !== undefined ||
    data.observaciones?.trim();

  if (!hasData) return null;

  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Examen Bucodental</h4>

      <div className="flex flex-wrap gap-6 text-black">
        {data.sinAlteraciones !== undefined && (
          <div className="flex items-center space-x-2">
            <Checkbox id="buc-sin" checked={data.sinAlteraciones === true} disabled />
            <Label htmlFor="buc-sin">Sin alteraciones</Label>
          </div>
        )}

        {data.caries !== undefined && (
          <div className="flex items-center space-x-2">
            <Checkbox id="buc-caries" checked={data.caries === true} disabled />
            <Label htmlFor="buc-caries">Caries</Label>
          </div>
        )}

        {data.faltanPiezas !== undefined && (
          <div className="flex items-center space-x-2">
            <Checkbox id="buc-faltan" checked={data.faltanPiezas === true} disabled />
            <Label htmlFor="buc-faltan">Faltan piezas</Label>
          </div>
        )}
      </div>

      {data.observaciones?.trim() && (
        <div>
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{data.observaciones}</p>
        </div>
      )}
    </div>
  );
}
