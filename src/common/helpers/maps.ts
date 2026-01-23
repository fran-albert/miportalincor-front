import { Circulatorio, ExamenClinico, Gastrointestinal, Genitourinario, IMedicalEvaluation, Neurologico, Osteoarticular, Respiratorio, resetForm, setFormData, Torax } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useEffect } from "react";
import { ExamResults } from "./examsResults.maps";
import { Piel } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/PielSection";
import { Bucodental } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/BucodentalSection";
import { parseBoolean } from "./helpers";


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
            const isTrue = parseBoolean(dv.value);
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
        normocoloreada: parseBoolean(dvNormo?.value) ? "si" : "no",
        tatuajes: parseBoolean(dvTatuajes?.value) ? "si" : "no",
        observaciones: dvNormo?.observations ?? "",
    };
}
export function mapConclusionText(dataValues: DataValue[]): string {
    const conclusionData = dataValues.find(
        (dv) =>
            dv.dataType.name === "Conclusion" &&
            typeof dv.value === "string"
    );
    return conclusionData ? String(conclusionData.value) : "";
}
export function mapRecomendacionesText(dataValues: DataValue[]): string {
    const recomendacionesData = dataValues.find(
        (dv) =>
            dv.dataType.name === "Recomendaciones" &&
            typeof dv.value === "string"
    );
    return recomendacionesData ? String(recomendacionesData.value) : "";
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
        agudezaSc: { right: scR || "", left: scL || "" },
        agudezaCc: { right: ccR || "", left: ccL || "" },
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
    const aspectoGeneralData = dataValues.find(
        (dv) => dv.dataType.name === "Aspecto general" && typeof dv.value === "string"
    );
    const aspectoGeneral = aspectoGeneralData ? String(aspectoGeneralData.value) : "";

    const tiempoLibreData = dataValues.find(
        (dv) => dv.dataType.name === "Tiempo libre" && typeof dv.value === "string"
    );
    const tiempoLibre = tiempoLibreData ? String(tiempoLibreData.value) : "";

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
        sinAlteraciones: parseBoolean(dvCabeza?.value),
        observaciones: (dvCabezaObs?.value as string) || "",
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
        sinAlteraciones: parseBoolean(dvSin?.value),
        observaciones: (dvSin?.observations as string) || "",
        cicatrices: parseBoolean(dvCic?.value),
        cicatricesObs: (dvCic?.observations as string) || "",
        hernias: parseBoolean(dvHer?.value),
        herniasObs: (dvHer?.observations as string) || "",
        eventraciones: parseBoolean(dvEvent?.value),
        eventracionesObs: (dvEvent?.observations as string) || "",
        hemorroides: parseBoolean(dvHemo?.value),
        hemorroidesObs: (dvHemo?.observations as string) || "",
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
        sinAlteraciones: parseBoolean(dvSin?.value),
        observaciones: (dvSin?.observations as string) || "",
        varicocele: parseBoolean(dvVar?.value),
        varicoceleObs: (dvVar?.observations as string) || "",
        fum: (dvFum?.value as string) || "",
        partos: (dvPartos?.value as string) || "",
        cesarea: (dvCesarea?.value as string) || "",
        embarazos: (dvEmbarazos?.value as string) || "",
    };
}

export function mapNeurologico(dataValues: DataValue[]): Neurologico {
    const dvSin = dataValues.find(
        (dv) =>
            dv.dataType.category === "EXAMEN_FISICO" &&
            dv.dataType.name === "Aparato Neurológico"
    );

    return {
        sinAlteraciones: parseBoolean(dvSin?.value),
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

    return {
        frecuenciaCardiaca: (dvFrecuencia?.value as string) || "",
        presion: (dvTA?.value as string) || "",
        sinAlteraciones: parseBoolean(dvSin?.value),
        observaciones: dvSin?.observations || "",
        varices: parseBoolean(dvVar?.value),
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
        sinAlteraciones: parseBoolean(dvSin?.value),
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

    useEffect(() => {
        // SIEMPRE resetear primero para limpiar datos del paciente anterior
        dispatch(resetForm());

        if (dataValues && dataValues.length > 0) {
            const fullEvaluation = mapMedicalEvaluation(dataValues);
            // Cargamos solo los datos del paciente actual (sin mezclar con anteriores)
            dispatch(
                setFormData({
                    medicalEvaluation: fullEvaluation,
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
        sinAlteraciones: parseBoolean(dvSin?.value),
        caries: parseBoolean(dvCaries?.value),
        faltanPiezas: parseBoolean(dvFaltan?.value),
        observaciones: (dvObs?.value as string) || "",
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

    return {
        deformaciones: parseBoolean(dvDef?.value) ? "si" : "no",
        deformacionesObs: dvDef?.observations ?? "",
        cicatrices: parseBoolean(dvCic?.value) ? "si" : "no",
        cicatricesObs: dvCic?.observations ?? "",
    };
}

export function mapOsteoarticular(dataValues: DataValue[]): Osteoarticular {
    const dvMmss = dataValues.find(dv => dv.dataType.name === "MMSS Sin Alteraciones");
    const dvMmii = dataValues.find(dv => dv.dataType.name === "MMII Sin Alteraciones");
    const dvCol = dataValues.find(dv => dv.dataType.name === "Columna Sin Alteraciones");
    const dvAmp = dataValues.find(dv => dv.dataType.name === "Amputaciones");

    return {
        mmssSin: parseBoolean(dvMmss?.value),
        mmssObs: (dvMmss?.observations as string) || "",
        mmiiSin: parseBoolean(dvMmii?.value),
        mmiiObs: (dvMmii?.observations as string) || "",
        columnaSin: parseBoolean(dvCol?.value),
        columnaObs: (dvCol?.observations as string) || "",
        amputaciones: parseBoolean(dvAmp?.value),
        amputacionesObs: (dvAmp?.observations as string) || "",
    };
}

export function mapOccupationalHistory(dataValues: DataValue[]): { id: string; description: string }[] {
    const antecedentes = dataValues.filter(
        (item) =>
            item.dataType.name === "Antecedentes ocupacionales" &&
            item.dataType.category === "ANTECEDENTES"
    );

    return antecedentes.map((item) => ({
        id: item.id.toString(),
        description: String(item.value ?? ""),
    }));
}