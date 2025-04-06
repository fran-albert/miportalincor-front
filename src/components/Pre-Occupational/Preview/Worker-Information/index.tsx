 

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

interface WorkerInformationPreviewProps {
  isForPdf?: boolean;
}

export default function WorkerInformationPreview({ isForPdf = false }: WorkerInformationPreviewProps) {
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
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.lugarNacimiento || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.lugarNacimiento || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Nacionalidad */}
        <div className="space-y-2">
          <Label>Nacionalidad</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.nacionalidad || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.nacionalidad || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Grado de instrucción */}
        <div className="space-y-2">
          <Label>Grado de instrucción</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.gradoInstruccion || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.gradoInstruccion || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Domicilio */}
        <div className="space-y-2">
          <Label>Domicilio</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.domicilio || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.domicilio || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Seguro ARS (Privado) */}
        <div className="space-y-2">
          <Label>Seguro ARS (Privado)</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.seguro || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.seguro || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Nro. de Afiliación */}
        <div className="space-y-2">
          <Label>Nro. de Afiliación</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.nroAfiliacion || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.nroAfiliacion || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Estado civil */}
        <div className="space-y-2">
          <Label>Estado civil</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.estadoCivil || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.estadoCivil || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* N° de hijos */}
        <div className="space-y-2">
          <Label>N° de hijos</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.nroHijos || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.nroHijos || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* N° de dependientes */}
        <div className="space-y-2">
          <Label>N° de dependientes</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{workerInfo.nroDependientes || "No definido"}</p>
          ) : (
            <Input
              value={workerInfo.nroDependientes || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

      </div>
    </div>
  );
}
