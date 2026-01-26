import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGreenCard } from "@/api/Green-Card/create-green-card.action";
import { addGreenCardItem } from "@/api/Green-Card/add-green-card-item.action";
import { updateGreenCardItem } from "@/api/Green-Card/update-green-card-item.action";
import { toggleGreenCardItem } from "@/api/Green-Card/toggle-green-card-item.action";
import { deleteGreenCardItem } from "@/api/Green-Card/delete-green-card-item.action";
import { requestPrescription } from "@/api/Green-Card/request-prescription.action";
import type {
  CreateGreenCardDto,
  CreateGreenCardItemDto,
  UpdateGreenCardItemDto,
} from "@/types/Green-Card/GreenCard";

export const useGreenCardMutations = () => {
  const queryClient = useQueryClient();

  const createGreenCardMutation = useMutation({
    mutationFn: (dto: CreateGreenCardDto) => createGreenCard(dto),
    onSuccess: (greenCard) => {
      // Invalidate patient green cards query
      queryClient.invalidateQueries({
        queryKey: ["patient-green-cards", greenCard.patientUserId]
      });
      queryClient.invalidateQueries({
        queryKey: ["my-card-for-patient", greenCard.patientUserId]
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ cardId, dto }: { cardId: string; dto: CreateGreenCardItemDto }) =>
      addGreenCardItem(cardId, dto),
    onSuccess: (greenCard) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["green-card", greenCard.id] });
      queryClient.invalidateQueries({
        queryKey: ["patient-green-cards", greenCard.patientUserId]
      });
      queryClient.invalidateQueries({
        queryKey: ["my-card-for-patient", greenCard.patientUserId]
      });
      queryClient.invalidateQueries({ queryKey: ["my-green-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-cards-summary"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      cardId,
      itemId,
      dto,
    }: {
      cardId: string;
      itemId: string;
      dto: UpdateGreenCardItemDto;
    }) => updateGreenCardItem(cardId, itemId, dto),
    onSuccess: (greenCard) => {
      queryClient.invalidateQueries({ queryKey: ["green-card", greenCard.id] });
      queryClient.invalidateQueries({
        queryKey: ["patient-green-cards", greenCard.patientUserId]
      });
      queryClient.invalidateQueries({
        queryKey: ["my-card-for-patient", greenCard.patientUserId]
      });
      queryClient.invalidateQueries({ queryKey: ["my-green-cards"] });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ cardId, itemId }: { cardId: string; itemId: string }) =>
      toggleGreenCardItem(cardId, itemId),
    onSuccess: (greenCard) => {
      queryClient.invalidateQueries({ queryKey: ["green-card", greenCard.id] });
      queryClient.invalidateQueries({
        queryKey: ["patient-green-cards", greenCard.patientUserId]
      });
      queryClient.invalidateQueries({
        queryKey: ["my-card-for-patient", greenCard.patientUserId]
      });
      queryClient.invalidateQueries({ queryKey: ["my-green-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-cards-summary"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ cardId, itemId }: { cardId: string; itemId: string }) =>
      deleteGreenCardItem(cardId, itemId),
    onSuccess: (_, variables) => {
      // We don't get greenCard back from delete, so invalidate all
      queryClient.invalidateQueries({ queryKey: ["green-card", variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ["patient-green-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-card-for-patient"] });
      queryClient.invalidateQueries({ queryKey: ["my-green-cards"] });
      queryClient.invalidateQueries({ queryKey: ["my-cards-summary"] });
    },
  });

  const requestPrescriptionMutation = useMutation({
    mutationFn: ({ cardId, itemId }: { cardId: string; itemId: string }) =>
      requestPrescription(cardId, itemId),
    onSuccess: () => {
      // No need to invalidate green card queries, just show success message
    },
  });

  return {
    createGreenCardMutation,
    addItemMutation,
    updateItemMutation,
    toggleItemMutation,
    deleteItemMutation,
    requestPrescriptionMutation,
  };
};
