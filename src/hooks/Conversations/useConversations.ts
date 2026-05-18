import { useQuery } from "@tanstack/react-query";
import {
  conversationKeys,
  listConversations,
  listQueues,
} from "@/api/Conversations/conversations.api";
import { InboxFilters } from "@/types/Conversations";

export function useConversations(filters: InboxFilters) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => listConversations(filters),
    staleTime: 30_000,
  });
}

export function useConversationQueues() {
  return useQuery({
    queryKey: conversationKeys.queues(),
    queryFn: listQueues,
    staleTime: 5 * 60 * 1000,
  });
}
