import { getBloodTestData } from "@/api/Blod-Test-Data/get-blood-test-data.action";
import { useQuery } from "@tanstack/react-query"

// Query Keys Factory
export const bloodTestDataKeys = {
    all: ['bloodTestsData'] as const,
    lists: () => [...bloodTestDataKeys.all, 'list'] as const,
    list: (idStudies: string[]) => [...bloodTestDataKeys.lists(), idStudies] as const,
};

interface Props {
    auth?: boolean;
    idStudies: string[];
}

export const useBloodTestData = ({ auth = true, idStudies }: Props) => {

    const enabled = auth && Array.isArray(idStudies) && idStudies.length > 0;

    const { isLoading: isLoadingBloodTestsData, isError: isErrorBloodTestsData, error: errorBloodTestsData, data: bloodTestsData = [], isFetching: isFetchingBloodTestsData } = useQuery({
        queryKey: bloodTestDataKeys.list(idStudies),
        queryFn: () => getBloodTestData(idStudies),
        staleTime: 1000 * 60,
        enabled
    });
    return {
        isLoadingBloodTestsData, isErrorBloodTestsData, errorBloodTestsData, bloodTestsData, isFetchingBloodTestsData
    }

}