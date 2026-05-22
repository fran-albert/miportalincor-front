// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Conversation } from "@/types/Conversations";
import { ConversationListItem } from ".";
import { getConversationDisplayIdentity } from "./conversation-identity";

describe("conversation identity display", () => {
  it("prioritizes the identified patient name and keeps WhatsApp context", () => {
    const identity = getConversationDisplayIdentity(conversation);

    expect(identity.displayName).toBe("Marta Benitez");
    expect(identity.listContext).toBe(
      "WhatsApp: Marta WhatsApp · DNI 24111222 · +5493515550101",
    );
    expect(identity.headerContext).toBe(
      "WhatsApp: Marta WhatsApp · DNI 24111222 · +5493515550101",
    );
  });

  it("renders the WhatsApp avatar image when the API provides one", () => {
    render(
      <ConversationListItem
        conversation={withAvatar}
        selected={false}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Marta Benitez" }),
    ).toHaveAttribute("src", "https://example.com/marta.jpg");
    expect(screen.getByText("Marta Benitez")).toBeInTheDocument();
    expect(
      screen.getByText("WhatsApp: Marta WhatsApp · DNI 24111222 · +5493515550101"),
    ).toBeInTheDocument();
  });

  it("falls back to a visible phone when WhatsApp sends an invisible profile name", () => {
    const identity = getConversationDisplayIdentity({
      ...conversation,
      profileName: "‎",
      patient: {
        ...conversation.patient,
        patientId: null,
        dni: null,
        firstName: null,
        lastName: null,
        phone: "5493416113746",
      },
    });

    expect(identity.displayName).toBe("+5493416113746");
    expect(identity.whatsappName).toBeNull();
    expect(identity.headerContext).toBe("Sin paciente identificado");
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

const withAvatar: Conversation = {
  ...conversation,
  profileImageUrl: "https://example.com/marta.jpg",
};
