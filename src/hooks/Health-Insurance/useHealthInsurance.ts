import { getHealthInsurances } from "@/api/Health-Insurance/get-all-health-insurances.action";
import { getTotalHealthInsurances } from "@/api/Health-Insurance/get-total-health-insurances.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
}

export const useHealthInsurance = ({ auth = true }: Props) => {

    const { isLoading: isLoadingTotalHealthInsurances, isError: isErrorTotalHealthInsurances, error: errorTotalHealthInsurances, data: totalHealthInsurances = 0 } = useQuery({
        queryKey: ["totalHealthInsurances"],
        queryFn: () => getTotalHealthInsurances(),
        staleTime: 1000 * 60,
        enabled: auth
    });


    const { isLoading, isError, error, data: healthInsurances = [], isFetching } = useQuery({
        queryKey: ['healthInsurances'],
        queryFn: () => getHealthInsurances(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    return {
        isLoadingTotalHealthInsurances, isErrorTotalHealthInsurances, errorTotalHealthInsurances, totalHealthInsurances,
        isLoading, isError, error, healthInsurances, isFetching
    }

}