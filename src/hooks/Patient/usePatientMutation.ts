import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPatient } from "@/api/Patient/create-patient.action";
import { updatePatient } from "@/api/Patient/update-patient.action";
import { deletePatient } from "@/api/Patient/delete-patient.action";
import { Patient } from "@/types/Patient/Patient";

export const usePatientMutations = () => {
  const queryClient = useQueryClient();

  const addPatientMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: (patient, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      console.log("Patient created", patient, variables, context);
    },

    onError: (error: any, variables, context) => {
      console.log("Error details:", error.response?.data || error.message, variables, context);
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, patient }: { id: number; patient: Patient }) => updatePatient(id, patient),
    onSuccess: (patient, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      console.log("Patient updated", patient, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error updating patient", error, variables, context);
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: (id: number) => deletePatient(id),
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
