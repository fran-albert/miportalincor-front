// src/components/GastrointestinalHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Gastrointestinal } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  data: Gastrointestinal;
}

export default function GastrointestinalHtml({ data }: Props) {
  // Si no hay ningún dato, no mostrar la sección
  const hasData =
    data.sinAlteraciones !== undefined ||
    data.cicatrices !== undefined ||
    data.hernias !== undefined ||
    data.eventraciones !== undefined ||
    data.hemorroides !== undefined ||
    data.observaciones?.trim();

  if (!hasData) return null;

  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Gastrointestinal
      </h4>

      {/* Sin alteraciones - solo mostrar si fue seleccionado */}
      {data.sinAlteraciones !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Checkbox id="gi-sin" checked={data.sinAlteraciones === true} disabled />
          <Label htmlFor="gi-sin">Sin alteraciones</Label>
        </div>
      )}

      {/* Observaciones generales - solo si tiene contenido */}
      {data.observaciones?.trim() && (
        <div>
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{data.observaciones}</p>
        </div>
      )}

      {/* Cicatrices - solo mostrar si fue seleccionado */}
      {data.cicatrices !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Label>Cicatrices:</Label>
          <Checkbox id="gi-cic-si" checked={data.cicatrices === true} disabled />
          <Label htmlFor="gi-cic-si">Sí</Label>
          <Checkbox id="gi-cic-no" checked={data.cicatrices === false} disabled />
          <Label htmlFor="gi-cic-no">No</Label>
          {data.cicatricesObs?.trim() && <span className="ml-4">{data.cicatricesObs}</span>}
        </div>
      )}

      {/* Hernias - solo mostrar si fue seleccionado */}
      {data.hernias !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Label>Hernias:</Label>
          <Checkbox id="gi-her-si" checked={data.hernias === true} disabled />
          <Label htmlFor="gi-her-si">Sí</Label>
          <Checkbox id="gi-her-no" checked={data.hernias === false} disabled />
          <Label htmlFor="gi-her-no">No</Label>
          {data.herniasObs?.trim() && <span className="ml-4">{data.herniasObs}</span>}
        </div>
      )}

      {/* Eventraciones - solo mostrar si fue seleccionado */}
      {data.eventraciones !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Label>Eventraciones:</Label>
          <Checkbox id="gi-event-si" checked={data.eventraciones === true} disabled />
          <Label htmlFor="gi-event-si">Sí</Label>
          <Checkbox id="gi-event-no" checked={data.eventraciones === false} disabled />
          <Label htmlFor="gi-event-no">No</Label>
          {data.eventracionesObs?.trim() && <span className="ml-4">{data.eventracionesObs}</span>}
        </div>
      )}

      {/* Hemorroides - solo mostrar si fue seleccionado */}
      {data.hemorroides !== undefined && (
        <div className="flex items-center space-x-2 text-black">
          <Label>Hemorroides:</Label>
          <Checkbox id="gi-hemo-si" checked={data.hemorroides === true} disabled />
          <Label htmlFor="gi-hemo-si">Sí</Label>
          <Checkbox id="gi-hemo-no" checked={data.hemorroides === false} disabled />
          <Label htmlFor="gi-hemo-no">No</Label>
          {data.hemorroidesObs?.trim() && <span className="ml-4">{data.hemorroidesObs}</span>}
        </div>
      )}
    </div>
  );
}
