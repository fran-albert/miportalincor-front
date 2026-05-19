import { useQueries } from "@tanstack/react-query";
import {
  conversationKeys,
  listConversations,
} from "@/api/Conversations/conversations.api";
import {
  ConversationListResponse,
  ConversationQueue,
  ConversationTab,
} from "@/types/Conversations";

const TABS: ConversationTab[] = [
  "activas",
  "mias",
  "sin_asignar",
  "cerradas",
];

export type ConversationTabCounts = Record<ConversationTab, number>;

export function useConversationTabCounts(
  queue: ConversationQueue | "all",
): ConversationTabCounts {
  const results = useQueries({
    queries: TABS.map((tab) => ({
      queryKey: [...conversationKeys.lists(), "count", queue, tab] as const,
      queryFn: () => listConversations({ queue, tab }),
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
      select: (data: ConversationListResponse) => data.total,
    })),
  });

  return TABS.reduce<ConversationTabCounts>(
    (acc, tab, index) => {
      acc[tab] = results[index]?.data ?? 0;
      return acc;
    },
    { activas: 0, mias: 0, sin_asignar: 0, cerradas: 0 },
  );
}
