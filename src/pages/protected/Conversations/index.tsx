import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { MessageCircle, RefreshCcw } from "lucide-react";
import {
  conversationKeys,
  markConversationRead,
} from "@/api/Conversations/conversations.api";
import {
  ConversationDetailView,
  ConversationsInbox,
} from "@/components/Conversations";
import { Button } from "@/components/ui/button";
import {
  useConversationQueues,
  useConversations,
} from "@/hooks/Conversations/useConversations";
import { useConversationDetail } from "@/hooks/Conversations/useConversationDetail";
import { useConversationMutations } from "@/hooks/Conversations/useConversationMutations";
import { useConversationSocket } from "@/hooks/Conversations/useConversationSocket";
import { InboxFilters } from "@/types/Conversations";

interface ConversationsPageProps {
  standalonePreview?: boolean;
}

const initialFilters: InboxFilters = {
  queue: "all",
  tab: "activas",
};

export default function ConversationsPage({
  standalonePreview = false,
}: ConversationsPageProps) {
  const [filters, setFilters] = useState<InboxFilters>(initialFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const conversationsQuery = useConversations(filters);
  const queuesQuery = useConversationQueues();
  const conversations = useMemo(() => {
    const items = conversationsQuery.data?.items ?? [];
    return [...items].sort((a, b) => {
      const aTime = new Date(a.lastMessageAt ?? a.createdAt).getTime();
      const bTime = new Date(b.lastMessageAt ?? b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [conversationsQuery.data?.items]);
  const detailQuery = useConversationDetail(selectedId);
  const mutations = useConversationMutations(selectedId);
  const queryClient = useQueryClient();

  useConversationSocket(selectedId);

  const isUnread = detailQuery.data?.unread ?? false;
  useEffect(() => {
    if (!selectedId || !isUnread) return;
    let cancelled = false;
    markConversationRead(selectedId)
      .then(() => {
        if (!cancelled) {
          queryClient.invalidateQueries({ queryKey: conversationKeys.all });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedId, isUnread, queryClient]);

  useEffect(() => {
    if (conversations.length === 0) {
      if (selectedId) setSelectedId(null);
      return;
    }

    if (!selectedId && conversations[0]) {
      setSelectedId(conversations[0].id);
      return;
    }

    if (selectedId) {
      const stillVisible = conversations.some((item) => item.id === selectedId);
      if (!stillVisible) {
        setSelectedId(conversations[0].id);
      }
    }
  }, [conversations, selectedId]);

  return (
    <>
      <Helmet>
        <title>Conversaciones | Incor Centro Médico</title>
      </Helmet>
      <main
        className={`flex min-w-0 flex-col bg-[#f5f7f6] ${
          standalonePreview ? "h-screen" : "h-[calc(100vh-4rem)]"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-greenSecondary px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-white">
                Conversaciones
              </h1>
              <p className="truncate text-xs text-white/70">
                WhatsApp del bot Incor
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              conversationsQuery.refetch();
              if (selectedId) detailQuery.refetch();
            }}
            className="rounded-full text-white hover:bg-white/15 hover:text-white"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[380px_minmax(0,1fr)]">
          <ConversationsInbox
            conversations={conversations}
            total={conversationsQuery.data?.total ?? 0}
            filters={filters}
            queues={queuesQuery.data ?? []}
            selectedId={selectedId}
            isLoading={conversationsQuery.isLoading || queuesQuery.isLoading}
            isFetching={conversationsQuery.isFetching || queuesQuery.isFetching}
            onSelect={setSelectedId}
            onFiltersChange={setFilters}
            onRefresh={() => conversationsQuery.refetch()}
          />
          <ConversationDetailView
            detail={detailQuery.data}
            queues={queuesQuery.data ?? []}
            isLoading={detailQuery.isLoading}
            mutations={mutations}
          />
        </div>
      </main>
    </>
  );
}
