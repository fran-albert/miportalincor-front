 

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataType } from "@/types/Data-Type/Data-Type";
import { DataValue } from "@/types/Data-Value/Data-Value"; // Asegúrate de importar este tipo
import { selectFlatFormData } from "@/store/Pre-Occupational/selectors";
import { useEffect } from "react";

interface Props {
  isEditing: boolean;
  fields: DataType[];
  dataValues?: DataValue[]; // Añadimos dataValues como prop opcional
}

const testKeyMapping: Record<string, string> = {
  "Examen físico": "examenFisico",
  "Glucemia en Ayuna": "glucemia",
  "Tuberculosis": "tuberculosis",
  "Espirometría": "espirometria",
  "Capacidad física (Test Harvard)": "capacidadFisica",
  "Examen visual (Agudeza, campo, profundidad, cromatismo)": "examenVisual",
  "Radiografía tórax y lumbar": "radiografia",
  "Audiometría": "audiometria",
  "Hemograma": "hemograma",
  "Historia clínica ocupacional": "historiaClinica",
  "Examen orina": "examenOrina",
  "Electrocardiograma": "electrocardiograma",
  "Panel de drogas (COC, THC, etc.)": "panelDrogas",
  "Pruebas hepáticas (TGO, TGP)": "hepaticas",
  "Psicotecnico": "psicotecnico",
  "Otros": "otros",
  "Otras pruebas realizadas": "otrasPruebas",
};

export default function TestsAccordion({
  isEditing,
  fields,
  dataValues,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const testFields = fields.filter(
    (field) =>
      field.dataType === "BOOLEAN" &&
      [
        "Examen físico",
        "Glucemia en Ayuna",
        "Tuberculosis",
        "Espirometría",
        "Capacidad física (Test Harvard)",
        "Examen visual (Agudeza, campo, profundidad, cromatismo)",
        "Radiografía tórax y lumbar",
        "Audiometría",
        "Hemograma",
        "Historia clínica ocupacional",
        "Examen orina",
        "Electrocardiograma",
        "Panel de drogas (COC, THC, etc.)",
        "Pruebas hepáticas (TGO, TGP)",
        "Psicotecnico",
        "Otros",
      ].includes(field.name)
  );

  const midIndex = Math.ceil(testFields.length / 2);
  const leftTests = testFields.slice(0, midIndex);
  const rightTests = testFields.slice(midIndex);

  const flatFormData = useSelector((state: RootState) =>
    selectFlatFormData(state)
  );
  const otrasPruebas = flatFormData.otrasPruebas;

  const getTestKey = (testName: string) => {
    const internalKey = testKeyMapping[testName];
    return internalKey ? `tests_${internalKey}` : testName;
  };

  useEffect(() => {
    if (dataValues) {
      const initialTests = dataValues
        .filter((dv) => testFields.some((tf) => tf.name === dv.dataType.name))
        .reduce((acc, dv) => {
          const key = getTestKey(dv.dataType.name).replace("tests_", "");
          acc[key] = dv.value;
          return acc;
        }, {} as Record<string, any>);
  
      const testsPerformed = {
        ...(typeof flatFormData.testsPerformed === 'object' && flatFormData.testsPerformed !== null ? flatFormData.testsPerformed : {}),
        ...initialTests,
      };

      const newFormData: any = {
        testsPerformed,
        ...(dataValues.find((dv) => dv.dataType.name === "Otras pruebas realizadas")
          ? {
              otrasPruebas: dataValues.find(
                (dv) => dv.dataType.name === "Otras pruebas realizadas"
              )!.value as string,
            }
          : {}),
      };

      if (JSON.stringify(flatFormData.testsPerformed) !== JSON.stringify(testsPerformed)) {
        dispatch(setFormData(newFormData));
      }
    }
  }, [dataValues, dispatch, testFields]);
  

  const getFieldValue = (testName: string) => {
    const dataValue = dataValues?.find((dv) => dv.dataType.name === testName);
    const key = getTestKey(testName);
    return dataValue ? dataValue.value : flatFormData[key];
  };

  const handleToggleTest = (testName: string) => {
    const key = getTestKey(testName);
    const testsPerformed = {
      ...(typeof flatFormData.testsPerformed === 'object' && flatFormData.testsPerformed !== null ? flatFormData.testsPerformed : {}),
      [key.replace("tests_", "")]: !getFieldValue(testName), // Usamos getFieldValue para el toggle
    };
    dispatch(
      setFormData({
        testsPerformed,
      } as any)
    );
  };

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
            {/* Columna izquierda */}
            <div className="space-y-3">
              {leftTests.map((test) => {
                const fieldValue = getFieldValue(test.name);
                return (
                  <div key={test.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={test.name}
                      disabled={!isEditing}
                      checked={Boolean(fieldValue)} // Usamos el valor de dataValues o flatFormData
                      onCheckedChange={() =>
                        isEditing && handleToggleTest(test.name)
                      }
                      className="disabled:opacity-50"
                    />
                    <Label htmlFor={test.name}>{test.name}</Label>
                  </div>
                );
              })}
            </div>

            {/* Columna derecha */}
            <div className="space-y-3">
              {rightTests.map((test) => {
                const fieldValue = getFieldValue(test.name);
                return (
                  <div key={test.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={test.name}
                      disabled={!isEditing}
                      checked={Boolean(fieldValue)} // Usamos el valor de dataValues o flatFormData
                      onCheckedChange={() =>
                        isEditing && handleToggleTest(test.name)
                      }
                      className="disabled:opacity-50"
                    />
                    <Label htmlFor={test.name}>{test.name}</Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campo de "Otras pruebas realizadas" */}
          <div className="space-y-2">
            <Label htmlFor="otras-pruebas">Otras pruebas realizadas</Label>
            <Textarea
              id="otras-pruebas"
              placeholder="Ingrese otras pruebas realizadas..."
              disabled={!isEditing}
              value={
                String(getFieldValue("Otras pruebas realizadas") || otrasPruebas || "")
              } // Usamos getFieldValue para este campo también
              onChange={handleOtrasPruebasChange}
              className="min-h-[100px] disabled:opacity-50"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
