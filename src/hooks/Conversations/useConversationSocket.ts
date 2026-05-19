import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { environment } from "@/config/environment";
import { conversationKeys } from "@/api/Conversations/conversations.api";
import {
  connectConversationsSocket,
  ConversationSocketEvents,
} from "@/services/conversations-socket.config";

const REALTIME_FALLBACK_INTERVAL_MS = 12_000;

export function useConversationSocket(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (environment.CONVERSATIONS_MOCK) return undefined;

    const socket = connectConversationsSocket();
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;
    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    };
    const stopFallback = () => {
      if (!fallbackTimer) return;
      clearInterval(fallbackTimer);
      fallbackTimer = null;
    };
    const startFallback = () => {
      if (fallbackTimer) return;
      fallbackTimer = setInterval(() => {
        if (!socket.connected) {
          invalidateAll();
        }
      }, REALTIME_FALLBACK_INTERVAL_MS);
    };
    const handleConnected = () => {
      stopFallback();
      invalidateAll();
    };

    socket.on(ConversationSocketEvents.CREATED, invalidateAll);
    socket.on(ConversationSocketEvents.ESCALATED, invalidateAll);
    socket.on(ConversationSocketEvents.UPDATED, invalidateAll);
    socket.on(ConversationSocketEvents.ASSIGNED, invalidateAll);
    socket.on(ConversationSocketEvents.CLOSED, invalidateAll);
    socket.on(ConversationSocketEvents.REROUTED, invalidateAll);
    socket.on(ConversationSocketEvents.MESSAGE_RECEIVED, invalidateAll);
    socket.on(ConversationSocketEvents.MESSAGE_SENT, invalidateAll);
    socket.on(ConversationSocketEvents.STATUS_UPDATED, invalidateAll);
    socket.on("connect", handleConnected);
    socket.on("connect_error", startFallback);
    socket.on("disconnect", startFallback);

    if (!socket.connected) {
      startFallback();
    }

    return () => {
      socket.off(ConversationSocketEvents.CREATED, invalidateAll);
      socket.off(ConversationSocketEvents.ESCALATED, invalidateAll);
      socket.off(ConversationSocketEvents.UPDATED, invalidateAll);
      socket.off(ConversationSocketEvents.ASSIGNED, invalidateAll);
      socket.off(ConversationSocketEvents.CLOSED, invalidateAll);
      socket.off(ConversationSocketEvents.REROUTED, invalidateAll);
      socket.off(ConversationSocketEvents.MESSAGE_RECEIVED, invalidateAll);
      socket.off(ConversationSocketEvents.MESSAGE_SENT, invalidateAll);
      socket.off(ConversationSocketEvents.STATUS_UPDATED, invalidateAll);
      socket.off("connect", handleConnected);
      socket.off("connect_error", startFallback);
      socket.off("disconnect", startFallback);
      stopFallback();
    };
  }, [queryClient]);

  useEffect(() => {
    if (environment.CONVERSATIONS_MOCK || !conversationId) return undefined;

    const socket = connectConversationsSocket();
    socket.emit(ConversationSocketEvents.SUBSCRIBE, { id: conversationId });

    return () => {
      socket.emit(ConversationSocketEvents.UNSUBSCRIBE, { id: conversationId });
    };
  }, [conversationId]);
}
