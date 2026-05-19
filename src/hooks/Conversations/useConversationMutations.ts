import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  addInternalNote,
  closeConversation,
  conversationKeys,
  reopenConversation,
  rerouteConversation,
  sendMessage,
  takeConversation,
  updateTags,
} from "@/api/Conversations/conversations.api";
import {
  RerouteConversationInput,
  SendConversationMessageInput,
} from "@/types/Conversations";

export function useConversationMutations(conversationId: string | null) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: conversationKeys.all });
  };

  return {
    sendMessage: useMutation({
      mutationFn: (input: SendConversationMessageInput) =>
        sendMessage(requireId(conversationId), input),
      onSuccess: invalidate,
      onError: (error: unknown) => {
        toast.error(
          extractErrorMessage(error, "No se pudo enviar el mensaje"),
        );
      },
    }),
    takeConversation: useMutation({
      mutationFn: () => takeConversation(requireId(conversationId)),
      onSuccess: invalidate,
    }),
    closeConversation: useMutation({
      mutationFn: (resolutionNote?: string) =>
        closeConversation(requireId(conversationId), resolutionNote),
      onSuccess: invalidate,
    }),
    reopenConversation: useMutation({
      mutationFn: () => reopenConversation(requireId(conversationId)),
      onSuccess: invalidate,
    }),
    rerouteConversation: useMutation({
      mutationFn: (input: RerouteConversationInput) =>
        rerouteConversation(requireId(conversationId), input),
      onSuccess: invalidate,
    }),
    addInternalNote: useMutation({
      mutationFn: (content: string) => addInternalNote(requireId(conversationId), content),
      onSuccess: invalidate,
    }),
    updateTags: useMutation({
      mutationFn: (tags: string[]) => updateTags(requireId(conversationId), tags),
      onSuccess: invalidate,
    }),
  };
}

function requireId(id: string | null): string {
  if (!id) throw new Error("conversationId required");
  return id;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return fallback;
}
