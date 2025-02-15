"use client";

import { Label } from "@/components/ui/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  isEditing: boolean;
}

export default function TestsAccordion({ isEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  // Obtenemos la información de las pruebas realizadas y el campo "otras pruebas" desde el estado
  const testsPerformed = useSelector(
    (state: RootState) => state.preOccupational.formData.testsPerformed
  );
  const otrasPruebas = useSelector(
    (state: RootState) => state.preOccupational.formData.otrasPruebas
  );

  // Función para alternar el valor de una prueba
  const handleToggleTest = (testId: string) => {
    dispatch(
      setFormData({
        testsPerformed: {
          ...testsPerformed,
          // Usamos aserción de tipo para indicarle a TS que testId es una clave válida
          [testId]: !testsPerformed[testId as keyof typeof testsPerformed],
        },
      })
    );
  };

  // Función para actualizar el campo "otras pruebas"
  const handleOtrasPruebasChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    dispatch(setFormData({ otrasPruebas: e.target.value }));
  };

  return (
    <AccordionItem value="pruebas-realizadas" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Pruebas realizadas
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-3">
              {[
                { id: "examenFisico", label: "Examen físico" },
                { id: "glucemia", label: "Glucemia en Ayuna" },
                { id: "tuberculosis", label: "Tuberculosis" },
                { id: "espirometria", label: "Espirometría" },
                {
                  id: "capacidadFisica",
                  label: "Capacidad física (Test Harvard)",
                },
                {
                  id: "examenVisual",
                  label:
                    "Examen visual (Agudeza, campo, profundidad, cromatismo)",
                },
                { id: "radiografia", label: "Radiografía tórax y lumbar" },
                { id: "otros", label: "Otros" },
              ].map((test) => (
                <div key={test.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={test.id}
                    disabled={!isEditing}
                    checked={Boolean(
                      testsPerformed &&
                        testsPerformed[test.id as keyof typeof testsPerformed]
                    )}
                    onCheckedChange={() =>
                      isEditing && handleToggleTest(test.id)
                    }
                    className="disabled:opacity-50"
                  />
                  <Label htmlFor={test.id}>{test.label}</Label>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-3">
              {[
                { id: "audiometria", label: "Audiometría" },
                { id: "hemograma", label: "Hemograma" },
                {
                  id: "historiaClinica",
                  label: "Historia clínica ocupacional",
                },
                { id: "examenOrina", label: "Examen orina" },
                { id: "electrocardiograma", label: "Electrocardiograma" },
                {
                  id: "panelDrogas",
                  label:
                    "Panel de drogas, mínimo (COC, THC, MTD, MET)",
                },
                { id: "hepaticas", label: "Pruebas hepáticas (TGO, TGP)" },
                { id: "psicotecnico", label: "Psicotécnico" },
              ].map((test) => (
                <div key={test.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={test.id}
                    disabled={!isEditing}
                    checked={Boolean(
                      testsPerformed &&
                        testsPerformed[test.id as keyof typeof testsPerformed]
                    )}
                    onCheckedChange={() =>
                      isEditing && handleToggleTest(test.id)
                    }
                    className="disabled:opacity-50"
                  />
                  <Label htmlFor={test.id}>{test.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Otras pruebas realizadas */}
          <div className="space-y-2">
            <Label htmlFor="otras-pruebas">Otras pruebas realizadas</Label>
            <Textarea
              id="otras-pruebas"
              placeholder="Ingrese otras pruebas realizadas..."
              disabled={!isEditing}
              value={otrasPruebas}
              onChange={handleOtrasPruebasChange}
              className="min-h-[100px] disabled:opacity-50"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
