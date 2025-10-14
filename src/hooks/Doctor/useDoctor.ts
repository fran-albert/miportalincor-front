import { getDoctorById } from "@/api/Doctor/get-doctor-by-id.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    id: number;
    enabled?: boolean;
}

export const useDoctor = ({ auth, id, enabled = true }: Props) => {

    const { isLoading, isError, error, data: doctor, isFetching } = useQuery({
        queryKey: ['doctor', id],
        queryFn: () => getDoctorById(id as number),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined && enabled,
    });

    return {
        doctor,
        error,
        isLoading,
        isError, isFetching,
    }

}