import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDoctorAbsence } from "@/api/DoctorAbsence/create.action";
import { deleteDoctorAbsence } from "@/api/DoctorAbsence/delete.action";
import { CreateDoctorAbsenceDto } from "@/types/Doctor-Absence/Doctor-Absence";

export const useDoctorAbsenceMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dto: CreateDoctorAbsenceDto) => createDoctorAbsence(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctorAbsences', variables.doctorId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number; doctorId: number }) => deleteDoctorAbsence(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctorAbsences', variables.doctorId] });
    },
  });

  return {
    createAbsence: createMutation,
    deleteAbsence: deleteMutation,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
