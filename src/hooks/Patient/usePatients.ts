import { searchPatients } from "@/api/Patient/search-patients.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
    auth: boolean;
    fetchPatients: boolean;
    search: string;
}

export const usePatients = ({ auth, fetchPatients, search }: Props) => {
    const { isLoading, isError, error, data, isFetching } = useQuery({
        queryKey: ['patients', search],
        queryFn: () => searchPatients({ search }),
        staleTime: 1000 * 60,
        enabled: auth && fetchPatients,
    });

    return {
        patients: data?.data ?? [],
        error,
        isLoading,
        isError,
        isFetching,
    };
};
