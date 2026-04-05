import { TabsContent } from "@/components/ui/tabs";
import { HeartPulse } from "lucide-react";
// import WorkerInformationAccordion from "@/components/Accordion/Pre-Occupational/Worker-Information";
import OccupationalHistoryAccordion from "@/components/Accordion/Pre-Occupational/Occupational-History";
import MedicalEvaluationAccordion from "@/components/Accordion/Pre-Occupational/Medical-Evaluation";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { DataType } from "@/types/Data-Type/Data-Type";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { mapMedicalEvaluation, mapOccupationalHistory } from "@/common/helpers/maps";
import {
  normalizeReportVisibilityOverrides,
  ReportVisibilityOverrides,
} from "@/common/helpers/report-visibility";
import type { IMedicalEvaluation, Torax, Circulatorio, Gastrointestinal, Osteoarticular } from "@/store/Pre-Occupational/preOccupationalSlice";
import {
  clearUnsavedChanges,
  hydrateFormData,
  hydrateReportVisibilityOverrides,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { useQueryClient } from "@tanstack/react-query";
import StageActionBar from "@/components/Pre-Occupational/StageActionBar";
import { updateMedicalEvaluation } from "@/api/Medical-Evaluation/update.medical.evaluation";
import { useMutation } from "@tanstack/react-query";
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

export const buildOccupationalHistoryPayload = (
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

const normalizeOccupationalHistory = (
  items: { id: string; description: string }[] | undefined
) =>
  (items ?? [])
    .map((item) => item.description.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

export const buildMedicalEvaluationPayload = (
  fields: DataType[],
  medicalEvaluation: IMedicalEvaluation
): { dataTypeId: number; value: string; observations?: string | null }[] => {
  const payloadItems: {
    dataTypeId: number;
    value: string;
    observations?: string | null;
  }[] = [];

  const pushBooleanItem = ({
    field,
    value,
    observations,
    fallbackWhenOnlyObservations,
  }: {
    field: DataType | undefined;
    value: boolean | "si" | "no" | undefined;
    observations?: string | null;
    fallbackWhenOnlyObservations: boolean;
  }) => {
    if (!field) return;

    const normalizedObservations = observations?.trim() || "";
    const hasObservations = normalizedObservations !== "";

    const normalizedValue =
      typeof value === "boolean"
        ? value
        : value === "si"
          ? true
          : value === "no"
            ? false
            : undefined;

    if (normalizedValue === undefined && !hasObservations) return;

    payloadItems.push({
      dataTypeId: field.id,
      value: String(normalizedValue ?? fallbackWhenOnlyObservations),
      observations: hasObservations ? normalizedObservations : null,
    });
  };

  const aspectoField = fields.find(
    (f) => f.category === "HISTORIA_MEDICA" && f.name === "Aspecto general"
  );
  if (aspectoField && medicalEvaluation.aspectoGeneral) {
    payloadItems.push({
      dataTypeId: aspectoField.id,
      value: medicalEvaluation.aspectoGeneral,
    });
  }

  const tiempoLibreField = fields.find(
    (f) => f.category === "HISTORIA_MEDICA" && f.name === "Tiempo libre"
  );
  if (tiempoLibreField && medicalEvaluation.tiempoLibre.trim() !== "") {
    payloadItems.push({
      dataTypeId: tiempoLibreField.id,
      value: medicalEvaluation.tiempoLibre.trim(),
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
  pushBooleanItem({
    field: normoField,
    value: medicalEvaluation.piel?.normocoloreada,
    observations: medicalEvaluation.piel?.observaciones,
    fallbackWhenOnlyObservations: false,
  });

  // Tatuajes
  const tatField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Tatuajes"
  );
  pushBooleanItem({
    field: tatField,
    value: medicalEvaluation.piel?.tatuajes,
    observations: null,
    fallbackWhenOnlyObservations: true,
  });

  const cabezaBool = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Cabeza y Cuello"
  );
  // Solo enviar si el valor fue explícitamente seleccionado
  pushBooleanItem({
    field: cabezaBool,
    value: medicalEvaluation.cabezaCuello?.sinAlteraciones,
    observations: medicalEvaluation.cabezaCuello?.observaciones,
    fallbackWhenOnlyObservations: false,
  });

  // 2) Observaciones Cabeza y Cuello - enviar siempre para permitir borrar
  const cabezaObs = fields.find(
    (f) =>
      f.category === "EXAMEN_FISICO" &&
      f.name === "Observaciones Cabeza y Cuello"
  );
  if (cabezaObs && medicalEvaluation.cabezaCuello) {
    payloadItems.push({
      dataTypeId: cabezaObs.id,
      value: medicalEvaluation.cabezaCuello.observaciones?.trim() || "",
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
      const value = medicalEvaluation.bucodental[key as keyof typeof medicalEvaluation.bucodental];
      pushBooleanItem({
        field: dt,
        value: value as boolean | undefined,
        observations: null,
        fallbackWhenOnlyObservations: true,
      });
    }
  });
  // Observaciones Bucodental - enviar siempre para permitir borrar
  const bucoObs = fields.find(
    (f) =>
      f.category === "EXAMEN_FISICO" && f.name === "Bucodental – Observaciones"
  );
  if (bucoObs && medicalEvaluation.bucodental) {
    payloadItems.push({
      dataTypeId: bucoObs.id,
      value: medicalEvaluation.bucodental.observaciones?.trim() || "",
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
      const torax: Torax = medicalEvaluation.torax;
      const value = torax[key as keyof Torax];
      const obsKey = `${key}Obs` as keyof Torax;
      pushBooleanItem({
        field: dt,
        value: value as "si" | "no" | undefined,
        observations: torax[obsKey] as string | undefined,
        fallbackWhenOnlyObservations: true,
      });
    }
  });

  // === Respiratorio ===
  if (medicalEvaluation.respiratorio) {
    const sharedRespiratoryFrequency =
      medicalEvaluation.respiratorio.frecuenciaRespiratoria ||
      medicalEvaluation.examenClinico.frecuenciaRespiratoria;

    const frecuenciaRespiratoriaField = fields.find(
      (f) =>
        f.category === "EXAMEN_CLINICO" && f.name === "Frecuencia Respiratoria"
    );
    if (frecuenciaRespiratoriaField && sharedRespiratoryFrequency) {
      payloadItems.push({
        dataTypeId: frecuenciaRespiratoriaField.id,
        value: String(sharedRespiratoryFrequency),
      });
    }

    const respBool = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Respiratorio"
    );
    pushBooleanItem({
      field: respBool,
      value: medicalEvaluation.respiratorio.sinAlteraciones,
      observations: medicalEvaluation.respiratorio.observaciones,
      fallbackWhenOnlyObservations: false,
    });

    // Campos de clínica (números) exclusivos de la sección
    ["oximetria"].forEach((key) => {
      const dt = fields.find(
        (f) =>
          f.category === "EXAMEN_CLINICO" &&
          f.name === "Oximetria"
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
    const sharedHeartRate =
      circ.frecuenciaCardiaca || medicalEvaluation.examenClinico.frecuenciaCardiaca;

    const frecuenciaCardiacaField = fields.find(
      (f) => f.category === "EXAMEN_CLINICO" && f.name === "Frecuencia Cardíaca"
    );
    if (frecuenciaCardiacaField && sharedHeartRate) {
      payloadItems.push({
        dataTypeId: frecuenciaCardiacaField.id,
        value: String(sharedHeartRate),
      });
    }

    const circBool = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Circulatorio"
    );
    pushBooleanItem({
      field: circBool,
      value: circ.sinAlteraciones,
      observations: circ.observaciones,
      fallbackWhenOnlyObservations: false,
    });

    // 2) Signos vitales circulatorios exclusivos de la sección
    const circClin = [
      { key: "presion", name: "TA" },
    ] as const;

    circClin.forEach(({ key, name }) => {
      const dt = fields.find(
        (f) => f.category === "EXAMEN_CLINICO" && f.name === name
      );
      const val = circ[key as keyof Circulatorio];
      if (dt && val != null && val !== "") {
        payloadItems.push({
          dataTypeId: dt.id,
          value: String(val),
        });
      }
    });

    // 3) Várices (boolean + obs) - solo enviar si fue seleccionado
    const varicesField = fields.find(
      (f) => f.category === "EXAMEN_FISICO" && f.name === "Várices"
    );
    pushBooleanItem({
      field: varicesField,
      value: circ.varices,
      observations: circ.varicesObs,
      fallbackWhenOnlyObservations: true,
    });
  }

  // === Gastrointestinal ===
  const giBool = fields.find(
    (f) =>
      f.category === "EXAMEN_FISICO" && f.name === "Aparato Gastrointestinal"
  );
  // Solo enviar si el valor fue explícitamente seleccionado
  pushBooleanItem({
    field: giBool,
    value: medicalEvaluation.gastrointestinal?.sinAlteraciones,
    observations: medicalEvaluation.gastrointestinal?.observaciones,
    fallbackWhenOnlyObservations: false,
  });
  if (medicalEvaluation.gastrointestinal) {
    // === Cirugías, hernias, eventraciones, hemorroides ===
    // Solo enviar campos que fueron explícitamente seleccionados (no undefined)
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
      if (!dt || !medicalEvaluation.gastrointestinal) return;

      const gi: Gastrointestinal = medicalEvaluation.gastrointestinal;
      const val = gi[key as keyof Gastrointestinal] as boolean | undefined;
      const obsKey = `${key}Obs` as keyof Gastrointestinal;
      pushBooleanItem({
        field: dt,
        value: val,
        observations: gi[obsKey] as string | undefined,
        fallbackWhenOnlyObservations: true,
      });
    });
  }

  // === Neurológico ===
  const neuroBool = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Neurológico"
  );
  // Solo enviar si el valor fue explícitamente seleccionado
  pushBooleanItem({
    field: neuroBool,
    value: medicalEvaluation.neurologico?.sinAlteraciones,
    observations: medicalEvaluation.neurologico?.observaciones,
    fallbackWhenOnlyObservations: false,
  });

  // === Genitourinario ===
  const genBool = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Aparato Genitourinario"
  );
  // Solo enviar si el valor fue explícitamente seleccionado
  pushBooleanItem({
    field: genBool,
    value: medicalEvaluation.genitourinario?.sinAlteraciones,
    observations: medicalEvaluation.genitourinario?.observaciones,
    fallbackWhenOnlyObservations: false,
  });
  const varicoField = fields.find(
    (f) => f.category === "EXAMEN_FISICO" && f.name === "Varicocele"
  );
  pushBooleanItem({
    field: varicoField,
    value: medicalEvaluation.genitourinario?.varicocele,
    observations: medicalEvaluation.genitourinario?.varicoceleObs,
    fallbackWhenOnlyObservations: true,
  });
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

      const val = osteo[key as keyof Osteoarticular];
      pushBooleanItem({
        field: dt,
        value: val as boolean | undefined,
        observations: osteo[obsKey as keyof Osteoarticular] as string | undefined,
        fallbackWhenOnlyObservations: false,
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

const CLEARABLE_MEDICAL_EVALUATION_FIELD_NAMES = new Set([
  "Aspecto general",
  "Tiempo libre",
  "Talla",
  "Peso",
  "IMC",
  "Perimetro Abdominal",
  "Frecuencia Cardíaca",
  "Frecuencia Respiratoria",
  "Presión Sistólica",
  "Presión Diastólica",
  "Oximetria",
  "TA",
  "FUM",
  "Partos",
  "Cesárea",
  "Embarazos",
  "Agudeza S/C Derecho",
  "Agudeza S/C Izquierdo",
  "Agudeza C/C Derecho",
  "Agudeza C/C Izquierdo",
]);

export const buildMedicalEvaluationClearPayload = ({
  fields,
  currentPayload,
  savedMedicalEvaluation,
  dataValues,
}: {
  fields: DataType[];
  currentPayload: { dataTypeId: number; value: string; observations?: string | null }[];
  savedMedicalEvaluation?: IMedicalEvaluation | null;
  dataValues?: DataValue[];
}): { id: number; dataTypeId: number; value: string }[] => {
  if (!savedMedicalEvaluation || !dataValues?.length) {
    return [];
  }

  const previousPayload = buildMedicalEvaluationPayload(fields, savedMedicalEvaluation);
  const currentPayloadIds = new Set(currentPayload.map((item) => item.dataTypeId));
  const fieldById = new Map(fields.map((field) => [field.id, field]));
  const persistedByTypeId = new Map<number, DataValue>();

  [...dataValues]
    .sort((a, b) => {
      const updatedDiff =
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (updatedDiff !== 0) return updatedDiff;
      return b.id - a.id;
    })
    .forEach((item) => {
      persistedByTypeId.set(item.dataType.id, item);
    });

  return previousPayload
    .filter((item) => {
      const field = fieldById.get(item.dataTypeId);

      if (!field) return false;
      if (field.dataType === "BOOLEAN") return false;
      if (!CLEARABLE_MEDICAL_EVALUATION_FIELD_NAMES.has(field.name)) return false;

      return !currentPayloadIds.has(item.dataTypeId);
    })
    .map((item) => {
      const persisted = persistedByTypeId.get(item.dataTypeId);
      if (!persisted) return null;

      return {
        id: persisted.id,
        dataTypeId: item.dataTypeId,
        value: "",
      };
    })
    .filter((item): item is { id: number; dataTypeId: number; value: string } => item !== null);
};

export default function MedicalHistoryTab({
  isEditing,
  setIsEditing,
  medicalEvaluationId,
  dataValues,
  standalone = false,
  showEditToggle = true,
  includeOccupationalHistory = true,
  includeMedicalEvaluation = true,
  savedOccupationalHistory,
  setSavedOccupationalHistory,
  savedMedicalEvaluation,
  setSavedMedicalEvaluation,
  savedReportVisibilityOverrides,
  setSavedReportVisibilityOverrides,
}: {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  medicalEvaluationId: number;
  dataValues: DataValue[] | undefined;
  standalone?: boolean;
  showEditToggle?: boolean;
  includeOccupationalHistory?: boolean;
  includeMedicalEvaluation?: boolean;
  savedOccupationalHistory?: { id: string; description: string }[];
  setSavedOccupationalHistory?: (value: { id: string; description: string }[]) => void;
  savedMedicalEvaluation?: IMedicalEvaluation | null;
  setSavedMedicalEvaluation?: (value: IMedicalEvaluation) => void;
  savedReportVisibilityOverrides?: ReportVisibilityOverrides;
  setSavedReportVisibilityOverrides?: (value: ReportVisibilityOverrides) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
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
  const { createDataValuesMutation, deleteDataValuesMutation } =
    useDataValuesMutations();
  const { promiseToast } = useToastContext();
  const formData = useSelector(
    (state: RootState) => state.preOccupational.formData
  );
  // const workerInfo = formData.workerInformation;
  const occupationalHistory = formData.occupationalHistory;
  const medicalEvaluation = formData.medicalEvaluation;
  const reportVisibilityOverrides = useSelector(
    (state: RootState) => state.preOccupational.reportVisibilityOverrides
  );
  const normalizedCurrentReportVisibilityOverrides =
    normalizeReportVisibilityOverrides(reportVisibilityOverrides);
  const normalizedSavedReportVisibilityOverrides =
    normalizeReportVisibilityOverrides(savedReportVisibilityOverrides);
  const updateMedicalEvaluationMutation = useMutation({
    mutationFn: (overrides: ReportVisibilityOverrides) =>
      updateMedicalEvaluation(medicalEvaluationId, {
        reportVisibilityOverrides: overrides,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["medical-evaluation", medicalEvaluationId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["collaborator-medical-evaluation"],
      });
    },
  });

  // const workerDataValues = buildWorkerPayload(fields, workerInfo);
  const antecedentesDataValues = buildOccupationalHistoryPayload(
    occupationalHistory,
    fields
  );
  const medicalEvaluationDataValues = buildMedicalEvaluationPayload(
    fields,
    medicalEvaluation
  );
  const medicalEvaluationClearDataValues = includeMedicalEvaluation
    ? buildMedicalEvaluationClearPayload({
        fields,
        currentPayload: medicalEvaluationDataValues,
        savedMedicalEvaluation,
        dataValues,
      })
    : [];
  const hasOccupationalHistoryChanges = includeOccupationalHistory
    ? JSON.stringify(normalizeOccupationalHistory(occupationalHistory)) !==
      JSON.stringify(normalizeOccupationalHistory(savedOccupationalHistory))
    : false;
  const hasMedicalEvaluationChanges = includeMedicalEvaluation
    ? JSON.stringify(medicalEvaluation) !==
      JSON.stringify(savedMedicalEvaluation ?? null)
    : false;
  const hasReportVisibilityChanges = includeMedicalEvaluation
    ? JSON.stringify(normalizedCurrentReportVisibilityOverrides) !==
      JSON.stringify(normalizedSavedReportVisibilityOverrides)
    : false;
  const hasPendingChanges =
    hasOccupationalHistoryChanges ||
    hasMedicalEvaluationChanges ||
    hasReportVisibilityChanges;
  const deletedOccupationalHistoryIds = includeOccupationalHistory
    ? (savedOccupationalHistory ?? [])
        .filter(
          (savedItem) =>
            !savedItem.id.startsWith("temp-") &&
            !occupationalHistory.some((currentItem) => currentItem.id === savedItem.id)
        )
        .map((item) => Number(item.id))
        .filter((id) => Number.isFinite(id))
    : [];

  const combinedDataValues = [
    ...(includeOccupationalHistory ? antecedentesDataValues : []),
    ...(includeMedicalEvaluation ? medicalEvaluationDataValues : []),
    ...medicalEvaluationClearDataValues,
  ];

  // Cancelar edición: resetear Redux con los datos originales de la BD
  const handleCancel = () => {
    if (dataValues && dataValues.length > 0) {
      const me = mapMedicalEvaluation(dataValues);
      const oh = mapOccupationalHistory(dataValues);
      dispatch(
        hydrateFormData({
          ...(includeMedicalEvaluation ? { medicalEvaluation: me } : {}),
          ...(includeOccupationalHistory ? { occupationalHistory: oh } : {}),
        })
      );
    }

    dispatch(
      hydrateReportVisibilityOverrides(normalizedSavedReportVisibilityOverrides)
    );
  };

  const handleSave = async () => {
    const savePromise = (async () => {
      if (deletedOccupationalHistoryIds.length > 0) {
        await Promise.all(
          deletedOccupationalHistoryIds.map((id) =>
            deleteDataValuesMutation.mutateAsync(id)
          )
        );
      }

      if (combinedDataValues.length > 0) {
        await createDataValuesMutation.mutateAsync({
          medicalEvaluationId: medicalEvaluationId,
          dataValues: combinedDataValues,
        });
      }

      if (includeMedicalEvaluation && hasReportVisibilityChanges) {
        await updateMedicalEvaluationMutation.mutateAsync(
          normalizedCurrentReportVisibilityOverrides
        );
      }
    })();

    await promiseToast(savePromise, {
      loading: {
        title: "Guardando datos",
        description: "Por favor espera mientras procesamos tu solicitud",
      },
      success: {
        title: "Datos guardados",
        description: "Los datos se guardaron exitosamente",
      },
      error: (error: unknown) => ({
        title: "Error al guardar los datos",
        description:
          (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
      }),
    });
    // Invalidar queries para forzar recarga de datos frescos
    queryClient.invalidateQueries({ queryKey: ["collaborator-medical-evaluation"] });
    queryClient.invalidateQueries({ queryKey: ["data-values"] });
    if (includeOccupationalHistory) {
      setSavedOccupationalHistory?.(occupationalHistory);
    }
    if (includeMedicalEvaluation) {
      setSavedMedicalEvaluation?.(medicalEvaluation);
      setSavedReportVisibilityOverrides?.(normalizedCurrentReportVisibilityOverrides);
    }
    dispatch(clearUnsavedChanges());
  };

  const sectionTitle =
    includeOccupationalHistory && includeMedicalEvaluation
      ? "Historia médica y examen físico"
      : includeOccupationalHistory
        ? "Antecedentes ocupacionales"
        : "Historia médica y examen físico";

  const content = (
    <div className="space-y-3">
      {(!standalone || showEditToggle) && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-greenPrimary">
            <HeartPulse className="h-4 w-4" />
            {sectionTitle}
          </div>
          {!isEditing && showEditToggle && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-greenPrimary/15 bg-white px-4 py-2 text-sm font-medium text-greenSecondary shadow-sm transition hover:border-greenPrimary/30 hover:bg-greenPrimary/5"
              onClick={() => setIsEditing(true)}
            >
              Habilitar edición
            </button>
          )}
        </div>
      )}
      <div className="space-y-4">
        {includeOccupationalHistory && (
          <OccupationalHistoryAccordion
            standalone
            isEditing={isEditing}
          />
        )}
        {includeMedicalEvaluation && (
          <MedicalEvaluationAccordion
            standalone
            isEditing={isEditing}
          />
        )}
      </div>
      {isEditing && hasPendingChanges && (
        <StageActionBar
          onCancel={handleCancel}
          onSave={handleSave}
          isSaving={
            createDataValuesMutation.isPending ||
            deleteDataValuesMutation.isPending ||
            updateMedicalEvaluationMutation.isPending
          }
        />
      )}
    </div>
  );

  if (standalone) {
    return content;
  }

  return (
    <TabsContent value="medical-history" className="mt-4 space-y-4">
      {content}
    </TabsContent>
  );
}
