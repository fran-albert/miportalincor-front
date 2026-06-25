import { io, Socket } from "socket.io-client";
import { environment } from "@/config/environment";
import { authStorage } from "@/utils/authStorage";

let socket: Socket | null = null;
const CONVERSATIONS_NAMESPACE = "/api/conversations/stream";

export enum ConversationSocketEvents {
  CREATED = "conversation.created",
  ESCALATED = "conversation.escalated",
  UPDATED = "conversation.updated",
  ASSIGNED = "conversation.assigned",
  CLOSED = "conversation.closed",
  REROUTED = "conversation.rerouted",
  MESSAGE_RECEIVED = "message.received",
  MESSAGE_SENT = "message.sent",
  STATUS_UPDATED = "message.status_changed",
  SUBSCRIBE = "subscribe.conversation",
  UNSUBSCRIBE = "unsubscribe.conversation",
}

export function resolveConversationsSocketEndpoint(rawUrl: string): {
  url: string;
  path: string;
} {
  const fallbackOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const parsed = new URL(rawUrl || CONVERSATIONS_NAMESPACE, fallbackOrigin);
  const normalizedPath = parsed.pathname.replace(/\/+$/, "");
  const namespaceIndex = normalizedPath.endsWith(CONVERSATIONS_NAMESPACE)
    ? normalizedPath.lastIndexOf(CONVERSATIONS_NAMESPACE)
    : -1;
  const proxyPrefix =
    namespaceIndex >= 0
      ? normalizedPath.slice(0, namespaceIndex)
      : normalizedPath === ""
        ? ""
        : normalizedPath;
  const prefix = proxyPrefix.replace(/\/+$/, "");

  return {
    url: `${parsed.origin}${CONVERSATIONS_NAMESPACE}`,
    path: `${prefix}/socket.io/`.replace(/^\/?/, "/"),
  };
}

export const getConversationsSocket = (): Socket => {
  if (!socket) {
    const endpoint = resolveConversationsSocketEndpoint(
      environment.CONVERSATIONS_WS_URL,
    );
    socket = io(endpoint.url, {
      transports: ["polling", "websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: endpoint.path,
      auth: {
        token: authStorage.getToken(),
      },
    });

    socket.on("connect_error", (error) => {
      console.error("[ConversationsSocket] Error de conexión:", error.message);
    });
  }

  return socket;
};

export const connectConversationsSocket = (): Socket => {
  const current = getConversationsSocket();
  current.auth = { token: authStorage.getToken() };
  if (!current.connected) {
    current.connect();
  }
  return current;
};

export const disconnectConversationsSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
