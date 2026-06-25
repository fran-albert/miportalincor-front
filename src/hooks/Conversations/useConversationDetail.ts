import { useQuery } from "@tanstack/react-query";
import {
  conversationKeys,
  getConversation,
} from "@/api/Conversations/conversations.api";

export function useConversationDetail(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => getConversation(id!),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}
