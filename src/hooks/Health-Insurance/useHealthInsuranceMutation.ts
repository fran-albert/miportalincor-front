import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHealthInsurance } from "@/api/Health-Insurance/create-health-insurance.action";
import { updateHealthInsurance } from "@/api/Health-Insurance/update-health-insurance.action";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { deleteHealthInsurance } from "@/api/Health-Insurance/delete-health-insurance.action";

export const useHealthInsuranceMutations = () => {
    const queryClient = useQueryClient();

    const addHealthInsuranceMutation = useMutation({
        mutationFn: createHealthInsurance,
        onSuccess: (healthInsurance, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['healthInsurances'] });
            console.log("healthInsurance created", healthInsurance, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating Health Insurance", error, variables, context);
        },
    });

    const updateHealthInsuranceMutation = useMutation({
        mutationFn: ({ id, healthInsurance }: { id: number; healthInsurance: HealthInsurance }) => updateHealthInsurance(id, healthInsurance),
        onSuccess: (healthInsurance, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['healthInsurances'] });
            console.log("Patient updated", healthInsurance, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating patient", error, variables, context);
        },
    });

    const deleteHealthInsuranceMutation = useMutation({
        mutationFn: (id: number) => deleteHealthInsurance(id),
        onSuccess: (healthInsurance, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['healthInsurances'] })
            console.log("healthInsurances deleted", healthInsurance, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting healthInsurances", error, variables, context);
        },
    });

    return { addHealthInsuranceMutation, updateHealthInsuranceMutation, deleteHealthInsuranceMutation };
};
