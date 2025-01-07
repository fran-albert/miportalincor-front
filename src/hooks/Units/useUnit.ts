
import { useQuery } from "@tanstack/react-query"
import { getAllUnits } from "@/api/Units/get-all-unit.action";

interface Props {
    auth?: boolean;
}

export const useUnit = ({ auth = true }: Props) => {

    const { isLoading: isLoadingUnits, isError: isErrorUnits, error: errorUnits, data: units = [] } = useQuery({
        queryKey: ["units"],
        queryFn: () => getAllUnits(),
        staleTime: 1000 * 60,
        enabled: auth
    });


    return {
        isLoadingUnits, isErrorUnits, errorUnits, units
    }

}