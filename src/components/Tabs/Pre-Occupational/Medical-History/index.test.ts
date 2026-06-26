import { beforeAll, describe, expect, it, vi } from "vitest";
import type { DataType } from "@/types/Data-Type/Data-Type";
import type { DataValue } from "@/types/Data-Value/Data-Value";
import type { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import { mapMedicalEvaluation } from "@/common/helpers/maps";

let buildMedicalEvaluationPayload: typeof import("./index").buildMedicalEvaluationPayload;
let buildMedicalEvaluationClearPayload: typeof import("./index").buildMedicalEvaluationClearPayload;

beforeAll(async () => {
  const storageMock = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
  };

  vi.stubGlobal("localStorage", storageMock);
  vi.stubGlobal("sessionStorage", storageMock);

  ({ buildMedicalEvaluationPayload, buildMedicalEvaluationClearPayload } = await import("./index"));
});

const now = "2026-04-05T00:00:00.000Z";

const createField = (
  id: number,
  name: string,
  category: DataType["category"],
  dataType: DataType["dataType"]
): DataType => ({
  id,
  name,
  category,
  dataType,
  createdAt: now,
  updatedAt: now,
  deletedAt: "",
});

const fields: DataType[] = [
  createField(1, "Aspecto general", "HISTORIA_MEDICA", "STRING"),
  createField(2, "Talla", "EXAMEN_CLINICO", "STRING"),
  createField(3, "Peso", "EXAMEN_CLINICO", "STRING"),
  createField(4, "IMC", "EXAMEN_CLINICO", "STRING"),
  createField(5, "Perimetro Abdominal", "EXAMEN_CLINICO", "STRING"),
  createField(6, "Frecuencia Cardíaca", "EXAMEN_CLINICO", "STRING"),
  createField(7, "Frecuencia Respiratoria", "EXAMEN_CLINICO", "STRING"),
  createField(8, "Presión Sistólica", "EXAMEN_CLINICO", "STRING"),
  createField(9, "Presión Diastólica", "EXAMEN_CLINICO", "STRING"),
  createField(10, "Normocoloreada", "EXAMEN_FISICO", "BOOLEAN"),
  createField(11, "Tatuajes", "EXAMEN_FISICO", "BOOLEAN"),
  createField(12, "Cabeza y Cuello", "EXAMEN_FISICO", "BOOLEAN"),
  createField(13, "Observaciones Cabeza y Cuello", "EXAMEN_FISICO", "STRING"),
  createField(14, "Bucodental – Sin alteraciones", "EXAMEN_FISICO", "BOOLEAN"),
  createField(15, "Bucodental – Caries", "EXAMEN_FISICO", "BOOLEAN"),
  createField(16, "Bucodental – Faltan piezas", "EXAMEN_FISICO", "BOOLEAN"),
  createField(17, "Bucodental – Observaciones", "EXAMEN_FISICO", "STRING"),
  createField(18, "Torax Deformaciones", "EXAMEN_FISICO", "BOOLEAN"),
  createField(19, "Torax Cicatrices", "EXAMEN_FISICO", "BOOLEAN"),
  createField(20, "Aparato Respiratorio", "EXAMEN_FISICO", "BOOLEAN"),
  createField(21, "Oximetria", "EXAMEN_CLINICO", "STRING"),
  createField(22, "Aparato Circulatorio", "EXAMEN_FISICO", "BOOLEAN"),
  createField(23, "TA", "EXAMEN_CLINICO", "STRING"),
  createField(24, "Várices", "EXAMEN_FISICO", "BOOLEAN"),
  createField(25, "Aparato Gastrointestinal", "EXAMEN_FISICO", "BOOLEAN"),
  createField(26, "Cicatrices", "EXAMEN_FISICO", "BOOLEAN"),
  createField(27, "Hernias", "EXAMEN_FISICO", "BOOLEAN"),
  createField(28, "Eventraciones", "EXAMEN_FISICO", "BOOLEAN"),
  createField(29, "Hemorroides", "EXAMEN_FISICO", "BOOLEAN"),
  createField(30, "Aparato Neurológico", "EXAMEN_FISICO", "BOOLEAN"),
  createField(31, "Aparato Genitourinario", "EXAMEN_FISICO", "BOOLEAN"),
  createField(32, "Varicocele", "EXAMEN_FISICO", "BOOLEAN"),
  createField(33, "FUM", "EXAMEN_FISICO", "STRING"),
  createField(34, "Partos", "EXAMEN_FISICO", "STRING"),
  createField(35, "Cesárea", "EXAMEN_FISICO", "STRING"),
  createField(36, "Embarazos", "EXAMEN_FISICO", "STRING"),
  createField(37, "MMSS Sin Alteraciones", "EXAMEN_FISICO", "BOOLEAN"),
  createField(38, "MMII Sin Alteraciones", "EXAMEN_FISICO", "BOOLEAN"),
  createField(39, "Columna Sin Alteraciones", "EXAMEN_FISICO", "BOOLEAN"),
  createField(40, "Amputaciones", "EXAMEN_FISICO", "BOOLEAN"),
  createField(41, "Agudeza S/C Derecho", "EXAMEN_CLINICO", "STRING"),
  createField(42, "Agudeza S/C Izquierdo", "EXAMEN_CLINICO", "STRING"),
  createField(43, "Agudeza C/C Derecho", "EXAMEN_CLINICO", "STRING"),
  createField(44, "Agudeza C/C Izquierdo", "EXAMEN_CLINICO", "STRING"),
  createField(45, "Visión Cromática", "EXAMEN_CLINICO", "STRING"),
];

const createDataValueResponse = (
  payload: ReturnType<typeof buildMedicalEvaluationPayload>
): DataValue[] =>
  payload.map((item, index) => {
    const dataType = fields.find((field) => field.id === item.dataTypeId);

    if (!dataType) {
      throw new Error(`Missing DataType for id ${item.dataTypeId}`);
    }

    return {
      id: index + 1,
      name: dataType.name,
      dataType,
      value:
        dataType.dataType === "BOOLEAN" ? item.value === "true" : item.value,
      observations: item.observations ?? undefined,
      createdAt: now,
      updatedAt: now,
      deletedAt: "",
    };
  });

const createMedicalEvaluation = (): IMedicalEvaluation => ({
  aspectoGeneral: "Bueno",
  tiempoLibre: "",
  examenClinico: {
    talla: "180",
    peso: "82",
    imc: "25.31",
    perimetroAbdominal: "90",
    frecuenciaCardiaca: "72",
    frecuenciaRespiratoria: "18",
    presionSistolica: "120",
    presionDiastolica: "80",
  },
  examenFisico: {},
  agudezaSc: { right: "10/10", left: "9/10" },
  agudezaCc: { right: "10/10", left: "10/10" },
  visionCromatica: "normal",
  notasVision: "Sin observaciones visuales",
  piel: {
    normocoloreada: "si",
    tatuajes: "no",
    observaciones: "Piel sin lesiones visibles",
  },
  cabezaCuello: {
    sinAlteraciones: false,
    observaciones: "Leve rigidez cervical",
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
    frecuenciaRespiratoria: "18",
    oximetria: "98",
    sinAlteraciones: false,
    observaciones: "Murmullo vesicular conservado",
  },
  circulatorio: {
    frecuenciaCardiaca: "72",
    presion: "120/80",
    sinAlteraciones: false,
    observaciones: "Ruidos cardíacos normales",
    varices: false,
    varicesObs: "",
  },
  neurologico: {
    sinAlteraciones: false,
    observaciones: "Reflejos conservados",
  },
  gastrointestinal: {
    sinAlteraciones: false,
    observaciones: "Abdomen blando",
    cicatrices: false,
    cicatricesObs: "",
    hernias: true,
    herniasObs: "Pequeña hernia umbilical",
    eventraciones: false,
    eventracionesObs: "",
    hemorroides: false,
    hemorroidesObs: "",
  },
  genitourinario: {
    sinAlteraciones: false,
    observaciones: "Sin dolor a la palpación",
    varicocele: false,
    varicoceleObs: "",
    fum: "2026-03-10",
    embarazos: "1",
    partos: "1",
    cesarea: "0",
  },
  osteoarticular: {
    mmssSin: true,
    mmssObs: "",
    mmiiSin: false,
    mmiiObs: "Limitación leve en rodilla izquierda",
    columnaSin: true,
    columnaObs: "",
    amputaciones: false,
    amputacionesObs: "",
  },
});

describe("MedicalHistory clinical payload roundtrip", () => {
  it("preserva el ida y vuelta de las secciones clínicas principales", () => {
    const payload = buildMedicalEvaluationPayload(fields, createMedicalEvaluation());
    const hydrated = mapMedicalEvaluation(createDataValueResponse(payload));

    expect(hydrated.aspectoGeneral).toBe("Bueno");
    expect(hydrated.examenClinico).toMatchObject({
      talla: "180",
      peso: "82",
      imc: "25.31",
      perimetroAbdominal: "90",
      frecuenciaCardiaca: "72",
      frecuenciaRespiratoria: "18",
      presionSistolica: "120",
      presionDiastolica: "80",
    });
    expect(hydrated.agudezaSc).toEqual({ right: "10/10", left: "9/10" });
    expect(hydrated.agudezaCc).toEqual({ right: "10/10", left: "10/10" });
    expect(hydrated.visionCromatica).toBe("normal");
    expect(hydrated.notasVision).toBe("Sin observaciones visuales");
    expect(hydrated.piel).toMatchObject({
      normocoloreada: "si",
      tatuajes: "no",
      observaciones: "Piel sin lesiones visibles",
    });
    expect(hydrated.cabezaCuello).toMatchObject({
      sinAlteraciones: false,
      observaciones: "Leve rigidez cervical",
    });
    expect(hydrated.bucodental).toMatchObject({
      sinAlteraciones: false,
      caries: true,
      faltanPiezas: false,
      observaciones: "Caries en molar inferior",
    });
    expect(hydrated.torax).toMatchObject({
      deformaciones: "no",
      cicatrices: "si",
      cicatricesObs: "Cicatriz antigua en hemitórax derecho",
    });
    expect(hydrated.respiratorio).toMatchObject({
      sinAlteraciones: false,
      observaciones: "Murmullo vesicular conservado",
      frecuenciaRespiratoria: "18",
      oximetria: "98",
    });
    expect(hydrated.circulatorio).toMatchObject({
      sinAlteraciones: false,
      observaciones: "Ruidos cardíacos normales",
      frecuenciaCardiaca: "72",
      presion: "120/80",
      varices: false,
    });
    expect(hydrated.neurologico).toMatchObject({
      sinAlteraciones: false,
      observaciones: "Reflejos conservados",
    });
    expect(hydrated.gastrointestinal).toMatchObject({
      sinAlteraciones: false,
      observaciones: "Abdomen blando",
      hernias: true,
      herniasObs: "Pequeña hernia umbilical",
      cicatrices: false,
      eventraciones: false,
      hemorroides: false,
    });
    expect(hydrated.genitourinario).toMatchObject({
      sinAlteraciones: false,
      observaciones: "Sin dolor a la palpación",
      varicocele: false,
      fum: "2026-03-10",
      embarazos: "1",
      partos: "1",
      cesarea: "0",
    });
    expect(hydrated.osteoarticular).toMatchObject({
      mmssSin: true,
      mmiiSin: false,
      mmiiObs: "Limitación leve en rodilla izquierda",
      columnaSin: true,
      amputaciones: false,
    });
  });

  it("incluye explícitamente checks negativos para no perder falsos al guardar", () => {
    const payload = buildMedicalEvaluationPayload(fields, createMedicalEvaluation());
    const payloadByType = new Map(
      payload.map((item) => [fields.find((field) => field.id === item.dataTypeId)?.name, item])
    );

    expect(payloadByType.get("Tatuajes")?.value).toBe("false");
    expect(payloadByType.get("Bucodental – Faltan piezas")?.value).toBe("false");
    expect(payloadByType.get("Torax Deformaciones")?.value).toBe("false");
    expect(payloadByType.get("Várices")?.value).toBe("false");
    expect(payloadByType.get("Cicatrices")?.value).toBe("false");
    expect(payloadByType.get("Eventraciones")?.value).toBe("false");
    expect(payloadByType.get("Hemorroides")?.value).toBe("false");
    expect(payloadByType.get("Varicocele")?.value).toBe("false");
    expect(payloadByType.get("Amputaciones")?.value).toBe("false");
  });

  it("no duplica frecuencia cardíaca ni respiratoria aunque existan en dos bloques del form", () => {
    const payload = buildMedicalEvaluationPayload(fields, createMedicalEvaluation());
    const frequencyNames = payload
      .map((item) => fields.find((field) => field.id === item.dataTypeId)?.name)
      .filter(Boolean);

    expect(
      frequencyNames.filter((name) => name === "Frecuencia Cardíaca")
    ).toHaveLength(1);
    expect(
      frequencyNames.filter((name) => name === "Frecuencia Respiratoria")
    ).toHaveLength(1);
  });

  it("genera updates en blanco para limpiar valores escalares que antes existían", () => {
    const savedMedicalEvaluation = createMedicalEvaluation();
    const currentMedicalEvaluation = createMedicalEvaluation();
    currentMedicalEvaluation.examenClinico.talla = "";
    currentMedicalEvaluation.respiratorio.oximetria = "";
    currentMedicalEvaluation.genitourinario.fum = "";

    const savedPayload = buildMedicalEvaluationPayload(fields, savedMedicalEvaluation);
    const currentPayload = buildMedicalEvaluationPayload(fields, currentMedicalEvaluation);
    const clearPayload = buildMedicalEvaluationClearPayload({
      fields,
      currentPayload,
      savedMedicalEvaluation,
      dataValues: createDataValueResponse(savedPayload),
    });

    const clearByName = new Map(
      clearPayload.map((item) => [
        fields.find((field) => field.id === item.dataTypeId)?.name,
        item,
      ])
    );

    expect(clearByName.get("Talla")).toMatchObject({ value: "" });
    expect(clearByName.get("Oximetria")).toMatchObject({ value: "" });
    expect(clearByName.get("FUM")).toMatchObject({ value: "" });
  });
});
