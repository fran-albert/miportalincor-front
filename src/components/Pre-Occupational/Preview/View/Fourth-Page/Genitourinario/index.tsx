// src/components/GenitourinarioHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Genitourinario } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  data: Genitourinario;
}

export default function GenitourinarioHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Genitourinario
      </h4>

      {/* Sin alteraciones */}
      <div className="flex items-center space-x-2 text-black">
        <Checkbox id="gen-sin" checked={data.sinAlteraciones} disabled />
        <Label htmlFor="gen-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones generales */}
      {data.observaciones && (
        <div>
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{data.observaciones}</p>
        </div>
      )}

      {/* Varicocele */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Varicocele:</Label>
        <Checkbox id="gen-var-si" checked={data.varicocele} disabled />
        <Label htmlFor="gen-var-si">Sí</Label>
        <Checkbox id="gen-var-no" checked={!data.varicocele} disabled />
        <Label htmlFor="gen-var-no">No</Label>

        {data.varicoceleObs && (
          <span className="ml-4">{data.varicoceleObs}</span>
        )}
      </div>
    </div>
  );
}
