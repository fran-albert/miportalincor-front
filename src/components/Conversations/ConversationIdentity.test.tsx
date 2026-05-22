// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Conversation } from "@/types/Conversations";
import { ConversationListItem } from ".";
import { getConversationDisplayIdentity } from "./conversation-identity";

describe("conversation identity display", () => {
  it("prioritizes the WhatsApp profile name and keeps clinical context", () => {
    const identity = getConversationDisplayIdentity(conversation);

    expect(identity.displayName).toBe("Marta WhatsApp");
    expect(identity.listContext).toBe("Marta Benitez · DNI 24111222");
    expect(identity.headerContext).toBe("Marta Benitez · DNI 24111222");
  });

  it("renders the WhatsApp avatar image when the API provides one", () => {
    render(
      <ConversationListItem
        conversation={{
          ...conversation,
          profileImageUrl: "https://example.com/marta.jpg",
        }}
        selected={false}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Marta WhatsApp" }),
    ).toHaveAttribute("src", "https://example.com/marta.jpg");
    expect(screen.getByText("Marta WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Marta Benitez · DNI 24111222")).toBeInTheDocument();
  });
});

const conversation: Conversation = {
  id: "conv-1",
  profileName: "Marta WhatsApp",
  profileImageUrl: null,
  patient: {
    patientId: 1482,
    dni: "24111222",
    firstName: "Marta",
    lastName: "Benitez",
    birthDate: "1951-03-14",
    healthInsurance: "PAMI",
    phone: "+5493515550101",
    email: null,
  },
  status: "awaiting_human",
  queue: "estudios",
  category: "studies",
  assignedToUserId: null,
  assignedToName: null,
  tags: ["estudios"],
  priority: "normal",
  lastMessagePreview: "No puedo abrir el resultado",
  lastMessageAt: "2026-05-22T15:00:00.000Z",
  unread: true,
  zammadTicketId: null,
  createdAt: "2026-05-22T14:45:00.000Z",
};
