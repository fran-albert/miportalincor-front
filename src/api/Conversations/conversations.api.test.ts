// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiConversations } from "@/services/axiosConfig";
import {
  sendConversationMedia,
  sendConversationTyping,
} from "./conversations.api";

vi.mock("@/config/environment", () => ({
  environment: {
    CONVERSATIONS_MOCK: false,
  },
}));

vi.mock("@/services/axiosConfig", () => ({
  apiConversations: {
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sendConversationMedia", () => {
  it("sends files as multipart form-data without base64 encoding", async () => {
    const file = new File(["orden"], "orden.pdf", {
      type: "application/pdf",
    });

    await sendConversationMedia("conv-1", file, "  Te mando la orden.  ");

    expect(apiConversations.post).toHaveBeenCalledWith(
      "/conversations/conv-1/media",
      expect.any(FormData),
    );
    const formData = vi.mocked(apiConversations.post).mock.calls[0][1] as FormData;
    expect(formData.get("file")).toBe(file);
    expect(formData.get("caption")).toBe("Te mando la orden.");
  });
});

describe("sendConversationTyping", () => {
  it("posts a typing pulse for the conversation", async () => {
    await sendConversationTyping("conv-1");

    expect(apiConversations.post).toHaveBeenCalledWith(
      "/conversations/conv-1/typing",
    );
  });
});
