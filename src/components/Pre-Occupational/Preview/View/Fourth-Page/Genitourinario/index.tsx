// src/components/GenitourinarioHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Genitourinario } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  data: Genitourinario;
}

export default function GenitourinarioHtml({ data }: Props) {
  return (
    <div className="space-y-6 mt-6 text-black">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Genitourinario
      </h4>

      {/* Sin alteraciones */}
      <div className="grid grid-cols-[max-content,1fr] items-center gap-x-2">
        <Checkbox id="gen-sin" checked={data.sinAlteraciones} disabled />
        <Label htmlFor="gen-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones generales */}
      {data.observaciones && (
        <div className="grid grid-cols-[max-content,1fr] items-start gap-x-2">
          <Label className="pt-1">Observaciones:</Label>
          <p>{data.observaciones}</p>
        </div>
      )}

      {/* Varicocele */}
      <div className="grid grid-cols-[max-content,1fr] items-center gap-x-2">
        <Label>Varicocele:</Label>
        <div className="flex items-center space-x-4">
          <Checkbox id="gen-var-si" checked={data.varicocele === true} disabled />
          <Label htmlFor="gen-var-si">Sí</Label>
          <Checkbox id="gen-var-no" checked={data.varicocele === false} disabled />
          <Label htmlFor="gen-var-no">No</Label>
        </div>
      </div>

      {data.varicoceleObs && (
        <div className="grid grid-cols-[max-content,1fr] items-start gap-x-2">
          <Label className="pt-1">Observaciones:</Label>
          <p>{data.varicoceleObs}</p>
        </div>
      )}

      {/* F.U.M | Partos */}
      {/* Embarazos | Cesárea */}
      <div className="grid grid-cols-[max-content,1fr,max-content,1fr] gap-x-6 gap-y-4 items-center">
        {/* Row 1 */}
        <Label htmlFor="gen-fum" className="text-right">
          F.U.M:
        </Label>
        <span id="gen-fum">{data.fum || "-"}</span>

        <Label htmlFor="gen-partos" className="text-right">
          Partos:
        </Label>
        <span id="gen-partos">{data.partos ?? "-"}</span>

        {/* Row 2 */}
        <Label htmlFor="gen-embarazos" className="text-right">
          Embarazos:
        </Label>
        <span id="gen-embarazos">{data.embarazos ?? "-"}</span>

        <Label htmlFor="gen-cesarea" className="text-right">
          Cesárea:
        </Label>
        <span id="gen-cesarea">{data.cesarea ?? "-"}</span>
      </div>
    </div>
  );
}