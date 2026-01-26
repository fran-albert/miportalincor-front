// src/components/ToraxHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Torax } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  data: Torax;
}

export default function ToraxHtml({ data }: Props) {
  // Si no hay ningún dato, no mostrar la sección
  const hasData = data.deformaciones !== undefined || data.cicatrices !== undefined;
  if (!hasData) return null;

  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Tórax</h4>

      {/* Deformaciones - solo mostrar si fue seleccionado */}
      {data.deformaciones !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Label>Deformaciones:</Label>
          <Checkbox id="torax-def-si" checked={data.deformaciones === "si"} disabled />
          <Label htmlFor="torax-def-si">Sí</Label>
          <Checkbox id="torax-def-no" checked={data.deformaciones === "no"} disabled />
          <Label htmlFor="torax-def-no">No</Label>
          {data.deformacionesObs?.trim() && (
            <span className="ml-4">{data.deformacionesObs}</span>
          )}
        </div>
      )}

      {/* Cicatrices - solo mostrar si fue seleccionado */}
      {data.cicatrices !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Label>Cicatrices:</Label>
          <Checkbox id="torax-cic-si" checked={data.cicatrices === "si"} disabled />
          <Label htmlFor="torax-cic-si">Sí</Label>
          <Checkbox id="torax-cic-no" checked={data.cicatrices === "no"} disabled />
          <Label htmlFor="torax-cic-no">No</Label>
          {data.cicatricesObs?.trim() && (
            <span className="ml-4">{data.cicatricesObs}</span>
          )}
        </div>
      )}
    </div>
  );
}
