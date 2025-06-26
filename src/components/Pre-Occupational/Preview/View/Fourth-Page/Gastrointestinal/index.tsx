// src/components/GastrointestinalHtml.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Gastrointestinal {
  sinAlteraciones: boolean;
  observaciones: string;
  cicatrices: boolean;
  cicatricesObs: string;
  hernias: boolean;
  herniasObs: string;
  eventraciones: boolean;
  eventracionesObs: string;
  hemorroides: boolean;
  hemorroidesObs: string;
}

interface Props {
  data: Gastrointestinal;
}

export default function GastrointestinalHtml({ data }: Props) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Gastrointestinal
      </h4>

      {/* Sin alteraciones */}
      <div className="flex items-center space-x-2 text-black">
        <Checkbox id="gi-sin" checked={data.sinAlteraciones} disabled />
        <Label htmlFor="gi-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones generales */}
      {data.observaciones && (
        <div>
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{data.observaciones}</p>
        </div>
      )}

      {/* Cicatrices */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Cicatrices:</Label>
        <Checkbox id="gi-cic-si" checked={data.cicatrices} disabled />
        <Label htmlFor="gi-cic-si">Sí</Label>
        <Checkbox id="gi-cic-no" checked={!data.cicatrices} disabled />
        <Label htmlFor="gi-cic-no">No</Label>
        {data.cicatricesObs && <span className="ml-4">{data.cicatricesObs}</span>}
      </div>

      {/* Hernias */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Hernias:</Label>
        <Checkbox id="gi-her-si" checked={data.hernias} disabled />
        <Label htmlFor="gi-her-si">Sí</Label>
        <Checkbox id="gi-her-no" checked={!data.hernias} disabled />
        <Label htmlFor="gi-her-no">No</Label>
        {data.herniasObs && <span className="ml-4">{data.herniasObs}</span>}
      </div>

      {/* Eventraciones */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Eventraciones:</Label>
        <Checkbox id="gi-event-si" checked={data.eventraciones} disabled />
        <Label htmlFor="gi-event-si">Sí</Label>
        <Checkbox id="gi-event-no" checked={!data.eventraciones} disabled />
        <Label htmlFor="gi-event-no">No</Label>
        {data.eventracionesObs && <span className="ml-4">{data.eventracionesObs}</span>}
      </div>

      {/* Hemorroides */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Hemorroides:</Label>
        <Checkbox id="gi-hemo-si" checked={data.hemorroides} disabled />
        <Label htmlFor="gi-hemo-si">Sí</Label>
        <Checkbox id="gi-hemo-no" checked={!data.hemorroides} disabled />
        <Label htmlFor="gi-hemo-no">No</Label>
        {data.hemorroidesObs && <span className="ml-4">{data.hemorroidesObs}</span>}
      </div>
    </div>
  );
}
