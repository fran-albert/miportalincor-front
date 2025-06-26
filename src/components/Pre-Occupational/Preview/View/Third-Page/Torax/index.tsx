// src/components/ToraxHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Torax {
  deformaciones: "si" | "no";
  deformacionesObs: string;
  cicatrices: "si" | "no";
  cicatricesObs: string;
}

interface Props {
  data: Torax;
}

export default function ToraxHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Tórax</h4>

      {/* Deformaciones */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Deformaciones:</Label>
        <Checkbox id="torax-def-si" checked={data.deformaciones === "si"} disabled />
        <Label htmlFor="torax-def-si">Sí</Label>
        <Checkbox id="torax-def-no" checked={data.deformaciones === "no"} disabled />
        <Label htmlFor="torax-def-no">No</Label>
        {data.deformacionesObs && (
          <span className="ml-4">{data.deformacionesObs}</span>
        )}
      </div>

      {/* Cicatrices */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Cicatrices:</Label>
        <Checkbox id="torax-cic-si" checked={data.cicatrices === "si"} disabled />
        <Label htmlFor="torax-cic-si">Sí</Label>
        <Checkbox id="torax-cic-no" checked={data.cicatrices === "no"} disabled />
        <Label htmlFor="torax-cic-no">No</Label>
        {data.cicatricesObs && (
          <span className="ml-4">{data.cicatricesObs}</span>
        )}
      </div>
    </div>
  );
}
