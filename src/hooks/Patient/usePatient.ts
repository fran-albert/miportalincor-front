import { getPatientById } from "@/api/Patient/get-patient-by-id.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    id: number;
    enabled?: boolean;
}

export const usePatient = ({ auth, id, enabled = true }: Props) => {

    const { isLoading, isError, error, data: patient, isFetching } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => getPatientById(id),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined && enabled,
    });


    return {
        patient,
        error,
        isLoading,
        isError, isFetching,
    }

}