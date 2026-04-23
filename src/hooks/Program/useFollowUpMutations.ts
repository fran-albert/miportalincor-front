import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFollowUpNote } from "@/api/Program/create-follow-up-note.action";
import { deleteFollowUpEntry } from "@/api/Program/delete-follow-up-entry.action";
import { updateFollowUpNote } from "@/api/Program/update-follow-up-note.action";
import { upsertMonthlySummary } from "@/api/Program/upsert-monthly-summary.action";
import {
  CreateFollowUpNoteDto,
  UpdateFollowUpNoteDto,
  UpsertMonthlySummaryDto,
} from "@/types/Program/ProgramFollowUp";

export const useFollowUpMutations = (enrollmentId: string) => {
  const queryClient = useQueryClient();

  const invalidateFollowUpQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["follow-up", enrollmentId],
    });
    queryClient.invalidateQueries({
      queryKey: ["monthly-summary", enrollmentId],
    });
  };

  const createNoteMutation = useMutation({
    mutationFn: (dto: CreateFollowUpNoteDto) =>
      createFollowUpNote(enrollmentId, dto),
    onSuccess: invalidateFollowUpQueries,
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({
      entryId,
      dto,
    }: {
      entryId: string;
      dto: UpdateFollowUpNoteDto;
    }) => updateFollowUpNote(enrollmentId, entryId, dto),
    onSuccess: invalidateFollowUpQueries,
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => deleteFollowUpEntry(enrollmentId, entryId),
    onSuccess: invalidateFollowUpQueries,
  });

  const upsertMonthlySummaryMutation = useMutation({
    mutationFn: ({
      year,
      month,
      dto,
    }: {
      year: number;
      month: number;
      dto: UpsertMonthlySummaryDto;
    }) => upsertMonthlySummary(enrollmentId, year, month, dto),
    onSuccess: invalidateFollowUpQueries,
  });

  return {
    createNoteMutation,
    updateNoteMutation,
    deleteEntryMutation,
    upsertMonthlySummaryMutation,
  };
};
