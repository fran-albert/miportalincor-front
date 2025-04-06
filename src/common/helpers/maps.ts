import { ExamenClinico, ExamResults, IMedicalEvaluation, setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { ConclusionOptions } from "@/store/Pre-Occupational/preOccupationalSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useEffect } from "react";


export interface ExamenFisicoItem {
    selected: "" | "si" | "no";
    observaciones: string;
}


interface MedicalEvaluation {
    aspectoGeneral: string,
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
export function mapConclusionText(dataValues: DataValue[]): string {
    const conclusionData = dataValues.find(
        (dv) =>
            dv.dataType.name === "Conclusion" &&
            typeof dv.value === "string"
    );
    return conclusionData ? conclusionData.value : "";
}

export function mapConclusionOptions(dataValues: DataValue[]): ConclusionOptions {
    const options: ConclusionOptions = {
        "apto-001": false,
        "apto-002": false,
        "apto-003": false,
        "no-apto": false,
        aplazado: false,
    };

    const mapping: Record<string, keyof ConclusionOptions> = {
        "Apto para desempeñar el cargo sin patología aparente": "apto-001",
        "Apto para desempeñar el cargo con patología que no limite lo laboral": "apto-002",
        "Apto con restricciones": "apto-003",
        "No apto": "no-apto",
        "Aplazado": "aplazado",
    };

    dataValues.forEach((dv) => {
        if (typeof dv.value === "boolean") {
            const key = mapping[dv.dataType.name];
            if (key) {
                options[key] = dv.value;
            }
        }
    });

    return options;
}
export function mapConclusionData(dataValues: DataValue[]): {
    conclusion: string;
    conclusionOptions: ConclusionOptions;
} {
    return {
        conclusion: mapConclusionText(dataValues),
        conclusionOptions: mapConclusionOptions(dataValues),
    };
}
export function mapExamResults(dataValues: DataValue[]): ExamResults {
    const resultMap = dataValues.reduce<Record<string, string>>((acc, dv) => {
        if (typeof dv.value === "string") {
            acc[dv.dataType.name] = dv.value;
        }
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


export function mapMedicalEvaluation(dataValues: DataValue[]): IMedicalEvaluation {
    const clinical = mapClinicalEvaluation(dataValues);

    const aspectoGeneral = dataValues.find(
        (dv) => dv.dataType.name === "Aspecto general" && typeof dv.value === "string"
    )?.value || "";

    const tiempoLibre = dataValues.find(
        (dv) => dv.dataType.name === "Tiempo libre" && typeof dv.value === "string"
    )?.value || "";

    const examenFisico = mapPhysicalEvaluation(dataValues);

    return {
        aspectoGeneral,
        tiempoLibre,
        examenClinico: clinical,
        examenFisico,
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

export function aspectoGeneralyTiempolibre(dataValues: DataValue[]): MedicalEvaluation {
    const data: MedicalEvaluation = {
        aspectoGeneral: "",
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
                data[key] = dv.value;
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
