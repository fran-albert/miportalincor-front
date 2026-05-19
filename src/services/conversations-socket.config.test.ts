// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";

vi.mock("@/config/environment", () => ({
  environment: {
    CONVERSATIONS_WS_URL: "http://localhost:3005/api/conversations/stream",
  },
}));

vi.mock("@/utils/authStorage", () => ({
  authStorage: {
    getToken: vi.fn(() => "token-test"),
  },
}));

describe("resolveConversationsSocketEndpoint", () => {
  it("keeps the Socket.IO namespace separate from the /chatbot proxy prefix", async () => {
    const { resolveConversationsSocketEndpoint } = await import(
      "./conversations-socket.config"
    );

    expect(
      resolveConversationsSocketEndpoint(
        "https://api-turnos.incorcentromedico.com.ar/chatbot/api/conversations/stream",
      ),
    ).toEqual({
      url: "https://api-turnos.incorcentromedico.com.ar/api/conversations/stream",
      path: "/chatbot/socket.io/",
    });
  });

  it("uses the default Socket.IO path when there is no proxy prefix", async () => {
    const { resolveConversationsSocketEndpoint } = await import(
      "./conversations-socket.config"
    );

    expect(
      resolveConversationsSocketEndpoint(
        "http://localhost:3005/api/conversations/stream",
      ),
    ).toEqual({
      url: "http://localhost:3005/api/conversations/stream",
      path: "/socket.io/",
    });
  });

  it("supports a proxy prefix URL without the namespace path", async () => {
    const { resolveConversationsSocketEndpoint } = await import(
      "./conversations-socket.config"
    );

    expect(
      resolveConversationsSocketEndpoint(
        "https://api-turnos.incorcentromedico.com.ar/chatbot",
      ),
    ).toEqual({
      url: "https://api-turnos.incorcentromedico.com.ar/api/conversations/stream",
      path: "/chatbot/socket.io/",
    });
  });
});
