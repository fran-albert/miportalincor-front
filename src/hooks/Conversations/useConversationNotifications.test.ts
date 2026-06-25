import { describe, expect, it } from "vitest";

import { ConversationSocketEvents } from "@/services/conversations-socket.config";
import {
  addIncomingNotificationToBatch,
  createNotificationBatchState,
} from "./useConversationNotifications";

describe("conversation notification batching", () => {
  it("counts one WhatsApp message when created/escalated/message events share a conversation", () => {
    const batch = createNotificationBatchState();

    addIncomingNotificationToBatch(
      batch,
      ConversationSocketEvents.CREATED,
      { conversationId: "conv-1", name: "Francisco" },
    );
    addIncomingNotificationToBatch(
      batch,
      ConversationSocketEvents.ESCALATED,
      { conversationId: "conv-1", name: "Francisco" },
    );
    addIncomingNotificationToBatch(
      batch,
      ConversationSocketEvents.MESSAGE_RECEIVED,
      {
        conversationId: "conv-1",
        messageId: "msg-1",
        name: "Francisco",
        preview: "Hola",
      },
    );

    expect(batch.items.size).toBe(1);
    expect(batch.last?.preview).toBe("Hola");
  });

  it("still counts distinct inbound messages in the same conversation", () => {
    const batch = createNotificationBatchState();

    addIncomingNotificationToBatch(
      batch,
      ConversationSocketEvents.MESSAGE_RECEIVED,
      { conversationId: "conv-1", messageId: "msg-1", preview: "Hola" },
    );
    addIncomingNotificationToBatch(
      batch,
      ConversationSocketEvents.MESSAGE_RECEIVED,
      { conversationId: "conv-1", messageId: "msg-2", preview: "Otra cosa" },
    );

    expect(batch.items.size).toBe(2);
  });
});
