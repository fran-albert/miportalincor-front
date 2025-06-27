// src/components/OsteoarticularHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Osteoarticular } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  data: Osteoarticular;
}

export default function OsteoarticularHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Osteoarticular
      </h4>

      {/* MMSS */}
      <div className="flex items-center space-x-2 text-black">
        <Label>MMSS Sin Alteraciones:</Label>
        <Checkbox checked={data.mmssSin} disabled />
        {data.mmssObs && <span className="ml-4">{data.mmssObs}</span>}
      </div>

      {/* MMII */}
      <div className="flex items-center space-x-2 text-black">
        <Label>MMII Sin Alteraciones:</Label>
        <Checkbox checked={data.mmiiSin} disabled />
        {data.mmiiObs && <span className="ml-4">{data.mmiiObs}</span>}
      </div>

      {/* Columna */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Columna Sin Alteraciones:</Label>
        <Checkbox checked={data.columnaSin} disabled />
        {data.columnaObs && <span className="ml-4">{data.columnaObs}</span>}
      </div>

      {/* Amputaciones */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Amputaciones:</Label>
        <Checkbox checked={data.amputaciones} disabled />
        {data.amputacionesObs && (
          <span className="ml-4">{data.amputacionesObs}</span>
        )}
      </div>
    </div>
  );
}
