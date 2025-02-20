"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function TestsPreview() {
  // Obtenemos la información de las pruebas realizadas y el campo "otras pruebas" desde el estado
  const tests = useSelector(
    (state: RootState) => state.preOccupational.formData.testsPerformed
  );
  const otrasPruebas = useSelector(
    (state: RootState) => state.preOccupational.formData.otrasPruebas
  );

  // Definimos los tests en dos columnas, usando los mismos IDs que en la edición
  const leftTests = [
    { id: "examenFisico", label: "Examen físico" },
    { id: "glucemia", label: "Glucemia en Ayuna" },
    { id: "tuberculosis", label: "Tuberculosis" },
    { id: "espirometria", label: "Espirometría" },
    { id: "capacidadFisica", label: "Capacidad física (Test Harvard)" },
    {
      id: "examenVisual",
      label: "Examen visual (Agudeza, campo, profundidad, cromatismo)",
    },
    { id: "radiografia", label: "Radiografía tórax y lumbar" },
    { id: "otros", label: "Otros" },
  ];

  const rightTests = [
    { id: "audiometria", label: "Audiometría" },
    { id: "hemograma", label: "Hemograma" },
    { id: "historiaClinica", label: "Historia clínica ocupacional" },
    { id: "examenOrina", label: "Examen orina" },
    { id: "electrocardiograma", label: "Electrocardiograma" },
    {
      id: "panelDrogas",
      label: "Panel de drogas, mínimo (COC, THC, MTD, MET)",
    },
    { id: "hepaticas", label: "Pruebas hepáticas (TGO, TGP)" },
    { id: "psicotecnico", label: "Psicotécnico" },
  ];

  // Filtramos únicamente las pruebas que se realizaron (valor true)
  const renderedLeftTests = leftTests.filter(
    (test) => tests && tests[test.id as keyof typeof tests]
  );
  const renderedRightTests = rightTests.filter(
    (test) => tests && tests[test.id as keyof typeof tests]
  );

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Pruebas realizadas
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-3">
          {renderedLeftTests.map((test) => (
            <div key={test.id} className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">✔</div>
              <Label>{test.label}</Label>
            </div>
          ))}
        </div>

        {/* Columna derecha */}
        <div className="space-y-3">
          {renderedRightTests.map((test) => (
            <div key={test.id} className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center justify-center">✔</div>
              <Label>{test.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Campo para Otras pruebas realizadas */}
      {otrasPruebas && otrasPruebas.trim() !== "" && (
        <div className="space-y-2 mt-4">
          <Label>Otras pruebas realizadas</Label>
          <div className="p-2 border rounded bg-gray-50">{otrasPruebas}</div>
        </div>
      )}
    </div>
  );
}
