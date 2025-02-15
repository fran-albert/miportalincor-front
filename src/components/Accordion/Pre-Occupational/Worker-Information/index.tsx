"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  isEditing: boolean;
}

export default function WorkerInformationAccordion({ isEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const workerInfo = useSelector(
    (state: RootState) => state.preOccupational.formData.workerInformation
  );

  const handleChange = (field: string, value: string) => {
    dispatch(
      setFormData({
        workerInformation: {
          ...workerInfo,
          [field]: value,
        },
      })
    );
  };

  return (
    <AccordionItem value="worker-information" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Filiación del trabajador
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Lugar de nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="lugar-nacimiento">Lugar de nacimiento</Label>
              {isEditing ? (
                <Input
                  id="lugar-nacimiento"
                  value={workerInfo.lugarNacimiento || ""}
                  onChange={(e) =>
                    handleChange("lugarNacimiento", e.target.value)
                  }
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.lugarNacimiento || "No definido"}
                </div>
              )}
            </div>
            {/* Nacionalidad */}
            <div className="space-y-2">
              <Label htmlFor="nacionalidad">Nacionalidad</Label>
              {isEditing ? (
                <Input
                  id="nacionalidad"
                  value={workerInfo.nacionalidad || ""}
                  onChange={(e) =>
                    handleChange("nacionalidad", e.target.value)
                  }
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.nacionalidad || "No definido"}
                </div>
              )}
            </div>
            {/* Grado de instrucción */}
            <div className="space-y-2">
              <Label htmlFor="grado-instruccion">Grado de instrucción</Label>
              {isEditing ? (
                <Input
                  id="grado-instruccion"
                  value={workerInfo.gradoInstruccion || ""}
                  onChange={(e) =>
                    handleChange("gradoInstruccion", e.target.value)
                  }
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.gradoInstruccion || "No definido"}
                </div>
              )}
            </div>
            {/* Domicilio */}
            <div className="space-y-2">
              <Label htmlFor="domicilio">Domicilio</Label>
              {isEditing ? (
                <Input
                  id="domicilio"
                  value={workerInfo.domicilio || ""}
                  onChange={(e) => handleChange("domicilio", e.target.value)}
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.domicilio || "No definido"}
                </div>
              )}
            </div>
            {/* Seguro ARS */}
            <div className="space-y-2">
              <Label htmlFor="seguro">Seguro ARS (Privado)</Label>
              {isEditing ? (
                <Input
                  id="seguro"
                  value={workerInfo.seguro || ""}
                  onChange={(e) => handleChange("seguro", e.target.value)}
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.seguro || "No definido"}
                </div>
              )}
            </div>
            {/* Nro. de Afiliación */}
            <div className="space-y-2">
              <Label htmlFor="nro-afiliacion">Nro. de Afiliación</Label>
              {isEditing ? (
                <Input
                  id="nro-afiliacion"
                  value={workerInfo.nroAfiliacion || ""}
                  onChange={(e) =>
                    handleChange("nroAfiliacion", e.target.value)
                  }
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.nroAfiliacion || "No definido"}
                </div>
              )}
            </div>
            {/* Estado civil */}
            <div className="space-y-2">
              <Label htmlFor="estado-civil">Estado civil</Label>
              {isEditing ? (
                <Input
                  id="estado-civil"
                  value={workerInfo.estadoCivil || ""}
                  onChange={(e) =>
                    handleChange("estadoCivil", e.target.value)
                  }
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.estadoCivil || "No definido"}
                </div>
              )}
            </div>
            {/* N° de hijos */}
            <div className="space-y-2">
              <Label htmlFor="nro-hijos">N° de hijos</Label>
              {isEditing ? (
                <Input
                  id="nro-hijos"
                  type="number"
                  value={workerInfo.nroHijos?.toString() || "0"}
                  onChange={(e) =>
                    handleChange("nroHijos", e.target.value)
                  }
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.nroHijos || "0"}
                </div>
              )}
            </div>
            {/* N° de dependientes */}
            <div className="space-y-2">
              <Label htmlFor="nro-dependientes">N° de dependientes</Label>
              {isEditing ? (
                <Input
                  id="nro-dependientes"
                  type="number"
                  value={workerInfo.nroDependientes?.toString() || ""}
                  onChange={(e) =>
                    handleChange("nroDependientes", e.target.value)
                  }
                />
              ) : (
                <div className="p-2 border rounded bg-gray-50">
                  {workerInfo.nroDependientes || "No definido"}
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
