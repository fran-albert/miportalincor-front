import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProgramMember } from "@/api/Program/add-member.action";
import { removeProgramMember } from "@/api/Program/remove-member.action";
import { AddMemberDto } from "@/types/Program/ProgramMember";

export const useMemberMutations = (programId: string) => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (dto: AddMemberDto) => addProgramMember(programId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["program-members", programId],
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) =>
      removeProgramMember(programId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["program-members", programId],
      });
    },
  });

  return {
    addMemberMutation: addMutation,
    removeMemberMutation: removeMutation,
  };
};
