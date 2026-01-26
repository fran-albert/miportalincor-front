// src/components/CirculatorioHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Circulatorio } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  data: Circulatorio;
}

export default function CirculatorioHtml({ data }: Props) {
  // Si no hay ningún dato relevante, no mostrar la sección
  const hasData =
    data.frecuenciaCardiaca?.trim() ||
    data.presion?.trim() ||
    data.sinAlteraciones !== undefined ||
    data.varices !== undefined ||
    data.observaciones?.trim();

  if (!hasData) return null;

  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Circulatorio
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-black">
        {/* Frecuencia Cardíaca - solo mostrar si tiene valor */}
        {data.frecuenciaCardiaca?.trim() && (
          <div className="flex items-center space-x-2">
            <Label>Frecuencia Cardíaca:</Label>
            <span>{data.frecuenciaCardiaca}</span>
            <span>x minuto</span>
          </div>
        )}

        {/* Tensión Arterial - solo mostrar si tiene valor */}
        {data.presion?.trim() && (
          <div className="flex items-center space-x-2">
            <Label>TA:</Label>
            <span>{data.presion}</span>
            <span>mmHg</span>
          </div>
        )}

        {/* Sin alteraciones - solo mostrar si fue seleccionado */}
        {data.sinAlteraciones !== undefined && (
          <div className="flex items-center space-x-2">
            <Checkbox id="circ-sinalt" checked={data.sinAlteraciones === true} disabled />
            <Label htmlFor="circ-sinalt">Sin alteraciones</Label>
          </div>
        )}
      </div>

      {/* Observaciones - solo mostrar si tiene contenido */}
      {data.observaciones?.trim() && (
        <div className="space-y-2 text-black">
          <Label className="mb-1">Observaciones:</Label>
          <p>{data.observaciones}</p>
        </div>
      )}

      {/* Várices - solo mostrar si fue seleccionado */}
      {data.varices !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Label>Várices:</Label>
          <Checkbox id="circ-varices-si" checked={data.varices === true} disabled />
          <Label htmlFor="circ-varices-si">Sí</Label>
          <Checkbox id="circ-varices-no" checked={data.varices === false} disabled />
          <Label htmlFor="circ-varices-no">No</Label>
          {data.varicesObs?.trim() && <span className="ml-4">{data.varicesObs}</span>}
        </div>
      )}
    </div>
  );
}
