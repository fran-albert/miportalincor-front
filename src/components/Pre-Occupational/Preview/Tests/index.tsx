import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

interface TestsPreviewProps {
  isForPdf?: boolean;
}

export default function TestsPreview({ isForPdf = false }: TestsPreviewProps) {
  const tests = useSelector(
    (state: RootState) => state.preOccupational.formData.testsPerformed
  );
  const otrasPruebas = useSelector(
    (state: RootState) => state.preOccupational.formData.otrasPruebas
  );

  const allTests = [
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
    { id: "otros", label: "Otros" },
  ];

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Pruebas realizadas
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {allTests.map((test) => {
          const isChecked = tests
            ? tests[test.id as keyof typeof tests]
            : false;

          return (
            <div key={test.id} className="flex items-center space-x-2">
              <Checkbox checked={isChecked} className="w-4 h-4" />
              <Label>{test.label}</Label>
            </div>
          );
        })}
      </div>

      {otrasPruebas && otrasPruebas.trim() !== "" && (
        <div className="space-y-2 mt-4">
          <Label>Otras pruebas realizadas</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">
              {otrasPruebas || "No se encontraron otras pruebas realizadas."}
            </p>
          ) : (
            <Input
              value={
                otrasPruebas || "No se encontraron otras pruebas realizadas."
              }
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>
      )}
    </div>
  );
}
