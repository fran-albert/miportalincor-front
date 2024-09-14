import { getDoctorById } from "@/api/Doctor/get-doctor-by-id.action";
import { useQueryClient } from "@tanstack/react-query";

export const usePrefetchDoctor = () => {

    const queryClient = useQueryClient();

    const preFetchDoctor = async (id: number) => {

        await queryClient.prefetchQuery({
            queryKey: ['doctor', { id }],
            queryFn: () => getDoctorById(id),
        })
    };

    return preFetchDoctor;
}