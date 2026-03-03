import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProgramActivity } from "@/api/Program/create-activity.action";
import { updateProgramActivity } from "@/api/Program/update-activity.action";
import { deleteProgramActivity } from "@/api/Program/delete-activity.action";
import {
  CreateActivityDto,
  UpdateActivityDto,
} from "@/types/Program/ProgramActivity";

export const useActivityMutations = (programId: string) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dto: CreateActivityDto) =>
      createProgramActivity(programId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["program-activities", programId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      activityId,
      dto,
    }: {
      activityId: string;
      dto: UpdateActivityDto;
    }) => updateProgramActivity(programId, activityId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["program-activities", programId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (activityId: string) =>
      deleteProgramActivity(programId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["program-activities", programId],
      });
    },
  });

  return {
    createActivityMutation: createMutation,
    updateActivityMutation: updateMutation,
    deleteActivityMutation: deleteMutation,
  };
};
