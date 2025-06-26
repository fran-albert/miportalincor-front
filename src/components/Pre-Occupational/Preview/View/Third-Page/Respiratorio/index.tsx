// src/components/RespiratorioHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Respiratorio {
  frecuenciaRespiratoria: string;
  oximetria: string;
  sinAlteraciones: boolean;
  observaciones: string;
}

interface Props {
  data: Respiratorio;
}

export default function RespiratorioHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Aparato Respiratorio</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-black">
        <div className="flex items-center space-x-2">
          <Label>Frecuencia Respiratoria:</Label>
          <span>{data.frecuenciaRespiratoria || "—"}</span>
          <span>x minuto</span>
        </div>

        <div className="flex items-center space-x-2">
          <Label>Oximetría:</Label>
          <span>{data.oximetria || "—"}</span>
          <span>%</span>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="resp-sinalt" checked={data.sinAlteraciones} disabled />
          <Label htmlFor="resp-sinalt">Sin alteraciones</Label>
        </div>
      </div>

      {data.observaciones && (
        <div className="space-y-1 text-black">
          <Label className="mb-1">Observaciones:</Label>
          <p>{data.observaciones}</p>
        </div>
      )}
    </div>
  );
}
