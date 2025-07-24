// src/hooks/Doctor/useDoctorWithSignatures.ts
import { fetchImageAsDataUrl } from "@/api/Study/Collaborator/get-proxy-url.action";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useQuery } from "@tanstack/react-query";

interface Params {
    auth?: boolean;
    id: number;
}

export const useDoctorWithSignatures = ({ id, auth = true }: Params) => {
    const {
        doctor,
        isLoading: loadingDoctor,
        isError: errorDoctor,
        error: doctorError,
    } = useDoctor({ id, auth });

    const firmaQuery = useQuery<string>({
        queryKey: ["doctor", id, "firma"],
        queryFn: async () => {
            if (!doctor?.firma) throw new Error("No hay URL de firma");
            return fetchImageAsDataUrl(doctor.firma);
        },
        enabled: auth && !!doctor?.firma,
        staleTime: 1000 * 60,
    });

    const selloQuery = useQuery<string>({
        queryKey: ["doctor", id, "sello"],
        queryFn: async () => {
            if (!doctor?.sello) throw new Error("No hay URL de sello");
            return fetchImageAsDataUrl(doctor.sello);
        },
        enabled: auth && !!doctor?.sello,
        staleTime: 1000 * 60,
    });

    return {
        doctor,
        firmaDataUrl: firmaQuery.data,
        selloDataUrl: selloQuery.data,
        isLoading: loadingDoctor || firmaQuery.isLoading || selloQuery.isLoading,
        isError: errorDoctor || firmaQuery.isError || selloQuery.isError,
        error: doctorError || firmaQuery.error || selloQuery.error,
    };
};
