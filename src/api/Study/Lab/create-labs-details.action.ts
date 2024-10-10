import axiosInstance from "@/services/axiosConfig";
import { LabRequest } from "@/types/Lab/Lab";
export const createLabsDetail = async (labs: LabRequest) => {
    try {
        const { data } = await axiosInstance.post<LabRequest>(`/LaboratoryDetail/create`, labs);
        return data;
    } catch (error: any) {
        // Lanzar el error de Axios correctamente para que sea capturado
        throw error || "Error desconocido";
    }
}
