import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDoctorAvailability } from "@/api/Doctor-Availability/create-doctor-availability";
import { deleteDoctorAvailability } from "@/api/Doctor-Availability/delete-doctor-availability";
import { updateDoctorAvailability } from "@/api/Doctor-Availability/update-doctor-availability";
import { CreateDoctorAvailabilityDto } from "@/types/Doctor-Availability/Doctor-Availability";

export const useDoctorAvailabilityMutations = () => {
    const queryClient = useQueryClient();

    const addDoctorAvailabilityMutations = useMutation({
        mutationFn: createDoctorAvailability,
        onSuccess: (doctor, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["doctor-availability"] });
            console.log("OK", doctor, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    // OBTENER EL ID DEL DOCTOR DE CONTEXTO
    const updateDoctorAvailabilityMutations = useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: Omit<CreateDoctorAvailabilityDto, 'doctorId'> }) =>
            updateDoctorAvailability(id, dto),
        onSuccess: (doctor, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["doctor-availability", variables.id] });
            console.log("OK", doctor, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error", error, variables, context);
        },
    });

    const deleteDoctorAvailabilityMutations = useMutation({
        mutationFn: (id: number) => deleteDoctorAvailability(id),
        onSuccess: (doctor, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["doctor-availability"] });
            console.log("ok", doctor, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting patient", error, variables, context);
        },
    });

    return {
        addDoctorAvailabilityMutations,
        deleteDoctorAvailabilityMutations,
        updateDoctorAvailabilityMutations
    };
};
