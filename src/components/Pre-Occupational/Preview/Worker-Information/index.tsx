"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

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
        <div className="space-y-2">
          <Label>Lugar de nacimiento</Label>
          <Input
            id="puesto"
            value={workerInfo.lugarNacimiento || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Nacionalidad</Label>
          <Input
            id="puesto"
            value={workerInfo.nacionalidad || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Grado de instrucción</Label>
          <Input
            id="puesto"
            value={workerInfo.gradoInstruccion || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Domicilio</Label>
          <Input
            id="puesto"
            value={workerInfo.domicilio || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Seguro ARS (Privado)</Label>
          <Input
            id="puesto"
            value={workerInfo.seguro || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Nro. de Afiliación</Label>
          <Input
            id="puesto"
            value={workerInfo.nroAfiliacion || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Estado civil</Label>
          <Input
            id="puesto"
            value={workerInfo.estadoCivil || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>N° de hijos</Label>
          <Input
            id="puesto"
            value={workerInfo.nroHijos || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
        
        <div className="space-y-2">
          <Label>N° de dependientes</Label>
          <Input
            id="puesto"
            value={workerInfo.nroDependientes || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
      </div>
    </div>
  );
}
