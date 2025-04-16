import { DataValue } from "@/types/Data-Value/Data-Value";

// Filtro de exámenes: define los campos que deseas extraer.
export const examFilter = [
    { id: "clinico", name: "Clínico" },
    { id: "electrocardiograma-result", name: "Electrocardiograma" },
    { id: "laboratorio", name: "Laboratorio básico ley" },
    { id: "rx-torax", name: "RX Torax Frente" },
    { id: "electroencefalograma", name: "Electroencefalograma" },
    { id: "psicotecnico", name: "Psicotécnico" },
    { id: "audiometria", name: "Audiometria" },
];

export interface ExamResults {
    [key: string]: string;
}

// Función para normalizar cadenas: quita acentos, tildes y convierte a minúsculas.
const normalize = (str: string): string =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Función que mapea el array de DataValues a un objeto con los examResults filtrados.
export const mapExamResults = (dataValues: DataValue[]): ExamResults => {
    const results: ExamResults = {};

    examFilter.forEach(({ id, name }) => {
        const found = dataValues.find(
            (dv) => normalize(dv.dataType.name) === normalize(name)
        );
        results[id] = found ? String(found.value) : "";
    });

    return results;
};
