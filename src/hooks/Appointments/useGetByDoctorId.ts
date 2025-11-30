import { getAllAppointmentsByDoctor } from "@/api/Appointments/get-all-by-doctor";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    id: number
}

export const useGetByDoctorId = ({ auth, id }: Props) => {

    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['appointments', id],
        queryFn: () => getAllAppointmentsByDoctor(id as number),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined,
    });

    return {
        data,
        error,
        isLoading,
        isError, isFetching,
    }

}