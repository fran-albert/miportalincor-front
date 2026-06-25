// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getMessageMedia } from "@/api/Conversations/conversations.api";
import { ConversationMessage } from "@/types/Conversations";
import { MessageBubble } from ".";

vi.mock("@/api/Conversations/conversations.api", () => ({
  getMessageMedia: vi.fn(),
}));

const createObjectURL = vi.fn(() => "blob:conversation-image");
const revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("URL", {
    createObjectURL,
    revokeObjectURL,
  });
  vi.mocked(getMessageMedia).mockResolvedValue(
    new Blob(["image"], { type: "image/jpeg" }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MediaAttachment", () => {
  it("opens inbound images in a closable in-panel preview", async () => {
    render(<MessageBubble message={imageMessage} />);

    fireEvent.click(
      await screen.findByRole("button", { name: /ver imagen recibida/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /imagen recibida/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /imagen recibida/i }),
      ).not.toBeInTheDocument(),
    );
  });
});

const imageMessage: ConversationMessage = {
  id: "msg-1",
  conversationId: "conv-1",
  direction: "inbound",
  sender: "patient",
  senderName: "Francisco",
  content: "[image]",
  mediaUrl: "/api/conversations/conv-1/messages/msg-1/media",
  mediaType: "image",
  status: "delivered",
  createdAt: "2026-05-19T15:00:00.000Z",
};
