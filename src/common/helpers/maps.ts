import { Circulatorio, ExamenClinico, Gastrointestinal, Genitourinario, IMedicalEvaluation, Neurologico, Osteoarticular, Respiratorio, setFormData, Torax } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useEffect } from "react";
import { ExamResults } from "./examsResults.maps";
import { Piel } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/PielSection";
import { Bucodental } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/BucodentalSection";


export interface ExamenFisicoItem {
    selected: "" | "si" | "no";
    observaciones: string;
}


interface MedicalEvaluation {
    aspectoGeneral: "Bueno" | "Regular" | "Malo",
    tiempoLibre: string,
}

export interface PhysicalEvaluation {
    [key: string]: ExamenFisicoItem;
}

const toBool = (val?: string | boolean): boolean => {
    if (typeof val === "boolean") return val;
    const low = (val ?? "").toString().toLowerCase();
    return low === "true" || low === "si";
};


export function mapPhysicalEvaluation(dataValues: DataValue[]): PhysicalEvaluation {
    const physical: PhysicalEvaluation = {};
    const mapping: Record<string, string> = {
        "Piel y faneras": "piel",
        "Ojos": "ojos",
        "Oídos": "oidos",
        "Nariz": "nariz",
        "Boca": "boca",
        "Faringe": "faringe",
        "Cuello": "cuello",
        "Aparato Respiratorio": "respiratorio",
        "Aparato Cardiovascular": "cardiovascular",
        "Aparato Digestivo": "digestivo",
        "Aparato Genitourinario": "genitourinario",
        "Aparato Locomotor": "locomotor",
        "Columna": "columna",
        "Miembros Superiores": "miembros-sup",
        "Miembros Inferiores": "miembros-inf",
        "Várices": "varices",
        "Sistema Nervioso": "sistema-nervioso",
        "Hernias": "hernias",
    };

    dataValues.forEach((dv) => {
        const key = mapping[dv.dataType.name];
        if (key) {
            const isTrue = typeof dv.value === "boolean" ? dv.value : dv.value === "true";
            const selected: "" | "si" | "no" = isTrue ? "si" : "no";
            physical[key] = {
                selected,
                observaciones: dv.observations || "",
            };
        }
    });

    return physical;
}

export function mapPiel(dataValues: DataValue[]): Piel {
    const dvNormo = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" && dv.dataType.name === "Normocoloreada"
    );
    const dvTatuajes = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" && dv.dataType.name === "Tatuajes"
    );

    return {
        normocoloreada: toBool(dvNormo?.value as string) ? "si" : "no",
        tatuajes: toBool(dvTatuajes?.value as string) ? "si" : "no",
        observaciones: dvNormo?.observations ?? "",
    };
}
export function mapConclusionText(dataValues: DataValue[]): string {
    const conclusionData = dataValues.find(
        (dv) =>
            dv.dataType.name === "Conclusion" &&
            typeof dv.value === "string"
    );
    return conclusionData ? conclusionData.value : "";
}
export function mapRecomendacionesText(dataValues: DataValue[]): string {
    const recomendacionesData = dataValues.find(
        (dv) =>
            dv.dataType.name === "Recomendaciones" &&
            typeof dv.value === "string"
    );
    return recomendacionesData ? recomendacionesData.value : "";
}
export function mapConclusionAndRecommendationsData(dataValues: DataValue[]): {
    conclusion: string;
    recomendaciones: string;
} {
    return {
        conclusion: mapConclusionText(dataValues),
        recomendaciones: mapRecomendacionesText(dataValues),
    };
}
export function mapExamResults(dataValues: DataValue[]): ExamResults {
    const resultMap = dataValues
        .filter(
            dv =>
                dv.dataType.category === "GENERAL" &&
                dv.dataType.dataType === "STRING"
        )
        .reduce<Record<string, string>>((acc, dv) => {
            acc[dv.dataType.name] = dv.value as string;
            return acc;
        }, {});

    return {
        clinico: resultMap["Clínico"] || "",
        "electrocardiograma-result": resultMap["Electrocardiograma"] || "",
        laboratorio: resultMap["Laboratorio básico ley"] || "",
        "rx-torax": resultMap["RX Torax Frente"] || "",
        electroencefalograma: resultMap["Electroencefalograma"] || "",
        psicotecnico: resultMap["Psicotécnico"] || "",
        audiometria: resultMap["Audiometria"] || "",
    };
}
export function mapVisual(
    dataValues: DataValue[]
): {
    agudezaSc: { right: string; left: string };
    agudezaCc: { right: string; left: string };
    visionCromatica: "normal" | "anormal";
    notasVision: string;
} {
    // Agudeza S/C
    const scR = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Agudeza S/C Derecho"
    )?.value as string;
    const scL = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Agudeza S/C Izquierdo"
    )?.value as string;

    // Agudeza C/C
    const ccR = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Agudeza C/C Derecho"
    )?.value as string;
    const ccL = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Agudeza C/C Izquierdo"
    )?.value as string;

    // Visión cromática: valor + observaciones
    const dvCrom = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Visión Cromática"
    );
    const cromRaw = (dvCrom?.value as string)?.toLowerCase();
    const visionCromatica =
        cromRaw === "normal" || cromRaw === "anormal" ? (cromRaw as any) : "normal";
    const notasVision = dvCrom?.observations ?? "";

    return {
        agudezaSc: { right: scR || "-", left: scL || "-" },
        agudezaCc: { right: ccR || "-", left: ccL || "-" },
        visionCromatica,
        notasVision,
    };
}

export function mapMedicalEvaluation(dataValues: DataValue[]): IMedicalEvaluation {
    const clinical = mapClinicalEvaluation(dataValues);
    const { agudezaSc, agudezaCc, visionCromatica, notasVision } = mapVisual(
        dataValues
    );
    const bucodental = mapBucodental(dataValues);
    const aspectoGeneral = dataValues.find(
        (dv) => dv.dataType.name === "Aspecto general" && typeof dv.value === "string"
    )?.value || "";

    const tiempoLibre = dataValues.find(
        (dv) => dv.dataType.name === "Tiempo libre" && typeof dv.value === "string"
    )?.value || "";

    const dvCabeza = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Cabeza y Cuello"
    );
    const dvCabezaObs = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Observaciones Cabeza y Cuello"
    );

    const cabezaCuello = {
        sinAlteraciones: toBool(dvCabeza?.value as string),
        observaciones: dvCabezaObs?.value as string || "",
    };
    const torax = mapTorax(dataValues);
    const examenFisico = mapPhysicalEvaluation(dataValues);
    const respiratorio = mapRespiratorio(dataValues);
    const circulatorio = mapCirculatorio(dataValues);
    const neurologico = mapNeurologico(dataValues);
    const gastrointestinal = mapGastrointestinal(dataValues);
    const genitourinario = mapGenitourinario(dataValues);
    const osteoarticular = mapOsteoarticular(dataValues);

    return {
        aspectoGeneral,
        tiempoLibre,
        examenClinico: clinical,
        examenFisico,
        agudezaSc,
        cabezaCuello,
        agudezaCc,
        bucodental,
        torax,
        visionCromatica,
        neurologico, osteoarticular,
        notasVision,
        gastrointestinal,
        respiratorio,
        genitourinario,
        circulatorio,
        piel: mapPiel(dataValues),
    };
}

export function mapGastrointestinal(dataValues: DataValue[]): Gastrointestinal {
    const dvSin = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Aparato Gastrointestinal"
    );
    const dvCic = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Cicatrices"
    );
    const dvHer = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Hernias"
    );
    const dvEvent = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Eventraciones"
    );
    const dvHemo = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Hemorroides"
    );
    return {
        sinAlteraciones: toBool(dvSin?.value as string),
        observaciones: dvSin?.observations as string || "",
        cicatrices: toBool(dvCic?.value as string),
        cicatricesObs: dvCic?.observations as string || "",
        hernias: toBool(dvHer?.value as string),
        herniasObs: dvHer?.observations as string || "",
        eventraciones: toBool(dvEvent?.value as string),
        eventracionesObs: dvEvent?.observations as string || "",
        hemorroides: toBool(dvHemo?.value as string),
        hemorroidesObs: dvHemo?.observations as string || "",
    };
}

export function mapGenitourinario(dataValues: DataValue[]): Genitourinario {
    const dvSin = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Aparato Genitourinario"
    );
    const dvVar = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Varicocele"
    );

    const dvFum = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "FUM"
    );

    const dvPartos = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Partos"
    );

    const dvCesarea = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Cesárea"
    );

    const dvEmbarazos = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Embarazos"
    );

    return {
        sinAlteraciones: toBool(dvSin?.value as string),
        observaciones: dvSin?.observations as string || "",
        varicocele: toBool(dvVar?.value as string),
        varicoceleObs: dvVar?.observations as string || "",
        fum: dvFum?.value as string || "",
        partos: dvPartos?.value as string || "",
        cesarea: dvCesarea?.value as string || "",
        embarazos: dvEmbarazos?.value as string || "",
    };
}

export function mapNeurologico(dataValues: DataValue[]): Neurologico {
    const dvSin = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Aparato Neurológico"
    );

    return {
        sinAlteraciones: toBool(dvSin?.value as string),
        observaciones: (dvSin?.observations as string) || "",
    };
}

export function mapCirculatorio(dataValues: DataValue[]): Circulatorio {
    const dvFrecuencia = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Frecuencia Cardíaca"
    );
    const dvTA = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "TA"
    );
    const dvSin = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Aparato Circulatorio"
    );
    const dvVar = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Várices"
    );

    const toBool = (val?: boolean | string): boolean => {
        if (typeof val === "boolean") return val;
        const s = (val ?? "").toString().toLowerCase();
        return s === "true" || s === "si";
    };

    return {
        frecuenciaCardiaca: dvFrecuencia?.value as string || "",
        presion: dvTA?.value as string || "",
        sinAlteraciones: toBool(dvSin?.value),
        observaciones: dvSin?.observations || "",
        varices: toBool(dvVar?.value),
        varicesObs: dvVar?.observations || "",
    };
}

export function mapClinicalEvaluation(dataValues: DataValue[]): ExamenClinico {
    const clinical: ExamenClinico = {

        talla: "",
        peso: "",
        imc: "",
        frecuenciaCardiaca: "",
        frecuenciaRespiratoria: "",
        perimetroAbdominal: "",
        presionDiastolica: "",
        presionSistolica: ""
    };

    const mapping: Record<string, keyof ExamenClinico> = {
        "Talla": "talla",
        "Peso": "peso",
        "IMC": "imc",
        "Perimetro Abdominal": "perimetroAbdominal",
        "Frecuencia Cardíaca": "frecuenciaCardiaca",
        "Frecuencia Respiratoria": "frecuenciaRespiratoria",
        "Presión Sistólica": "presionSistolica",
        "Presión Diastólica": "presionDiastolica"
    };

    dataValues.forEach((dv) => {
        if (typeof dv.value === "string") {
            const key = mapping[dv.dataType.name];
            if (key) {
                clinical[key] = dv.value;
            }
        }
    });

    return clinical;
}

export function mapRespiratorio(dataValues: DataValue[]): Respiratorio {
    const dvFrecuencia = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Frecuencia Respiratoria"
    );
    const dvOximetria = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_CLINICO" &&
            dv.dataType.name === "Oximetria"
    );
    // Ajustamos aquí: buscamos el BOOLEAN con name "Aparato Respiratorio"
    const dvSin = dataValues.find(
        dv =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Aparato Respiratorio"
    );

    return {
        frecuenciaRespiratoria: (dvFrecuencia?.value as string) || "",
        oximetria: (dvOximetria?.value as string) || "",
        sinAlteraciones: toBool(dvSin?.value),
        observaciones: dvSin?.observations || "",
    };
}

export function aspectoGeneralyTiempolibre(dataValues: DataValue[]): MedicalEvaluation {
    const data: MedicalEvaluation = {
        aspectoGeneral: "Bueno",
        tiempoLibre: "",

    };

    const mapping: Record<string, keyof MedicalEvaluation> = {
        "Aspecto general": "aspectoGeneral",
        "Tiempo libre": "tiempoLibre",
    };

    dataValues.forEach((dv) => {
        if (typeof dv.value === "string") {
            const key = mapping[dv.dataType.name];
            if (key) {
                if (key === "aspectoGeneral") {
                    // Only assign allowed values
                    if (dv.value === "Bueno" || dv.value === "Regular" || dv.value === "Malo") {
                        data[key] = dv.value;
                    }
                } else {
                    data[key] = dv.value;
                }
            }
        }
    });
    return data;
}

export function useInitializeMedicalEvaluation(dataValues: DataValue[] | undefined) {
    const dispatch = useDispatch<AppDispatch>();
    const medicalEvaluation = useSelector(
        (state: RootState) => state.preOccupational.formData.medicalEvaluation
    );

    useEffect(() => {
        if (dataValues && dataValues.length > 0) {
            const fullEvaluation = mapMedicalEvaluation(dataValues);
            // Actualizamos el estado con los valores mapeados
            dispatch(
                setFormData({
                    medicalEvaluation: {
                        ...medicalEvaluation,
                        ...fullEvaluation,
                    },
                })
            );
        }
    }, [dataValues, dispatch]);
}
export function mapBucodental(dataValues: DataValue[]): Bucodental {
    const dvSin = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Bucodental – Sin alteraciones"
    );
    const dvCaries = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Bucodental – Caries"
    );
    const dvFaltan = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Bucodental – Faltan piezas"
    );
    const dvObs = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Bucodental – Observaciones"
    );

    return {
        sinAlteraciones: toBool(dvSin?.value as string),
        caries: toBool(dvCaries?.value as string),
        faltanPiezas: toBool(dvFaltan?.value as string),
        observaciones: dvObs?.value as string || "",
    };
}

export function mapTorax(dataValues: DataValue[]): Torax {
    const dvDef = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Torax Deformaciones"
    );
    const dvCic = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Torax Cicatrices"
    );

    const toBool = (val?: boolean | string): boolean => {
        if (typeof val === "boolean") return val;
        const s = (val ?? "").toString().toLowerCase();
        return s === "true" || s === "si";
    };

    return {
        deformaciones: toBool(dvDef?.value) ? "si" : "no",
        deformacionesObs: dvDef?.observations ?? "",
        cicatrices: toBool(dvCic?.value) ? "si" : "no",
        cicatricesObs: dvCic?.observations ?? "",
    };
}

export function mapOsteoarticular(dataValues: DataValue[]): Osteoarticular {
    const dvMmss = dataValues.find(dv => dv.dataType.name === "MMSS Sin Alteraciones");
    const dvMmii = dataValues.find(dv => dv.dataType.name === "MMII Sin Alteraciones");
    const dvCol = dataValues.find(dv => dv.dataType.name === "Columna Sin Alteraciones");
    const dvAmp = dataValues.find(dv => dv.dataType.name === "Amputaciones");

    return {
        mmssSin: toBool(dvMmss?.value as string),
        mmssObs: dvMmss?.observations as string || "",
        mmiiSin: toBool(dvMmii?.value as string),
        mmiiObs: dvMmii?.observations as string || "",
        columnaSin: toBool(dvCol?.value as string),
        columnaObs: dvCol?.observations as string || "",
        amputaciones: toBool(dvAmp?.value as string),
        amputacionesObs: dvAmp?.observations as string || "",
    };
}