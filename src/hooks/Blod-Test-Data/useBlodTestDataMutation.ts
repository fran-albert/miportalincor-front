import { createBlodTestData } from "@/api/Blod-Test-Data/create-blod-test-data.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useBlodTestDataMutations = () => {
    const queryClient = useQueryClient();

    const addBlodTestDataMutation = useMutation({
        mutationFn: createBlodTestData,
        onSuccess: (blodTest, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['blodTestsData'] });
            console.log("blodTest created", blodTest, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating blodTest", error, variables, context);
        },
    });

    // const updateBlodTestMutation = useMutation({
    //     mutationFn: ({ id, blodTest }: { id: number; blodTest: BloodTest }) => updateBlodTest(id, blodTest),
    //     onSuccess: (blodTest, variables, context) => {
    //         queryClient.invalidateQueries({ queryKey: ['blodTests'] });
    //         console.log("blodTest updated", blodTest, variables, context);
    //     },
    //     onError: (error, variables, context) => {
    //         console.log("Error updating blodTest", error, variables, context);
    //     },
    // });

    // const deleteBlodTestMutation = useMutation({
    //     mutationFn: (id: number) => deleteBlodTest(id),
    //     onSuccess: (blodTest, variables, context) => {
    //         queryClient.invalidateQueries({ queryKey: ['blodTests'] })
    //         console.log("blodTest deleted", blodTest, variables, context);
    //     },
    //     onError: (error, variables, context) => {
    //         console.log("Error deleting blodTest", error, variables, context);
    //     },
    // });

    return { addBlodTestDataMutation };
};
