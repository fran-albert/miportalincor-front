import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProgram } from "@/api/Program/create-program.action";
import { updateProgram } from "@/api/Program/update-program.action";
import { deleteProgram } from "@/api/Program/delete-program.action";
import { CreateProgramDto, UpdateProgramDto } from "@/types/Program/Program";

export const useProgramMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dto: CreateProgramDto) => createProgram(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProgramDto }) =>
      updateProgram(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });

  return {
    createProgramMutation: createMutation,
    updateProgramMutation: updateMutation,
    deleteProgramMutation: deleteMutation,
  };
};
