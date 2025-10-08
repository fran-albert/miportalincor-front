import { TabsContent } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { Pencil } from "lucide-react";
// import WorkerInformationAccordion from "@/components/Accordion/Pre-Occupational/Worker-Information";
import OccupationalHistoryAccordion from "@/components/Accordion/Pre-Occupational/Occupational-History";
import MedicalEvaluationAccordion from "@/components/Accordion/Pre-Occupational/Medical-Evaluation";
import { Button } from "@/components/ui/button";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DataType } from "@/types/Data-Type/Data-Type";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { useInitializeMedicalEvaluation } from "@/common/helpers/maps";
// const workerMapping: Record<string, string> = {
//   lugarNacimiento: "Lugar de nacimiento",
//   nacionalidad: "Nacionalidad",
//   gradoInstruccion: "Grado de instrucción",
//   domicilio: "Domicilio",
//   seguro: "Seguro ARS (Privado)",
//   nroAfiliacion: "Nro. de Afiliación",
//   estadoCivil: "Estado civil",
//   nroHijos: "N° de hijos",
//   nroDependientes: "N° de dependientes",
// };

// const buildWorkerPayload = (
//   fields: DataType[],
//   workerInfo: any
// ): { dataTypeId: number; value: string }[] => {
//   const workerDataValues = Object.entries(workerInfo)
//     .map(([key, value]) => {
//       const fieldName = workerMapping[key];
//       if (!fieldName) return null;
//       const field = fields.find((f) => f.name === fieldName);
//       if (!field) return null;
//       return { dataTypeId: field.id, value: String(value) };
//     })
//     .filter((item) => item !== null) as { dataTypeId: number; value: string }[];
//   return workerDataValues;
// };

const buildOccupationalHistoryPayload = (
  occupationalHistory: { id: string; description: string }[],
  fields: DataType[]
): { dataTypeId: number; value: string; id?: number }[] => {
  const antecedentesField = fields.find(
    (f) =>
      f.category === "ANTECEDENTES" && f.name === "Antecedentes ocupacionales"
  );
  if (!antecedentesField) return [];

  return occupationalHistory
    .filter((item) => item.description.trim() !== "")
    .map((item) => {
      // Si el id es real (no es temporal), lo incluimos; si es temporal, se omite.
      if (!item.id.startsWith("temp-")) {
        return {
          id: parseInt(item.id),
          dataTypeId: antecedentesField.id,
          value: item.description.trim(),
        };
      }
      return {
        dataTypeId: antecedentesField.id,
        value: item.description.trim(),
      };
    });
};

const buildMedicalEvaluationPayload = (
  fields: DataType[],
  medicalEvaluation: any
): { dataTypeId: number; value: string; observations?: string }[] => {
  const payloadItems: {
    dataTypeId: number;
    value: string;
    observations?: string;
  }[] = [];

  const aspectoField = fields.find(
    (f) => f.category === "HISTORIA_MEDICA" && f.name === "Aspecto general"
  );
  if (aspectoField && medicalEvaluation.aspectoGeneral) {
    payloadItems.push({
      dataTypeId: aspectoField.id,
      value: medicalEvaluation.aspectoGeneral,
    });
  }

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
  const perimetroAbdominalField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Perimetro Abdominal"
  );
  if (
    perimetroAbdominalField &&
    medicalEvaluation.examenClinico.perimetroAbdominal
  ) {
    payloadItems.push({
      dataTypeId: perimetroAbdominalField.id,
      value: String(medicalEvaluation.examenClinico.perimetroAbdominal),
    });
  }

  const frecuenciaCardiacaField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Frecuencia Cardíaca"
  );
  if (
    frecuenciaCardiacaField &&
    medicalEvaluation.examenClinico.frecuenciaCardiaca
  ) {
    payloadItems.push({
      dataTypeId: frecuenciaCardiacaField.id,
      value: String(medicalEvaluation.examenClinico.frecuenciaCardiaca),
    });
  }

  const frecuenciaRespiratoriaField = fields.find(
    (f) =>
      f.category === "EXAMEN_CLINICO" && f.name === "Frecuencia Respiratoria"
  );
  if (
    frecuenciaRespiratoriaField &&
    medicalEvaluation.examenClinico.frecuenciaRespiratoria
  ) {
    payloadItems.push({
      dataTypeId: frecuenciaRespiratoriaField.id,
      value: String(medicalEvaluation.examenClinico.frecuenciaRespiratoria),
    });
  }

  const presionSistolicaField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Presión Sistólica"
  );
  if (
    presionSistolicaField &&
    medicalEvaluation.examenClinico.presionSistolica
  ) {
    payloadItems.push({
      dataTypeId: presionSistolicaField.id,
      value: String(medicalEvaluation.examenClinico.presionSistolica),
    });
  }
  const presionDiastolicaField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Presión Diastólica"
  );
  if (
    presionDiastolicaField &&
    medicalEvaluation.examenClinico.presionDiastolica
  ) {
    payloadItems.push({
      dataTypeId: presionDiastolicaField.id,
      value: String(medicalEvaluation.examenClinico.presionDiastolica),
    });
  }
  // dentro de buildMedicalEvaluationPayload, tras los bloques EXAMEN_CLINICO:
  const normoField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Normocoloreada"
  );
  if (normoField && medicalEvaluation.piel) {
    payloadItems.push({
      dataTypeId: normoField.id,
      value: medicalEvaluation.piel.normocoloreada === "si" ? "true" : "false",
      observations: medicalEvaluation.piel.observaciones?.trim() || null,
    });
  }

  // Tatuajes
  const tatField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Tatuajes"
  );
  if (tatField && medicalEvaluation.piel) {
    payloadItems.push({
      dataTypeId: tatField.id,
      value: medicalEvaluation.piel.tatuajes === "si" ? "true" : "false",
    });
  }

  const cabezaBool = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Cabeza y Cuello"
  );
  if (cabezaBool && medicalEvaluation.cabezaCuello) {
    payloadItems.push({
      dataTypeId: cabezaBool.id,
      value: medicalEvaluation.cabezaCuello.sinAlteraciones ? "true" : "false",
    });
  }

  // 2) Observaciones Cabeza y Cuello
  const cabezaObs = fields.find(
    (f) =>
      f.category === "EXAMEN_FISICO" &&
      f.name === "Observaciones Cabeza y Cuello"
  );
  const trimmedCabezaObs =
    medicalEvaluation.cabezaCuello?.observaciones?.trim();
  if (cabezaObs && trimmedCabezaObs) {
    payloadItems.push({
      dataTypeId: cabezaObs.id,
      value: trimmedCabezaObs,
    });
  }
  const bucoFields = [
    { key: "sinAlteraciones", name: "Bucodental – Sin alteraciones" },
    { key: "caries", name: "Bucodental – Caries" },
    { key: "faltanPiezas", name: "Bucodental – Faltan piezas" },
  ];
  bucoFields.forEach(({ key, name }) => {
    const dt = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === name
    );
    if (dt && medicalEvaluation.bucodental) {
      payloadItems.push({
        dataTypeId: dt.id,
        value: (medicalEvaluation.bucodental as any)[key] ? "true" : "false",
      });
    }
  });
  const bucoObs = fields.find(
    (f) =>
      f.category === "EXAMEN_FISICO" && f.name === "Bucodental – Observaciones"
  );
  if (bucoObs && medicalEvaluation.bucodental?.observaciones?.trim()) {
    payloadItems.push({
      dataTypeId: bucoObs.id,
      value: medicalEvaluation.bucodental.observaciones.trim(),
    });
  }

  // === Torax ===
  const toraxFields = [
    { key: "deformaciones", name: "Torax Deformaciones" },
    { key: "cicatrices", name: "Torax Cicatrices" },
  ];
  toraxFields.forEach(({ key, name }) => {
    const dt = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === name
    );
    if (dt && medicalEvaluation.torax) {
      payloadItems.push({
        dataTypeId: dt.id,
        value:
          (medicalEvaluation.torax as any)[key] === "si" ? "true" : "false",
        observations:
          (medicalEvaluation.torax as any)[`${key}Obs`]?.trim() || null,
      });
    }
  });

  // === Respiratorio ===
  if (medicalEvaluation.respiratorio) {
    // Booleano Aparato Respiratorio
    const respBool = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Respiratorio"
    );
    if (respBool) {
      payloadItems.push({
        dataTypeId: respBool.id,
        value: medicalEvaluation.respiratorio.sinAlteraciones
          ? "true"
          : "false",
        observations:
          medicalEvaluation.respiratorio.observaciones?.trim() || null,
      });
    }

    // Campos de clínica (números)
    ["frecuenciaRespiratoria", "oximetria"].forEach((key) => {
      const dt = fields.find(
        (f) =>
          f.category === "EXAMEN_CLINICO" &&
          (key === "frecuenciaRespiratoria"
            ? f.name === "Frecuencia Respiratoria"
            : f.name === "Oximetria")
      );
      const val =
        medicalEvaluation.respiratorio![
          key as keyof typeof medicalEvaluation.respiratorio
        ];
      if (dt && val !== undefined && val !== null && val !== "") {
        payloadItems.push({
          dataTypeId: dt.id,
          value: String(val),
        });
      }
    });
  }

  // === Circulatorio ===
  const circ = medicalEvaluation.circulatorio;
  if (circ) {
    // 1) Booleano Aparato Circulatorio
    const circBool = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Circulatorio"
    );
    if (circBool) {
      payloadItems.push({
        dataTypeId: circBool.id,
        value: circ.sinAlteraciones ? "true" : "false",
        observations: circ.observaciones?.trim() || null,
      });
    }

    // 2) Signos vitales circulatorios (números)
    const circClin = [
      { key: "frecuenciaCardiaca", name: "Frecuencia Cardíaca" },
      { key: "presion", name: "TA" },
    ] as const;

    circClin.forEach(({ key, name }) => {
      const dt = fields.find(
        (f) => f.category === "EXAMEN_CLINICO" && f.name === name
      );
      const val = (circ as any)[key];
      if (dt && val != null && val !== "") {
        payloadItems.push({
          dataTypeId: dt.id,
          value: String(val),
        });
      }
    });

    // 3) Várices (boolean + obs)
    const varicesField = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === "Várices"
    );
    if (varicesField && typeof circ.varices === "boolean") {
      payloadItems.push({
        dataTypeId: varicesField.id,
        value: circ.varices ? "true" : "false",
        observations: circ.varicesObs?.trim() || null,
      });
    }
  }

  // === Gastrointestinal ===
  const giBool = fields.find(
    (f) =>
      f.category === "EXAMEN_FISICO" && f.name === "Aparato Gastrointestinal"
  );
  if (giBool && medicalEvaluation.gastrointestinal) {
    payloadItems.push({
      dataTypeId: giBool.id,
      value: medicalEvaluation.gastrointestinal.sinAlteraciones
        ? "true"
        : "false",
      observations:
        medicalEvaluation.gastrointestinal.observaciones?.trim() || null,
    });
  }
  if (medicalEvaluation.gastrointestinal) {
    // === Cirugías, hernias, eventraciones, hemorroides ===
    const giDetails = [
      "cicatrices",
      "hernias",
      "eventraciones",
      "hemorroides",
    ] as const;
    giDetails.forEach((key) => {
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1); // "Cicatrices", "Hernias", ...
      const dt = fields.find(
        (f) => f.category === "EXAMEN_FISICO" && f.name === fieldName
      );
      if (!dt) return;

      const val = (medicalEvaluation.gastrointestinal as any)[key] as
        | boolean
        | undefined;
      // marcó SI o NO (true o false)
      if (val !== undefined) {
        payloadItems.push({
          dataTypeId: dt.id,
          value: val ? "true" : "false",
          // si hay observaciones, las agregamos; si no, null
          observations:
            (medicalEvaluation.gastrointestinal as any)[`${key}Obs`]?.trim() ||
            null,
        });
      }
    });
  }

  // === Neurológico ===
  const neuroBool = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Neurológico"
  );
  if (neuroBool && medicalEvaluation.neurologico) {
    payloadItems.push({
      dataTypeId: neuroBool.id,
      value: medicalEvaluation.neurologico.sinAlteraciones ? "true" : "false",
      observations: medicalEvaluation.neurologico.observaciones?.trim() || null,
    });
  }

  // === Genitourinario ===
  const genBool = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Genitourinario"
  );
  if (genBool && medicalEvaluation.genitourinario) {
    payloadItems.push({
      dataTypeId: genBool.id,
      value: medicalEvaluation.genitourinario.sinAlteraciones
        ? "true"
        : "false",
      observations:
        medicalEvaluation.genitourinario.observaciones?.trim() || null,
    });
  }
  const varicoField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Varicocele"
  );
  if (varicoField && medicalEvaluation.genitourinario?.varicocele) {
    payloadItems.push({
      dataTypeId: varicoField.id,
      value: medicalEvaluation.genitourinario.varicocele ? "true" : "false",
      observations:
        medicalEvaluation.genitourinario.varicoceleObs?.trim() || null,
    });
  }
  const fumField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "FUM"
  );
  if (fumField && medicalEvaluation.genitourinario?.fum) {
    payloadItems.push({
      dataTypeId: fumField.id,
      value: medicalEvaluation.genitourinario.fum,
    });
  }
  const partosField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Partos"
  );
  if (partosField && medicalEvaluation.genitourinario?.partos) {
    payloadItems.push({
      dataTypeId: partosField.id,
      value: String(medicalEvaluation.genitourinario.partos),
    });
  }
  const cesareaField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Cesárea"
  );
  if (cesareaField && medicalEvaluation.genitourinario?.cesarea) {
    payloadItems.push({
      dataTypeId: cesareaField.id,
      value: String(medicalEvaluation.genitourinario.cesarea),
    });
  }
  const embarazosField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Embarazos"
  );
  if (embarazosField && medicalEvaluation.genitourinario?.embarazos) {
    payloadItems.push({
      dataTypeId: embarazosField.id,
      value: String(medicalEvaluation.genitourinario.embarazos),
    });
  }
  // === Osteoarticular ===
  const osteo = medicalEvaluation.osteoarticular;
  if (osteo) {
    const osteoKeys = [
      { key: "mmssSin", name: "MMSS Sin Alteraciones", obsKey: "mmssObs" },
      { key: "mmiiSin", name: "MMII Sin Alteraciones", obsKey: "mmiiObs" },
      {
        key: "columnaSin",
        name: "Columna Sin Alteraciones",
        obsKey: "columnaObs",
      },
      { key: "amputaciones", name: "Amputaciones", obsKey: "amputacionesObs" },
    ] as const;

    osteoKeys.forEach(({ key, name, obsKey }) => {
      const dt = fields.find(
        (f) => f.category === "EXAMEN_FISICO" && f.name === name
      );
      if (!dt) return;

      // true/false
      const val = (osteo as any)[key] === true;
      // lee la propiedad correcta
      const obs = (osteo as any)[obsKey]?.trim() || null;

      payloadItems.push({
        dataTypeId: dt.id,
        value: val ? "true" : "false",
        observations: obs,
      });
    });
  }

  // === Agudeza Visual ===
  // S/C Derecho
  const scDerField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Agudeza S/C Derecho"
  );
  if (scDerField && medicalEvaluation.agudezaSc?.right) {
    payloadItems.push({
      dataTypeId: scDerField.id,
      value: medicalEvaluation.agudezaSc.right,
    });
  }

  // S/C Izquierdo
  const scIzqField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Agudeza S/C Izquierdo"
  );
  if (scIzqField && medicalEvaluation.agudezaSc?.left) {
    payloadItems.push({
      dataTypeId: scIzqField.id,
      value: medicalEvaluation.agudezaSc.left,
    });
  }

  // C/C Derecho
  const ccDerField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Agudeza C/C Derecho"
  );
  if (ccDerField && medicalEvaluation.agudezaCc?.right) {
    payloadItems.push({
      dataTypeId: ccDerField.id,
      value: medicalEvaluation.agudezaCc.right,
    });
  }

  // C/C Izquierdo
  const ccIzqField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Agudeza C/C Izquierdo"
  );
  if (ccIzqField && medicalEvaluation.agudezaCc?.left) {
    payloadItems.push({
      dataTypeId: ccIzqField.id,
      value: medicalEvaluation.agudezaCc.left,
    });
  }

  // Visión Cromática
  const cromField = fields.find(
    (f) => f.category === "EXAMEN_CLINICO" && f.name === "Visión Cromática"
  );
  if (cromField && medicalEvaluation.visionCromatica) {
    payloadItems.push({
      dataTypeId: cromField.id,
      // valor "normal" o "anormal"
      value: medicalEvaluation.visionCromatica,
      // aquí guardo tus observaciones (antes usabas notasVision)
      observations: medicalEvaluation.notasVision?.trim() || null,
    });
  }
  return payloadItems;
};

export default function MedicalHistoryTab({
  isEditing,
  setIsEditing,
  medicalEvaluationId,
  dataValues,
}: {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  medicalEvaluationId: number;
  dataValues: DataValue[] | undefined;
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
  const { promiseToast } = useToastContext();
  useInitializeMedicalEvaluation(dataValues);
  const formData = useSelector(
    (state: RootState) => state.preOccupational.formData
  );
  // const workerInfo = formData.workerInformation;
  const occupationalHistory = formData.occupationalHistory;
  const medicalEvaluation = formData.medicalEvaluation;

  // const workerDataValues = buildWorkerPayload(fields, workerInfo);
  const antecedentesDataValues = buildOccupationalHistoryPayload(
    occupationalHistory,
    fields
  );
  const medicalEvaluationDataValues = buildMedicalEvaluationPayload(
    fields,
    medicalEvaluation
  );

  const combinedDataValues = [
    // ...workerDataValues,
    ...antecedentesDataValues,
    ...medicalEvaluationDataValues,
  ];

  const handleSave = async () => {
    const payload = {
      medicalEvaluationId: medicalEvaluationId,
      dataValues: combinedDataValues,
    };
    await promiseToast(createDataValuesMutation.mutateAsync(payload), {
      loading: {
        title: "Guardando datos",
        description: "Por favor espera mientras procesamos tu solicitud",
      },
      success: {
        title: "Datos guardados",
        description: "Los datos se guardaron exitosamente",
      },
      error: (error: any) => ({
        title: "Error al guardar los datos",
        description:
          error.response?.data?.message || "Ha ocurrido un error inesperado",
      }),
    });
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
        {/* <InstitutionInformation isEditing={isEditing} fields={fields} /> */}
        {/* <WorkerInformationAccordion isEditing={isEditing} /> */}
        <OccupationalHistoryAccordion
          isEditing={isEditing}
          dataValues={dataValues}
        />
        <MedicalEvaluationAccordion
          isEditing={isEditing}
          dataValues={dataValues}
        />
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
