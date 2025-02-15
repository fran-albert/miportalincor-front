"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

export default function GeneralInfoPreview() {
  const formData = useSelector(
    (state: RootState) => state.preOccupational.formData
  );

  const evaluationTypeLabels: { [key: string]: string } = {
    preocupacional: "Preocupacional",
    periodico: "Periódico",
    salida: "Salida (Retiro)",
    cambio: "Cambio de puesto",
    libreta: "Libreta sanitaria",
    otro: "Otro",
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Datos Generales
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="evaluationType">Tipo de Evaluación</Label>
          <Input
            id="puesto"
            value={
              evaluationTypeLabels[formData.evaluationType] || "No definido"
            }
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
        {/* Campo: Puesto */}
        <div className="space-y-2">
          <Label htmlFor="puesto">Puesto</Label>
          <Input
            id="puesto"
            value={formData.puesto || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        {/* Campo: Área de trabajo */}
        <div className="space-y-2">
          <Label htmlFor="area">Área de trabajo</Label>
          <Input
            id="area"
            value={formData.area || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        {/* Campo: Antigüedad en el puesto */}
        <div className="space-y-2">
          <Label htmlFor="antiguedad">Antigüedad en el puesto</Label>
          <Input
            id="antiguedad"
            value={formData.antiguedad || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        {/* Campo: Tiempo en la empresa */}
        <div className="space-y-2">
          <Label htmlFor="tiempo">Tiempo en la empresa</Label>
          <Input
            id="tiempo"
            value={formData.tiempo || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
      </div>
    </div>
  );
}
