import axiosInstance from "@/services/axiosConfig";
import { Lab } from "@/types/Lab/Lab";

export const createLabsDetail = async (labs: Lab) => {
    try {
        const { data } = await axiosInstance.post<Lab>(`/LaboratoryDetail/create`, labs);
        return data;
    } catch (error: any) {
        // Lanzar el error de Axios correctamente para que sea capturado
        throw error || "Error desconocido";
    }
}
