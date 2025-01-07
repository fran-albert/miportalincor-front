import { createBlodTestData } from "@/api/Blod-Test-Data/create-blod-test-data.action";
import { updateBlodTestData } from "@/api/Blod-Test-Data/update-blod-test-data.action";
import { BloodTestDataUpdateRequest } from "@/types/Blod-Test-Data/Blod-Test-Data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useBlodTestDataMutations = () => {
    const queryClient = useQueryClient();

    const addBlodTestDataMutation = useMutation({
        mutationFn: createBlodTestData,
        onSuccess: (blodTest, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['bloodTestsData'] });
            console.log("blodTest created", blodTest, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating blodTest", error, variables, context);
        },
    });

    const updateBlodTestMutation = useMutation({
        mutationFn: ({
            idStudy,
            bloodTestDataRequests,
        }: {
            idStudy: number;
            bloodTestDataRequests: BloodTestDataUpdateRequest[];
        }) =>
            updateBlodTestData(idStudy, bloodTestDataRequests),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bloodTestsData'] });
        },
        onError: (error) => {
            console.log("Error updating bloodTest", error);
        },
    });

    return { addBlodTestDataMutation, updateBlodTestMutation };
};
