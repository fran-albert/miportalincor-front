import { getAllApointmentsByMonthYear } from "@/api/Appointments/get-all-by-month-year";
import { useQuery } from "@tanstack/react-query"

interface Props {
    month: string
    year: string
}

export const useGetByMonthYear = ({ month, year }: Props) => {

    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['appointments', { year, month }],
        queryFn: () => getAllApointmentsByMonthYear(year, month),
        staleTime: 1000 * 60,
        enabled: !!month && !!year,
    });

    return {
        data,
        error,
        isLoading,
        isError, isFetching,
    }

}