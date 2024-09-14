import { createSpeciality } from "@/api/Speciality/create-speciality.action";
import { deleteSpeciality } from "@/api/Speciality/delete-speciality.action";
import { updateSpeciality } from "@/api/Speciality/update-patient.action";
import { Speciality } from "@/types/Speciality/Speciality";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useSpecialityMutations = () => {
    const queryClient = useQueryClient();

    const addSpecialityMutation = useMutation({
        mutationFn: createSpeciality,
        onSuccess: (speciality, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['specialities'] });
            console.log("speciality created", speciality, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating speciality", error, variables, context);
        },
    });

    const updateSpecialityMutation = useMutation({
        mutationFn: ({ id, speciality }: { id: number; speciality: Speciality }) => updateSpeciality(id, speciality),
        onSuccess: (speciality, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['specialities'] });
            console.log("Patient updated", speciality, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating patient", error, variables, context);
        },
    });

    const deleteSpecialityMutation = useMutation({
        mutationFn: (id: number) => deleteSpeciality(id),
        onSuccess: (speciality, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['specialities'] })
            console.log("healthInsurances deleted", speciality, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting healthInsurances", error, variables, context);
        },
    });

    return { addSpecialityMutation, updateSpecialityMutation, deleteSpecialityMutation };
};
