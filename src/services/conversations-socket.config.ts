import { io, Socket } from "socket.io-client";
import { environment } from "@/config/environment";
import { authStorage } from "@/utils/authStorage";

let socket: Socket | null = null;

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

export const getConversationsSocket = (): Socket => {
  if (!socket) {
    socket = io(environment.CONVERSATIONS_WS_URL, {
      transports: ["polling", "websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: "/socket.io/",
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
