import { getPatientById } from "@/api/Patient/get-patient-by-id.action";
import { useQueryClient } from "@tanstack/react-query";

export const usePrefetchPatient = () => {

    const queryClient = useQueryClient();

    const preFetchPatient = async (id: string) => {

        await queryClient.prefetchQuery({
            queryKey: ['patient', { id }],
            queryFn: () => getPatientById(id),
        })
    };

    return preFetchPatient;
}