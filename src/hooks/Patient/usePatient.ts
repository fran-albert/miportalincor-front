import { getPatientById } from "@/api/Patient/get-patient-by-id.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth: boolean;
    id: number
}

export const usePatient = ({ auth, id }: Props) => {

    const { isLoading, isError, error, data: patient, isFetching } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => getPatientById(id),
        staleTime: 1000 * 60,
        enabled: auth && id !== undefined,
    });


    return {
        patient,
        error,
        isLoading,
        isError, isFetching,
    }

}