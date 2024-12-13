import { getAllStudyType } from "@/api/Study-Type/get-all-study-type.action";
import { useQuery } from "@tanstack/react-query"

interface Props {
    studyTypeAuth?: boolean;
}

export const useStudyType = ({ studyTypeAuth = false, }: Props) => {

    const { isLoading: isLoadingStudyType, isError: isErrorStudyType, error: errorStudyType, data: StudyType } = useQuery({
        queryKey: ["studyTypes"],
        queryFn: () => getAllStudyType(),
        staleTime: 1000 * 60,
        enabled: studyTypeAuth
    });


    return {
        isLoadingStudyType, isErrorStudyType, errorStudyType, StudyType
    }

}

