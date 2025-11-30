import { getDoctorAvailabilityById } from "@/api/Doctor-Availability/get-by-doctor-id";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    id: number
}

export const useDoctorAvalaibility = ({ auth, id }: Props) => {

    const { isLoading, isError, error, data: doctor, isFetching } = useQuery({
        queryKey: ['doctor-avalaibilty', id],
        queryFn: () => getDoctorAvailabilityById(id as number),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined,
    });

    return {
        doctor,
        error,
        isLoading,
        isError, isFetching,
    }

}