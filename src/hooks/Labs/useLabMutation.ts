import { createLabsDetail } from "@/api/Study/Lab/create-labs-details.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLabMutations = () => {
  const queryClient = useQueryClient();

  const addLabMutation = useMutation({
    mutationFn: createLabsDetail,
    onSuccess: (labs, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['labsDetail'] });
      console.log("labs created", labs, variables, context);
    },

    onError: (error: any, variables, context) => {
      console.log("Error details:", error.response?.data || error.message, variables, context);
    },
  });

//   const updatePatientMutation = useMutation({
//     mutationFn: ({ id, patient }: { id: number; patient: Patient }) => updatePatient(id, patient),
//     onSuccess: (patient, variables, context) => {
//       queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
//       console.log("Patient updated", patient, variables, context);
//     },
//     onError: (error, variables, context) => {
//       console.log("Error updating patient", error, variables, context);
//     },
//   });

//   const deletePatientMutation = useMutation({
//     mutationFn: (id: number) => deletePatient(id),
//     onSuccess: (patient, variables, context) => {
//       queryClient.invalidateQueries({ queryKey: ['patients'] })
//       console.log("Patient deleted", patient, variables, context);
//     },
//     onError: (error, variables, context) => {
//       console.log("Error deleting patient", error, variables, context);
//     },
//   });

  return { addLabMutation };
};
