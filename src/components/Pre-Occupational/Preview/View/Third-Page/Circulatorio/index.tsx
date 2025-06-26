// src/components/CirculatorioHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Circulatorio {
  frecuenciaCardiaca: string;
  presion: string;
  sinAlteraciones: boolean;
  observaciones: string;
  varices: boolean;
  varicesObs: string;
}

interface Props {
  data: Circulatorio;
}

export default function CirculatorioHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Circulatorio
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-black">
        {/* Frecuencia Cardíaca */}
        <div className="flex items-center space-x-2">
          <Label>Frecuencia Cardíaca:</Label>
          <span>{data.frecuenciaCardiaca || "—"}</span>
          <span>x minuto</span>
        </div>

        {/* Tensión Arterial */}
        <div className="flex items-center space-x-2">
          <Label>TA:</Label>
          <span>{data.presion || "—"}</span>
          <span>mmHg</span>
        </div>

        {/* Sin alteraciones */}
        <div className="flex items-center space-x-2">
          <Checkbox id="circ-sinalt" checked={data.sinAlteraciones} disabled />
          <Label htmlFor="circ-sinalt">Sin alteraciones</Label>
        </div>
      </div>

      {/* Observaciones */}
      {data.observaciones && (
        <div className="space-y-2 text-black">
          <Label className="mb-1">Observaciones:</Label>
          <p>{data.observaciones}</p>
        </div>
      )}

      {/* Várices */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Várices:</Label>
        <Checkbox id="circ-varices-si" checked={data.varices} disabled />
        <Label htmlFor="circ-varices-si">Sí</Label>
        <Checkbox id="circ-varices-no" checked={!data.varices} disabled />
        <Label htmlFor="circ-varices-no">No</Label>
        {data.varicesObs && <span className="ml-4">{data.varicesObs}</span>}
      </div>
    </div>
  );
}
