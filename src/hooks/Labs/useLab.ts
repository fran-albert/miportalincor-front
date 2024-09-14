import { getLabsDetail } from "@/api/Study/Lab/get-labs-detailts.action";
import { useQuery } from "@tanstack/react-query";

interface Props {
    fetchLabsDetails?: boolean;
    idStudy: number[];
}

export const useLab = ({ fetchLabsDetails = false, idStudy }: Props) => {

    const {
        isLoading: isLoadingLabsDetails,
        isError: isErrorLabsDetails,
        error: errorLabsDetails,
        data: labsDetails
    } = useQuery({
        queryKey: ["labsDetail", idStudy],
        queryFn: () => getLabsDetail(idStudy),
        staleTime: 1000 * 60,
        enabled: !!idStudy.length && fetchLabsDetails
    });

    return {
        isLoadingLabsDetails,
        isErrorLabsDetails,
        errorLabsDetails,
        labsDetails
    }
}
