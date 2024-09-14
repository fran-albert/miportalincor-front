import { getSpecialities } from "@/api/Speciality/get-all-specialities.action";
import { getTotalSpecialities } from "@/api/Speciality/get-total-specialities.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
}

export const useSpeciality = ({ auth = true }: Props) => {

    const { isLoading: isLoadingTotalSpecialities, isError: isErrorTotalSpecialities, error: errorTotalSpecialities, data: totalSpecialities = 0 } = useQuery({
        queryKey: ["totalSpecialities"],
        queryFn: () => getTotalSpecialities(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    const { isLoading, isError, error, data: specialities = [], isFetching } = useQuery({
        queryKey: ['specialities'],
        queryFn: () => getSpecialities(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    return {
        isLoadingTotalSpecialities, isErrorTotalSpecialities, errorTotalSpecialities, totalSpecialities,
        isLoading, isError, error, specialities, isFetching
    }

}