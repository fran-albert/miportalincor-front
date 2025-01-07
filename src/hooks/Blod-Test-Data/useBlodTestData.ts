import { getBloodTestData } from "@/api/Blod-Test-Data/get-blood-test-data.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
    idStudies: number[];
}

export const useBloodTestData = ({ auth = true, idStudies }: Props) => {

    const { isLoading: isLoadingBloodTestsData, isError: isErrorBloodTestsData, error: errorBloodTestsData, data: bloodTestsData = [], isFetching: isFetchingBloodTestsData } = useQuery({
        queryKey: ['bloodTestsData', idStudies],
        queryFn: () => getBloodTestData(idStudies),
        staleTime: 1000 * 60,
        enabled: auth && !!idStudies
    });

    return {
        isLoadingBloodTestsData, isErrorBloodTestsData, errorBloodTestsData, bloodTestsData, isFetchingBloodTestsData
    }

}