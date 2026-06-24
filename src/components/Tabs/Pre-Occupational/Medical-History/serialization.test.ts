import { beforeAll, describe, expect, it, vi } from "vitest";
import type { DataCategory, DataType } from "@/types/Data-Type/Data-Type";
import type { DataValue } from "@/types/Data-Value/Data-Value";
import type { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import { mapMedicalEvaluation } from "@/common/helpers/maps";

let buildMedicalEvaluationPayload: typeof import("./index").buildMedicalEvaluationPayload;

beforeAll(async () => {
  const storageMock = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
  };

  vi.stubGlobal("localStorage", storageMock);
  vi.stubGlobal("sessionStorage", storageMock);

  ({ buildMedicalEvaluationPayload } = await import("./index"));
});

const BASE_TIMESTAMP = "2026-04-05T00:00:00.000Z";

const createDataType = (
  id: number,
  name: string,
  category: DataCategory,
  dataType: DataType["dataType"] = "STRING"
): DataType => ({
  id,
  name,
  category,
  dataType,
  createdAt: BASE_TIMESTAMP,
  updatedAt: BASE_TIMESTAMP,
  deletedAt: "",
});

const fieldDefinitions: Array<{
  name: string;
  category: DataCategory;
  dataType?: DataType["dataType"];
}> = [
  { name: "Aspecto general", category: "HISTORIA_MEDICA" },
  { name: "Talla", category: "EXAMEN_CLINICO" },
  { name: "Peso", category: "EXAMEN_CLINICO" },
  { name: "IMC", category: "EXAMEN_CLINICO" },
  { name: "Perimetro Abdominal", category: "EXAMEN_CLINICO" },
  { name: "Frecuencia Cardíaca", category: "EXAMEN_CLINICO" },
  { name: "Frecuencia Respiratoria", category: "EXAMEN_CLINICO" },
  { name: "Presión Sistólica", category: "EXAMEN_CLINICO" },
  { name: "Presión Diastólica", category: "EXAMEN_CLINICO" },
  { name: "Normocoloreada", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Tatuajes", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Cabeza y Cuello", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Observaciones Cabeza y Cuello", category: "EXAMEN_FISICO" },
  {
    name: "Bucodental – Sin alteraciones",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  {
    name: "Bucodental – Caries",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  {
    name: "Bucodental – Faltan piezas",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  { name: "Bucodental – Observaciones", category: "EXAMEN_FISICO" },
  { name: "Torax Deformaciones", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Torax Cicatrices", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Aparato Respiratorio", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Oximetria", category: "EXAMEN_CLINICO" },
  { name: "Aparato Circulatorio", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "TA", category: "EXAMEN_CLINICO" },
  { name: "Várices", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  {
    name: "Aparato Gastrointestinal",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  { name: "Cicatrices", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Hernias", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Eventraciones", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Hemorroides", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Aparato Neurológico", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  {
    name: "Aparato Genitourinario",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  { name: "Varicocele", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "FUM", category: "EXAMEN_FISICO" },
  { name: "Partos", category: "EXAMEN_FISICO" },
  { name: "Cesárea", category: "EXAMEN_FISICO" },
  { name: "Embarazos", category: "EXAMEN_FISICO" },
  {
    name: "MMSS Sin Alteraciones",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  {
    name: "MMII Sin Alteraciones",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  {
    name: "Columna Sin Alteraciones",
    category: "EXAMEN_FISICO",
    dataType: "BOOLEAN",
  },
  { name: "Amputaciones", category: "EXAMEN_FISICO", dataType: "BOOLEAN" },
  { name: "Agudeza S/C Derecho", category: "EXAMEN_CLINICO" },
  { name: "Agudeza S/C Izquierdo", category: "EXAMEN_CLINICO" },
  { name: "Agudeza C/C Derecho", category: "EXAMEN_CLINICO" },
  { name: "Agudeza C/C Izquierdo", category: "EXAMEN_CLINICO" },
  { name: "Visión Cromática", category: "EXAMEN_CLINICO" },
];

const createFields = (): DataType[] =>
  fieldDefinitions.map((definition, index) =>
    createDataType(
      index + 1,
      definition.name,
      definition.category,
      definition.dataType ?? "STRING"
    )
  );

const buildPayloadGroups = (
  payload: ReturnType<typeof buildMedicalEvaluationPayload>,
  fields: DataType[]
) => {
  const fieldById = new Map(fields.map((field) => [field.id, field]));

  return payload.reduce<
    Record<string, Array<{ value: string; observations?: string | null }>>
  >((accumulator, item) => {
    const fieldName = fieldById.get(item.dataTypeId)?.name;
    if (!fieldName) {
      throw new Error(`Missing field for dataTypeId ${item.dataTypeId}`);
    }

    accumulator[fieldName] ??= [];
    accumulator[fieldName].push({
      value: item.value,
      observations: item.observations,
    });
    return accumulator;
  }, {});
};

const buildDataValues = (
  payload: ReturnType<typeof buildMedicalEvaluationPayload>,
  fields: DataType[]
): DataValue[] => {
  const fieldById = new Map(fields.map((field) => [field.id, field]));

  return payload.map((item, index) => {
    const dataType = fieldById.get(item.dataTypeId);

    if (!dataType) {
      throw new Error(`Missing field for dataTypeId ${item.dataTypeId}`);
    }

    return {
      id: index + 1,
      name: dataType.name,
      dataType,
      value: item.value,
      observations: item.observations ?? undefined,
      createdAt: BASE_TIMESTAMP,
      updatedAt: new Date(Date.parse(BASE_TIMESTAMP) + index * 1000).toISOString(),
      deletedAt: "",
    };
  });
};

const createMedicalEvaluationFixture = (): IMedicalEvaluation => ({
  aspectoGeneral: "Bueno",
  tiempoLibre: "",
  examenClinico: {
    talla: "180",
    peso: "82",
    imc: "25.31",
    perimetroAbdominal: "90",
    frecuenciaCardiaca: "68",
    frecuenciaRespiratoria: "14",
    presionSistolica: "120",
    presionDiastolica: "80",
  },
  examenFisico: {},
  agudezaSc: { right: "10/10", left: "9/10" },
  agudezaCc: { right: "10/10", left: "10/10" },
  visionCromatica: "anormal",
  notasVision: 'Discromatopsia leve',
  piel: {
    normocoloreada: "no",
    tatuajes: "si",
    observaciones: "Nevo en hombro derecho",
  },
  cabezaCuello: {
    sinAlteraciones: false,
    observaciones: "Rigidez cervical leve",
  },
  bucodental: {
    sinAlteraciones: false,
    caries: true,
    faltanPiezas: false,
    observaciones: "Caries en molar inferior",
  },
  torax: {
    deformaciones: "no",
    deformacionesObs: "",
    cicatrices: "si",
    cicatricesObs: "Cicatriz antigua en hemitórax derecho",
  },
  respiratorio: {
    frecuenciaRespiratoria: "14",
    oximetria: "97",
    sinAlteraciones: false,
    observaciones: "Sibilancias leves",
  },
  circulatorio: {
    frecuenciaCardiaca: "68",
    presion: "110/70",
    sinAlteraciones: false,
    observaciones: "Soplo sistólico leve",
    varices: false,
    varicesObs: "Sin várices visibles",
  },
  neurologico: {
    sinAlteraciones: false,
    observaciones: "Reflejos disminuidos",
  },
  gastrointestinal: {
    sinAlteraciones: false,
    observaciones: "Dolor leve a la palpación",
    cicatrices: false,
    cicatricesObs: "Sin cicatrices quirúrgicas",
    hernias: true,
    herniasObs: "Pequeña hernia umbilical",
    eventraciones: false,
    eventracionesObs: "",
    hemorroides: true,
    hemorroidesObs: "Internas grado I",
  },
  genitourinario: {
    sinAlteraciones: false,
    observaciones: "Hallazgo general leve",
    varicocele: false,
    varicoceleObs: "No visible al examen",
    fum: "2026-01-10",
    embarazos: "2",
    partos: "1",
    cesarea: "1",
  },
  osteoarticular: {
    mmssSin: true,
    mmssObs: "",
    mmiiSin: false,
    mmiiObs: "Dolor en rodilla izquierda",
    columnaSin: true,
    columnaObs: "",
    amputaciones: false,
    amputacionesObs: "Sin amputaciones",
  },
});

describe("Medical-History serialization", () => {
  it("serializa todas las secciones clínicas del preocupacional al payload de data-values", () => {
    const fields = createFields();
    const payload = buildMedicalEvaluationPayload(
      fields,
      createMedicalEvaluationFixture()
    );
    const payloadByName = buildPayloadGroups(payload, fields);

    expect(payloadByName["Aspecto general"][0]).toEqual({
      value: "Bueno",
      observations: undefined,
    });
    expect(payloadByName["Normocoloreada"][0]).toEqual({
      value: "false",
      observations: "Nevo en hombro derecho",
    });
    expect(payloadByName["Tatuajes"][0]).toEqual({
      value: "true",
      observations: null,
    });
    expect(payloadByName["Cabeza y Cuello"][0]).toEqual({
      value: "false",
      observations: "Rigidez cervical leve",
    });
    expect(payloadByName["Observaciones Cabeza y Cuello"][0]).toEqual({
      value: "Rigidez cervical leve",
      observations: undefined,
    });
    expect(payloadByName["Bucodental – Caries"][0]).toEqual({
      value: "true",
      observations: null,
    });
    expect(payloadByName["Bucodental – Faltan piezas"][0]).toEqual({
      value: "false",
      observations: null,
    });
    expect(payloadByName["Torax Cicatrices"][0]).toEqual({
      value: "true",
      observations: "Cicatriz antigua en hemitórax derecho",
    });
    expect(payloadByName["Aparato Respiratorio"][0]).toEqual({
      value: "false",
      observations: "Sibilancias leves",
    });
    expect(payloadByName["Oximetria"][0]).toEqual({
      value: "97",
      observations: undefined,
    });
    expect(payloadByName["Aparato Circulatorio"][0]).toEqual({
      value: "false",
      observations: "Soplo sistólico leve",
    });
    expect(payloadByName["Várices"][0]).toEqual({
      value: "false",
      observations: "Sin várices visibles",
    });
    expect(payloadByName["Aparato Gastrointestinal"][0]).toEqual({
      value: "false",
      observations: "Dolor leve a la palpación",
    });
    expect(payloadByName["Hernias"][0]).toEqual({
      value: "true",
      observations: "Pequeña hernia umbilical",
    });
    expect(payloadByName["Aparato Neurológico"][0]).toEqual({
      value: "false",
      observations: "Reflejos disminuidos",
    });
    expect(payloadByName["Aparato Genitourinario"][0]).toEqual({
      value: "false",
      observations: "Hallazgo general leve",
    });
    expect(payloadByName["Varicocele"][0]).toEqual({
      value: "false",
      observations: "No visible al examen",
    });
    expect(payloadByName["FUM"][0]).toEqual({
      value: "2026-01-10",
      observations: undefined,
    });
    expect(payloadByName["Partos"][0]).toEqual({
      value: "1",
      observations: undefined,
    });
    expect(payloadByName["MMII Sin Alteraciones"][0]).toEqual({
      value: "false",
      observations: "Dolor en rodilla izquierda",
    });
    expect(payloadByName["Amputaciones"][0]).toEqual({
      value: "false",
      observations: "Sin amputaciones",
    });
    expect(payloadByName["Visión Cromática"][0]).toEqual({
      value: "anormal",
      observations: "Discromatopsia leve",
    });
    expect(payloadByName["Frecuencia Cardíaca"]).toEqual([
      {
        value: "68",
        observations: undefined,
      },
    ]);
    expect(payloadByName["Frecuencia Respiratoria"]).toEqual([
      {
        value: "14",
        observations: undefined,
      },
    ]);
  });

  it("rehidrata correctamente las secciones clínicas desde data-values guardados", () => {
    const fields = createFields();
    const payload = buildMedicalEvaluationPayload(
      fields,
      createMedicalEvaluationFixture()
    );
    const dataValues = buildDataValues(payload, fields);

    const hydrated = mapMedicalEvaluation(dataValues);

    expect(hydrated.aspectoGeneral).toBe("Bueno");
    expect(hydrated.examenClinico).toMatchObject({
      talla: "180",
      peso: "82",
      imc: "25.31",
      perimetroAbdominal: "90",
      frecuenciaCardiaca: "68",
      frecuenciaRespiratoria: "14",
      presionSistolica: "120",
      presionDiastolica: "80",
    });
    expect(hydrated.agudezaSc).toEqual({ right: "10/10", left: "9/10" });
    expect(hydrated.agudezaCc).toEqual({ right: "10/10", left: "10/10" });
    expect(hydrated.visionCromatica).toBe("anormal");
    expect(hydrated.notasVision).toBe("Discromatopsia leve");
    expect(hydrated.piel).toEqual({
      normocoloreada: "no",
      tatuajes: "si",
      observaciones: "Nevo en hombro derecho",
    });
    expect(hydrated.cabezaCuello).toEqual({
      sinAlteraciones: false,
      observaciones: "Rigidez cervical leve",
    });
    expect(hydrated.bucodental).toEqual({
      sinAlteraciones: false,
      caries: true,
      faltanPiezas: false,
      observaciones: "Caries en molar inferior",
    });
    expect(hydrated.torax).toEqual({
      deformaciones: "no",
      deformacionesObs: "",
      cicatrices: "si",
      cicatricesObs: "Cicatriz antigua en hemitórax derecho",
    });
    expect(hydrated.respiratorio).toEqual({
      frecuenciaRespiratoria: "14",
      oximetria: "97",
      sinAlteraciones: false,
      observaciones: "Sibilancias leves",
    });
    expect(hydrated.circulatorio).toEqual({
      frecuenciaCardiaca: "68",
      presion: "110/70",
      sinAlteraciones: false,
      observaciones: "Soplo sistólico leve",
      varices: false,
      varicesObs: "Sin várices visibles",
    });
    expect(hydrated.neurologico).toEqual({
      sinAlteraciones: false,
      observaciones: "Reflejos disminuidos",
    });
    expect(hydrated.gastrointestinal).toEqual({
      sinAlteraciones: false,
      observaciones: "Dolor leve a la palpación",
      cicatrices: false,
      cicatricesObs: "Sin cicatrices quirúrgicas",
      hernias: true,
      herniasObs: "Pequeña hernia umbilical",
      eventraciones: false,
      eventracionesObs: "",
      hemorroides: true,
      hemorroidesObs: "Internas grado I",
    });
    expect(hydrated.genitourinario).toEqual({
      sinAlteraciones: false,
      observaciones: "Hallazgo general leve",
      varicocele: false,
      varicoceleObs: "No visible al examen",
      fum: "2026-01-10",
      partos: "1",
      cesarea: "1",
      embarazos: "2",
    });
    expect(hydrated.osteoarticular).toEqual({
      mmssSin: true,
      mmssObs: "",
      mmiiSin: false,
      mmiiObs: "Dolor en rodilla izquierda",
      columnaSin: true,
      columnaObs: "",
      amputaciones: false,
      amputacionesObs: "Sin amputaciones",
    });
  });

  it("mantiene entradas explícitas en blanco para borrar observaciones previas", () => {
    const fields = createFields();
    const medicalEvaluation = createMedicalEvaluationFixture();

    medicalEvaluation.cabezaCuello = {
      sinAlteraciones: true,
      observaciones: "",
    };
    medicalEvaluation.bucodental = {
      sinAlteraciones: true,
      caries: false,
      faltanPiezas: false,
      observaciones: "",
    };

    const payload = buildMedicalEvaluationPayload(fields, medicalEvaluation);
    const payloadByName = buildPayloadGroups(payload, fields);

    expect(payloadByName["Observaciones Cabeza y Cuello"][0]).toEqual({
      value: "",
      observations: undefined,
    });
    expect(payloadByName["Bucodental – Observaciones"][0]).toEqual({
      value: "",
      observations: undefined,
    });
    expect(payloadByName["Cabeza y Cuello"][0]).toEqual({
      value: "true",
      observations: null,
    });
    expect(payloadByName["Bucodental – Sin alteraciones"][0]).toEqual({
      value: "true",
      observations: null,
    });
  });

  it("persiste observaciones clínicas aunque el booleano asociado no haya sido marcado todavía", () => {
    const fields = createFields();
    const medicalEvaluation = createMedicalEvaluationFixture();

    medicalEvaluation.piel = {
      normocoloreada: undefined,
      tatuajes: undefined,
      observaciones: "Mácula aislada",
    };
    medicalEvaluation.respiratorio = {
      frecuenciaRespiratoria: "",
      oximetria: "",
      sinAlteraciones: undefined,
      observaciones: "Roncus bibasales",
    };
    medicalEvaluation.gastrointestinal = {
      sinAlteraciones: undefined,
      observaciones: "Molestia epigástrica",
      cicatrices: undefined,
      cicatricesObs: "",
      hernias: undefined,
      herniasObs: "",
      eventraciones: undefined,
      eventracionesObs: "",
      hemorroides: undefined,
      hemorroidesObs: "",
    };
    medicalEvaluation.genitourinario = {
      sinAlteraciones: undefined,
      observaciones: "Observación ginecológica",
      varicocele: undefined,
      varicoceleObs: "",
      fum: "",
      embarazos: "",
      partos: "",
      cesarea: "",
    };

    const payloadByName = buildPayloadGroups(
      buildMedicalEvaluationPayload(fields, medicalEvaluation),
      fields
    );

    expect(payloadByName["Normocoloreada"][0]).toEqual({
      value: "false",
      observations: "Mácula aislada",
    });
    expect(payloadByName["Aparato Respiratorio"][0]).toEqual({
      value: "false",
      observations: "Roncus bibasales",
    });
    expect(payloadByName["Aparato Gastrointestinal"][0]).toEqual({
      value: "false",
      observations: "Molestia epigástrica",
    });
    expect(payloadByName["Aparato Genitourinario"][0]).toEqual({
      value: "false",
      observations: "Observación ginecológica",
    });
  });
});
