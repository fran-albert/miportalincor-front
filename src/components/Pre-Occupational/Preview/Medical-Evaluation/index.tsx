"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MedicalEvaluationPreview() {
  const medicalEvaluation = useSelector(
    (state: RootState) => state.preOccupational.formData.medicalEvaluation
  );

  const examenFisicoItems = [
    { id: "piel", label: "Piel y faneras", defaultValue: "TATTO" },
    { id: "ojos", label: "Ojos", defaultValue: "S/P" },
    { id: "oidos", label: "Oídos", defaultValue: "" },
    { id: "nariz", label: "Nariz", defaultValue: "" },
    { id: "boca", label: "Boca", defaultValue: "" },
    { id: "faringe", label: "Faringe", defaultValue: "" },
    { id: "cuello", label: "Cuello", defaultValue: "" },
    {
      id: "respiratorio",
      label: "Aparato Respiratorio",
      defaultValue: "BEBA TBQ 5 CIGARRILLOS DIA SAT 98%",
    },
    {
      id: "cardiovascular",
      label: "Aparato Cardiovascular",
      defaultValue: "RITMO REGULAR SILENCIOS LIBRES",
    },
    { id: "digestivo", label: "Aparato Digestivo", defaultValue: "" },
    { id: "genitourinario", label: "Aparato Genitourinario", defaultValue: "" },
    { id: "locomotor", label: "Aparato Locomotor", defaultValue: "" },
    { id: "columna", label: "Columna", defaultValue: "" },
    { id: "miembros-sup", label: "Miembros Superiores", defaultValue: "" },
    { id: "miembros-inf", label: "Miembros Inferiores", defaultValue: "" },
    { id: "varices", label: "Várices", defaultValue: "" },
    { id: "sistema-nervioso", label: "Sistema Nervioso", defaultValue: "" },
    { id: "hernias", label: "Hernias", defaultValue: "" },
  ];

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Evaluación Médica
      </h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Aspecto general</Label>
          <Input
            id="puesto"
            value={medicalEvaluation.aspectoGeneral || "NORMOTIPO"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
        <div className="space-y-2">
          <Label>Tiempo libre</Label>
          <Input
            id="puesto"
            value={medicalEvaluation.tiempoLibre || ""}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-base text-greenPrimary">
            Examen Clínico
          </h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Talla</Label>
              <Input
                id="puesto"
                value={medicalEvaluation.examenClinico.talla || "174"}
                readOnly
                className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label>Peso</Label>
              <Input
                id="puesto"
                value={medicalEvaluation.examenClinico.peso || "62"}
                readOnly
                className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label>IMC</Label>
              <Input
                id="puesto"
                value={medicalEvaluation.examenClinico.imc || "20.48"}
                readOnly
                className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-base text-greenPrimary">
            Examen físico (indique si se realizaron pruebas)
          </h4>
          {examenFisicoItems.map((item) => {
            const current = medicalEvaluation.examenFisico[item.id] || {
              selected: "",
              observaciones: item.defaultValue || "",
            };
            return (
              <div key={item.id} className="flex items-center gap-4">
                <Label className="min-w-[150px]">{item.label}</Label>
                <div className="flex items-center gap-2">
                  <Label>Sí:</Label>
                  <span>{current.selected === "si" ? "✔" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label>No:</Label>
                  <span>{current.selected === "no" ? "✔" : ""}</span>
                </div>
                <Input
                  id="puesto"
                  value={current.observaciones}
                  readOnly
                  className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0  max-w-[200px"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
