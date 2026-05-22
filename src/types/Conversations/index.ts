export const CONVERSATION_QUEUES = [
  "turnos",
  "estudios",
  "administrativo",
  "clinico_derivacion",
  "reclamos",
  "general",
] as const;

export type ConversationStatus =
  | "bot_active"
  | "awaiting_human"
  | "human_handled"
  | "closed";

export type ConversationQueue = (typeof CONVERSATION_QUEUES)[number];

export type MessageDirection = "inbound" | "outbound";
export type MessageSender = "patient" | "bot" | "human";
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";
export type ConversationPriority = "normal" | "urgent";

export interface ConversationMessage {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  sender: MessageSender;
  senderName: string | null;
  content: string;
  mediaUrl: string | null;
  mediaType?: string | null;
  status: MessageStatus;
  createdAt: string;
}

export interface ConversationPatientCard {
  patientId: number | null;
  dni: string | null;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  healthInsurance: string | null;
  phone: string;
  email: string | null;
}

export interface UpcomingAppointment {
  id: number;
  doctorName: string;
  speciality: string;
  date: string;
  status: "confirmado" | "pendiente";
}

export interface ConversationInternalNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  profileName?: string | null;
  contactDisplayName?: string | null;
  profileImageUrl?: string | null;
  patient: ConversationPatientCard;
  status: ConversationStatus;
  queue: ConversationQueue;
  category: string | null;
  assignedToUserId: number | null;
  assignedToName: string | null;
  tags: string[];
  priority: ConversationPriority;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  unread: boolean;
  zammadTicketId: string | null;
  createdAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: ConversationMessage[];
  upcomingAppointments: UpcomingAppointment[];
  internalNotes: ConversationInternalNote[];
}

export type ConversationTab = "activas" | "mias" | "sin_asignar" | "cerradas";

export interface InboxFilters {
  queue: ConversationQueue | "all";
  tab: ConversationTab;
  search?: string;
}

export interface ConversationListResponse {
  items: Conversation[];
  page: number;
  limit: number;
  total: number;
}

export interface QueueRouting {
  queue: ConversationQueue;
  displayName: string;
  emailInbox: string | null;
  allowedRoles: string[];
  active: boolean;
}

export interface SendConversationMessageInput {
  content: string;
  mediaUrl?: string;
}

export interface RerouteConversationInput {
  toQueue: ConversationQueue;
  reason?: string;
}

export const QUEUE_LABELS: Record<ConversationQueue, string> = {
  turnos: "Turnos",
  estudios: "Estudios",
  administrativo: "Administrativo",
  clinico_derivacion: "Derivación clínica",
  reclamos: "Reclamos",
  general: "General",
};

export const STATUS_LABELS: Record<ConversationStatus, string> = {
  bot_active: "Bot activo",
  awaiting_human: "Pendiente",
  human_handled: "En atención",
  closed: "Cerrada",
};
