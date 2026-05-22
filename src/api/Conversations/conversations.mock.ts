import {
  ConversationDetail,
  ConversationListResponse,
  ConversationQueue,
  InboxFilters,
  QueueRouting,
} from "@/types/Conversations";

const now = Date.now();

const mockConversations: ConversationDetail[] = [
  {
    id: "mock-1",
    profileName: "Marta WhatsApp",
    contactDisplayName: null,
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
    tags: ["estudios", "adulto-mayor"],
    priority: "normal",
    lastMessagePreview: "No puedo abrir el resultado del laboratorio",
    lastMessageAt: new Date(now - 7 * 60 * 1000).toISOString(),
    unread: true,
    zammadTicketId: "35005",
    createdAt: new Date(now - 25 * 60 * 1000).toISOString(),
    upcomingAppointments: [],
    internalNotes: [],
    messages: [
      {
        id: "msg-1",
        conversationId: "mock-1",
        direction: "inbound",
        sender: "patient",
        senderName: "Marta",
        content: "Hola, no puedo abrir el resultado del laboratorio.",
        mediaUrl: null,
        status: "read",
        createdAt: new Date(now - 25 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-2",
        conversationId: "mock-1",
        direction: "outbound",
        sender: "bot",
        senderName: "Bot Incor",
        content: "Te derivamos con el equipo para revisarlo por este mismo chat.",
        mediaUrl: null,
        status: "delivered",
        createdAt: new Date(now - 24 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "mock-2",
    profileName: "Roberto S.",
    contactDisplayName: null,
    profileImageUrl: null,
    patient: {
      patientId: 2105,
      dni: "18666777",
      firstName: "Roberto",
      lastName: "Suarez",
      birthDate: "1948-11-02",
      healthInsurance: "OSDE",
      phone: "+5493515550102",
      email: "roberto@example.com",
    },
    status: "human_handled",
    queue: "administrativo",
    category: "billing",
    assignedToUserId: 4,
    assignedToName: "Secretaría",
    tags: ["comprobante"],
    priority: "normal",
    lastMessagePreview: "Necesito que me envíen el comprobante",
    lastMessageAt: new Date(now - 31 * 60 * 1000).toISOString(),
    unread: false,
    zammadTicketId: "35006",
    createdAt: new Date(now - 50 * 60 * 1000).toISOString(),
    upcomingAppointments: [],
    internalNotes: [
      {
        id: "note-1",
        author: "Secretaría",
        content: "Pidió comprobante de atención.",
        createdAt: new Date(now - 20 * 60 * 1000).toISOString(),
      },
    ],
    messages: [
      {
        id: "msg-3",
        conversationId: "mock-2",
        direction: "inbound",
        sender: "patient",
        senderName: "Roberto",
        content: "Buenas tardes, necesito que me envíen el comprobante.",
        mediaUrl: null,
        status: "read",
        createdAt: new Date(now - 50 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "mock-3",
    profileName: null,
    contactDisplayName: "Marcos Pereira",
    profileImageUrl: null,
    patient: {
      patientId: null,
      dni: "30111222",
      firstName: null,
      lastName: null,
      birthDate: null,
      healthInsurance: null,
      phone: "+5493515550103",
      email: null,
    },
    status: "awaiting_human",
    queue: "turnos",
    category: "appointment_failed",
    assignedToUserId: null,
    assignedToName: null,
    tags: ["bot-no-pudo-cerrar"],
    priority: "urgent",
    lastMessagePreview: "El horario que me ofreció ya no aparece",
    lastMessageAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    unread: true,
    zammadTicketId: "35007",
    createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
    upcomingAppointments: [],
    internalNotes: [],
    messages: [
      {
        id: "msg-4",
        conversationId: "mock-3",
        direction: "inbound",
        sender: "patient",
        senderName: null,
        content: "El horario que me ofreció ya no aparece, me ayudan?",
        mediaUrl: null,
        status: "read",
        createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export async function mockListConversations(
  filters: InboxFilters,
): Promise<ConversationListResponse> {
  const items = mockConversations.filter((conversation) => {
    if (filters.queue !== "all" && conversation.queue !== filters.queue) {
      return false;
    }
    if (filters.tab === "cerradas") return conversation.status === "closed";
    if (filters.tab === "mias") return Boolean(conversation.assignedToUserId);
    if (filters.tab === "sin_asignar") return conversation.assignedToUserId === null;
    return conversation.status !== "closed";
  });

  return { items, page: 1, limit: 30, total: items.length };
}

export async function mockGetConversation(id: string): Promise<ConversationDetail> {
  const conversation = mockConversations.find((item) => item.id === id);
  if (!conversation) throw new Error("Conversación no encontrada");
  return conversation;
}

export async function mockListQueues(): Promise<QueueRouting[]> {
  return [
    queue("estudios", "Estudios"),
    queue("administrativo", "Administrativo"),
    queue("reclamos", "Reclamos"),
    queue("clinico_derivacion", "Derivación clínica"),
    queue("general", "General"),
    queue("turnos", "Turnos"),
  ];
}

function queue(queueName: ConversationQueue, displayName: string): QueueRouting {
  return {
    queue: queueName,
    displayName,
    emailInbox: null,
    allowedRoles: [],
    active: true,
  };
}
