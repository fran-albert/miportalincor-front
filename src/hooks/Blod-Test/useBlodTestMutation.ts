import { createBlodTest } from "@/api/Blod-Test/create-blod-test.action";
import { deleteBlodTest } from "@/api/Blod-Test/delete-blod-test.action";
import { updateBlodTest } from "@/api/Blod-Test/update-blod-test.action";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useBlodTestMutations = () => {
    const queryClient = useQueryClient();

    const addBlodTestMutation = useMutation({
        mutationFn: createBlodTest,
        onSuccess: (blodTest, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['blodTests'] });
            console.log("blodTest created", blodTest, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating blodTest", error, variables, context);
        },
    });

    const updateBlodTestMutation = useMutation({
        mutationFn: ({ id, blodTest }: { id: number; blodTest: BloodTest }) => updateBlodTest(id, blodTest),
        onSuccess: (blodTest, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['blodTests'] });
            console.log("blodTest updated", blodTest, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating blodTest", error, variables, context);
        },
    });

    const deleteBlodTestMutation = useMutation({
        mutationFn: (id: number) => deleteBlodTest(id),
        onSuccess: (blodTest, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['blodTests'] })
            console.log("blodTest deleted", blodTest, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting blodTest", error, variables, context);
        },
    });

    return { addBlodTestMutation, updateBlodTestMutation, deleteBlodTestMutation };
};
