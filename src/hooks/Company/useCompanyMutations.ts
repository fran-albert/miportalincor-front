import { updateBlodTest } from "@/api/Blod-Test/update-blod-test.action";
import { createCompany } from "@/api/Company/create-company.action";
import { deleteCompany } from "@/api/Company/delete-company.action";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useCompanyMutations = () => {
    const queryClient = useQueryClient();

    const addCompanyMutations = useMutation({
        mutationFn: createCompany,
        onSuccess: (company, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            console.log("company created", company, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating blodTest", error, variables, context);
        },
    });

    const updateCompanyMutations = useMutation({
        mutationFn: ({ id, blodTest }: { id: number; blodTest: BloodTest }) => updateBlodTest(id, blodTest),
        onSuccess: (company, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['companys'] });
            console.log("company updated", company, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating blodTest", error, variables, context);
        },
    });

    const deleteCompanyMutations = useMutation({
        mutationFn: (id: number) => deleteCompany(id),
        onSuccess: (company, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['company'] })
            console.log("blodTest deleted", company, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting blodTest", error, variables, context);
        },
    });

    return { addCompanyMutations, updateCompanyMutations, deleteCompanyMutations };
};
