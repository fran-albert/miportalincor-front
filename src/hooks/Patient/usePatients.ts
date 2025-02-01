import { getPatients } from "@/api/Patient/get-all-patients.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
    auth: boolean;
    fetchPatients: boolean;
    search: string;
}

export const usePatients = ({ auth, fetchPatients, search }: Props) => {
    const { isLoading, isError, error, data: patients = [], isFetching } = useQuery({
        queryKey: ['patients', search],
        queryFn: () => getPatients(search),
        staleTime: 1000 * 60,
        enabled: auth && fetchPatients,
    });

    return {
        patients,
        error,
        isLoading,
        isError,
        isFetching,
    };
};
