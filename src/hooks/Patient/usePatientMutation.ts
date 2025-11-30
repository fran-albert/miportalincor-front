import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPatient } from "@/api/Patient/create-patient.action";
import { updatePatient } from "@/api/Patient/update-patient.action";
import { deletePatient } from "@/api/Patient/delete-patient.action";
import { Patient } from "@/types/Patient/Patient";
import { UpdatePatientDto } from "@/types/Patient/UpdatePatient.dto";

export const usePatientMutations = () => {
  const queryClient = useQueryClient();

  const addPatientMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: (patient, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      console.log("Patient created", patient, variables, context);
    },

    onError: (error: unknown, variables, context) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const responseData = (error as { response?: { data?: unknown } }).response?.data;
      console.log("Error details:", responseData || errorMessage, variables, context);
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, patient }: { id: string; patient: UpdatePatientDto | Patient }) => updatePatient(id, patient as UpdatePatientDto),
    onSuccess: (patient, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      console.log("Patient updated", patient, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error updating patient", error, variables, context);
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: (patient, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      console.log("Patient deleted", patient, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error deleting patient", error, variables, context);
    },
  });

  return { addPatientMutation, updatePatientMutation, deletePatientMutation };
};
