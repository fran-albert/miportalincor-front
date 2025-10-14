import { getAllAppointmentsByDate } from "@/api/Appointments/get-all-by-date";
import { useQuery } from "@tanstack/react-query"

interface Props {
    date: string
}

export const useGetByDate = ({ date }: Props) => {

    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['appointments', date],
        queryFn: () => getAllAppointmentsByDate(date),
        staleTime: 1000 * 60,
        enabled: !!date,
    });

    return {
        data,
        error,
        isLoading,
        isError, isFetching,
    }

}