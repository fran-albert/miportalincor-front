import { getTotalBlodTests } from "@/api/Blod-Test/get-total-blod-test.action";
import { getBlodTests } from "@/api/Blod-Test/get-all-blod-test.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    auth?: boolean;
}

export const useBlodTest = ({ auth = true }: Props) => {

    const { isLoading: isLoadingTotalBlodTests, isError: isErrorTotalBlodTests, error: errorTotalBlodTests, data: totalBlodTests = 0 } = useQuery({
        queryKey: ["totalBlodTests"],
        queryFn: () => getTotalBlodTests(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    const { isLoading, isError, error, data: blodTests = [], isFetching } = useQuery({
        queryKey: ['blodTests'],
        queryFn: () => getBlodTests(),
        staleTime: 1000 * 60,
        enabled: auth
    });

    return {
        isLoadingTotalBlodTests, isErrorTotalBlodTests, errorTotalBlodTests, totalBlodTests,
        isLoading, isError, error, blodTests, isFetching
    }

}