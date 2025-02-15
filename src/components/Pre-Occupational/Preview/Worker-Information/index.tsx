"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function WorkerInformationPreview() {
  const workerInfo = useSelector(
    (state: RootState) => state.preOccupational.formData.workerInformation
  );

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Filiación del trabajador
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Lugar de nacimiento */}
        <div className="space-y-2">
          <Label>Lugar de nacimiento</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.lugarNacimiento || "No definido"}
          </div>
        </div>
        {/* Nacionalidad */}
        <div className="space-y-2">
          <Label>Nacionalidad</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.nacionalidad || "No definido"}
          </div>
        </div>
        {/* Grado de instrucción */}
        <div className="space-y-2">
          <Label>Grado de instrucción</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.gradoInstruccion || "No definido"}
          </div>
        </div>
        {/* Domicilio */}
        <div className="space-y-2">
          <Label>Domicilio</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.domicilio || "No definido"}
          </div>
        </div>
        {/* Seguro ARS */}
        <div className="space-y-2">
          <Label>Seguro ARS (Privado)</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.seguro || "No definido"}
          </div>
        </div>
        {/* Nro. de Afiliación */}
        <div className="space-y-2">
          <Label>Nro. de Afiliación</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.nroAfiliacion || "No definido"}
          </div>
        </div>
        {/* Estado civil */}
        <div className="space-y-2">
          <Label>Estado civil</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.estadoCivil || "No definido"}
          </div>
        </div>
        {/* N° de hijos */}
        <div className="space-y-2">
          <Label>N° de hijos</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.nroHijos || "0"}
          </div>
        </div>
        {/* N° de dependientes */}
        <div className="space-y-2">
          <Label>N° de dependientes</Label>
          <div className="p-2 border rounded bg-gray-50">
            {workerInfo.nroDependientes || "No definido"}
          </div>
        </div>
      </div>
    </div>
  );
}
