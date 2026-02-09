import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGreenCard } from "@/api/Green-Card/create-green-card.action";
import { addGreenCardItem } from "@/api/Green-Card/add-green-card-item.action";
import { updateGreenCardItem } from "@/api/Green-Card/update-green-card-item.action";
import { toggleGreenCardItem } from "@/api/Green-Card/toggle-green-card-item.action";
import { deleteGreenCardItem } from "@/api/Green-Card/delete-green-card-item.action";
import { requestPrescription } from "@/api/Green-Card/request-prescription.action";
import { batchRequestPrescription } from "@/api/Green-Card/batch-request-prescription.action";
import type {
  CreateGreenCardDto,
  CreateGreenCardItemDto,
  UpdateGreenCardItemDto,
  BatchRequestResult,
} from "@/types/Green-Card/GreenCard";

export const useGreenCardMutations = () => {
  const queryClient = useQueryClient();

  // Helper to invalidate all green card related queries
  const invalidateGreenCardQueries = (cardId: string, patientUserId: string) => {
    // Card-specific queries
    queryClient.invalidateQueries({ queryKey: ["green-card", cardId] });

    // Doctor view queries (patient-specific)
    queryClient.invalidateQueries({ queryKey: ["patient-green-card-edit", patientUserId] });
    queryClient.invalidateQueries({ queryKey: ["patient-green-card", patientUserId] });

    // Patient view queries
    queryClient.invalidateQueries({ queryKey: ["my-green-card"] });
    queryClient.invalidateQueries({ queryKey: ["my-card-summary"] });
  };

  const createGreenCardMutation = useMutation({
    mutationFn: (dto: CreateGreenCardDto) => createGreenCard(dto),
    onSuccess: (greenCard) => {
      invalidateGreenCardQueries(greenCard.id, greenCard.patientUserId);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ cardId, dto }: { cardId: string; dto: CreateGreenCardItemDto }) =>
      addGreenCardItem(cardId, dto),
    onSuccess: (_, variables) => {
      // Invalidate all green card queries since we only get the item back, not the full card
      queryClient.invalidateQueries({ queryKey: ["green-card", variables.cardId] });
      queryClient.invalidateQueries({ predicate: (query) =>
        query.queryKey[0] === "patient-green-card-edit" ||
        query.queryKey[0] === "patient-green-card"
      });
      queryClient.invalidateQueries({ queryKey: ["my-green-card"] });
      queryClient.invalidateQueries({ queryKey: ["my-card-summary"] });
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
    onSuccess: (_, variables) => {
      // Invalidate all green card queries since we only get the item back, not the full card
      queryClient.invalidateQueries({ queryKey: ["green-card", variables.cardId] });
      queryClient.invalidateQueries({ predicate: (query) =>
        query.queryKey[0] === "patient-green-card-edit" ||
        query.queryKey[0] === "patient-green-card"
      });
      queryClient.invalidateQueries({ queryKey: ["my-green-card"] });
      queryClient.invalidateQueries({ queryKey: ["my-card-summary"] });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ cardId, itemId }: { cardId: string; itemId: string }) =>
      toggleGreenCardItem(cardId, itemId),
    onSuccess: (_, variables) => {
      // Invalidate all green card queries since we only get the item back, not the full card
      queryClient.invalidateQueries({ queryKey: ["green-card", variables.cardId] });
      queryClient.invalidateQueries({ predicate: (query) =>
        query.queryKey[0] === "patient-green-card-edit" ||
        query.queryKey[0] === "patient-green-card"
      });
      queryClient.invalidateQueries({ queryKey: ["my-green-card"] });
      queryClient.invalidateQueries({ queryKey: ["my-card-summary"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ cardId, itemId }: { cardId: string; itemId: string }) =>
      deleteGreenCardItem(cardId, itemId),
    onSuccess: (_, variables) => {
      // We don't get greenCard back from delete, so invalidate all possible queries
      queryClient.invalidateQueries({ queryKey: ["green-card", variables.cardId] });
      queryClient.invalidateQueries({ predicate: (query) =>
        query.queryKey[0] === "patient-green-card-edit" ||
        query.queryKey[0] === "patient-green-card"
      });
      queryClient.invalidateQueries({ queryKey: ["my-green-card"] });
      queryClient.invalidateQueries({ queryKey: ["my-card-summary"] });
    },
  });

  const requestPrescriptionMutation = useMutation({
    mutationFn: ({ cardId, itemId }: { cardId: string; itemId: string }) =>
      requestPrescription(cardId, itemId),
    onSuccess: () => {
      // Invalidate prescription requests to update the history
      queryClient.invalidateQueries({ queryKey: ["prescriptionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["my-prescription-requests"] });
      // Invalidate green card to update pending status on items
      queryClient.invalidateQueries({ queryKey: ["my-green-card"] });
      queryClient.invalidateQueries({ queryKey: ["my-card-summary"] });
    },
  });

  const batchRequestPrescriptionMutation = useMutation({
    mutationFn: ({ cardId, itemIds }: { cardId: string; itemIds: string[] }) =>
      batchRequestPrescription(cardId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["my-prescription-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-green-card"] });
      queryClient.invalidateQueries({ queryKey: ["my-card-summary"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-pending-search"] });
    },
  });

  return {
    createGreenCardMutation,
    addItemMutation,
    updateItemMutation,
    toggleItemMutation,
    deleteItemMutation,
    requestPrescriptionMutation,
    batchRequestPrescriptionMutation,
  };
};
