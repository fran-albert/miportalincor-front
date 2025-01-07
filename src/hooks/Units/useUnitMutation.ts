import { createUnit } from "@/api/Units/create-unit.action";
import { deleteUnit } from "@/api/Units/delete-unit.action";
import { updateUnit } from "@/api/Units/update-unit.action";
import { Unit } from "@/types/Unit/Unit";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useBlodTestMutations = () => {
    const queryClient = useQueryClient();

    const addUnitMutation = useMutation({
        mutationFn: createUnit,
        onSuccess: (unit, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['units'] });
            console.log("unit created", unit, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating blodTest", error, variables, context);
        },
    });

    const updateUnitMutation = useMutation({
        mutationFn: ({ id, unit }: { id: number; unit: Unit }) => updateUnit(id, unit),
        onSuccess: (unit, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['units'] });
            console.log("unit updated", unit, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating blodTest", error, variables, context);
        },
    });

    const deleteUnitMutation = useMutation({
        mutationFn: (id: number) => deleteUnit(id),
        onSuccess: (unit, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['units'] })
            console.log("unit deleted", unit, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting blodTest", error, variables, context);
        },
    });

    return { addUnitMutation, updateUnitMutation, deleteUnitMutation };
};
