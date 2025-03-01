"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { Pencil } from "lucide-react";
import WorkerInformationAccordion from "@/components/Accordion/Pre-Occupational/Worker-Information";
import InstitutionInformation from "./Institution-Information";
import OccupationalHistoryAccordion from "@/components/Accordion/Pre-Occupational/Occupational-History";
import MedicalEvaluationAccordion from "@/components/Accordion/Pre-Occupational/Medical-Evaluation";
import { Button } from "@/components/ui/button";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DataType } from "@/types/Data-Type/Data-Type";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";

// === Worker Information ===
const workerMapping: Record<string, string> = {
  lugarNacimiento: "Lugar de nacimiento",
  nacionalidad: "Nacionalidad",
  gradoInstruccion: "Grado de instrucción",
  domicilio: "Domicilio",
  seguro: "Seguro ARS (Privado)",
  nroAfiliacion: "Nro. de Afiliación",
  estadoCivil: "Estado civil",
  nroHijos: "N° de hijos",
  nroDependientes: "N° de dependientes",
};

const buildWorkerPayload = (
  fields: DataType[],
  workerInfo: any
): { dataTypeId: number; value: string }[] => {
  const workerDataValues = Object.entries(workerInfo)
    .map(([key, value]) => {
      const fieldName = workerMapping[key];
      if (!fieldName) return null;
      const field = fields.find((f) => f.name === fieldName);
      if (!field) return null;
      return { dataTypeId: field.id, value: String(value) };
    })
    .filter((item) => item !== null) as { dataTypeId: number; value: string }[];
  return workerDataValues;
};

// === Antecedentes (Occupational History) ===
const buildOccupationalHistoryPayload = (
  occupationalHistory: { id: string; description: string }[],
  fields: DataType[]
): { dataTypeId: number; value: string }[] => {
  const antecedentesField = fields.find(
    (f) =>
      f.category === "ANTECEDENTES" && f.name === "Antecedentes ocupacionales"
  );
  if (!antecedentesField) return [];
  return occupationalHistory
    .map((item) => item.description.trim())
    .filter((desc) => desc !== "")
    .map((desc) => ({ dataTypeId: antecedentesField.id, value: desc }));
};

// === Medical Evaluation ===
const buildMedicalEvaluationPayload = (
  fields: DataType[],
  medicalEvaluation: any
): { dataTypeId: number; value: string }[] => {
  const payloadItems: { dataTypeId: number; value: string }[] = [];

  // Aspecto general
  const aspectoField = fields.find(
    (f) => f.category === "HISTORIA_MEDICA" && f.name === "Aspecto general"
  );
  if (aspectoField && medicalEvaluation.aspectoGeneral) {
    payloadItems.push({
      dataTypeId: aspectoField.id,
      value: medicalEvaluation.aspectoGeneral,
    });
  }

  // Tiempo libre
  const tiempoField = fields.find(
    (f) => f.category === "HISTORIA_MEDICA" && f.name === "Tiempo libre"
  );
  if (tiempoField && medicalEvaluation.tiempoLibre) {
    payloadItems.push({
      dataTypeId: tiempoField.id,
      value: medicalEvaluation.tiempoLibre,
    });
  }

  // Examen Clínico (Talla, Peso, IMC)
  const tallaField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Talla"
  );
  if (tallaField && medicalEvaluation.examenClinico.talla) {
    payloadItems.push({
      dataTypeId: tallaField.id,
      value: String(medicalEvaluation.examenClinico.talla),
    });
  }
  const pesoField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Peso"
  );
  if (pesoField && medicalEvaluation.examenClinico.peso) {
    payloadItems.push({
      dataTypeId: pesoField.id,
      value: String(medicalEvaluation.examenClinico.peso),
    });
  }
  const imcField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "IMC"
  );
  if (imcField && medicalEvaluation.examenClinico.imc) {
    payloadItems.push({
      dataTypeId: imcField.id,
      value: String(medicalEvaluation.examenClinico.imc),
    });
  }

  // Examen Físico
  const examenFisicoItems = [
    { id: "piel", label: "Piel y faneras" },
    { id: "ojos", label: "Ojos" },
    { id: "oidos", label: "Oídos" },
    { id: "nariz", label: "Nariz" },
    { id: "boca", label: "Boca" },
    { id: "faringe", label: "Faringe" },
    { id: "cuello", label: "Cuello" },
    { id: "respiratorio", label: "Aparato Respiratorio" },
    { id: "cardiovascular", label: "Aparato Cardiovascular" },
    { id: "digestivo", label: "Aparato Digestivo" },
    { id: "genitourinario", label: "Aparato Genitourinario" },
    { id: "locomotor", label: "Aparato Locomotor" },
    { id: "columna", label: "Columna" },
    { id: "miembros-sup", label: "Miembros Superiores" },
    { id: "miembros-inf", label: "Miembros Inferiores" },
    { id: "varices", label: "Várices" },
    { id: "sistema-nervioso", label: "Sistema Nervioso" },
    { id: "hernias", label: "Hernias" },
  ];
  examenFisicoItems.forEach((item) => {
    const data = medicalEvaluation.examenFisico[item.id];
    if (data && (data.selected || data.observaciones)) {
      const field = fields.find(
        (f) => f.category === "EXAMEN_FISICO" && f.name === item.label
      );
      if (field) {
        // Convertimos el objeto en un string JSON (puedes elegir otro formato si lo prefieres)
        const value = JSON.stringify({
          selected: data.selected,
          observaciones: data.observaciones,
        });
        payloadItems.push({
          dataTypeId: field.id,
          value,
        });
      }
    }
  });

  return payloadItems;
};

export default function MedicalHistoryTab({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}) {
  const { data: fields } = useDataTypes({
    auth: true,
    fetch: true,
    categories: [
      "HISTORIA_MEDICA",
      "ANTECEDENTES",
      "EXAMEN_CLINICO",
      "EXAMEN_FISICO",
    ],
  });
  const { createDataValuesMutation } = useDataValuesMutations();

  const formData = useSelector(
    (state: RootState) => state.preOccupational.formData
  );
  const workerInfo = formData.workerInformation;
  const occupationalHistory = formData.occupationalHistory;
  const medicalEvaluation = formData.medicalEvaluation;

  const workerDataValues = buildWorkerPayload(fields, workerInfo);
  const antecedentesDataValues = buildOccupationalHistoryPayload(
    occupationalHistory,
    fields
  );
  const medicalEvaluationDataValues = buildMedicalEvaluationPayload(
    fields,
    medicalEvaluation
  );

  const combinedDataValues = [
    ...workerDataValues,
    ...antecedentesDataValues,
    ...medicalEvaluationDataValues,
  ];

  const handleSave = () => {
    const payload = {
      medicalEvaluationId: 2, // Reemplaza con el ID real
      dataValues: combinedDataValues,
    };
    console.log(payload);
    createDataValuesMutation.mutate(payload);
  };

  return (
    <TabsContent value="medical-history" className="mt-4 space-y-4">
      {!isEditing && (
        <p
          className="font-medium text-greenPrimary cursor-pointer hover:underline flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-4 h-4" /> Habilitar Edición
        </p>
      )}
      <Accordion type="multiple" className="w-full space-y-4">
        <InstitutionInformation isEditing={isEditing} fields={fields} />
        <WorkerInformationAccordion isEditing={isEditing} />
        <OccupationalHistoryAccordion isEditing={isEditing} fields={fields} />
        <MedicalEvaluationAccordion isEditing={isEditing} />
      </Accordion>
      {isEditing && (
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="destructive"
            onClick={() => {
              /* lógica de cancelar */
            }}
          >
            Cancelar
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleSave}
          >
            Guardar
          </Button>
        </div>
      )}
    </TabsContent>
  );
}
