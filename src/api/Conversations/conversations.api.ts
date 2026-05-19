import { apiConversations } from "@/services/axiosConfig";
import { environment } from "@/config/environment";
import {
  Conversation,
  ConversationDetail,
  ConversationListResponse,
  ConversationMessage,
  ConversationQueue,
  ConversationStatus,
  InboxFilters,
  QueueRouting,
  RerouteConversationInput,
  SendConversationMessageInput,
} from "@/types/Conversations";
import {
  mockGetConversation,
  mockListConversations,
  mockListQueues,
} from "./conversations.mock";

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (filters: InboxFilters) => [...conversationKeys.lists(), filters] as const,
  detail: (id: string | null) => [...conversationKeys.all, "detail", id] as const,
  queues: () => [...conversationKeys.all, "queues"] as const,
};

export async function listConversations(
  filters: InboxFilters,
): Promise<ConversationListResponse> {
  if (environment.CONVERSATIONS_MOCK) {
    const data = await mockListConversations(filters);
    return normalizeListResponse(data, filters);
  }

  const params = buildListParams(filters);
  const { data } = await apiConversations.get<ConversationListResponse>(
    "/conversations",
    { params },
  );
  return normalizeListResponse(data, filters);
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  if (environment.CONVERSATIONS_MOCK) {
    return mockGetConversation(id);
  }

  const { data } = await apiConversations.get<ConversationDetail>(
    `/conversations/${id}`,
  );
  return data;
}

export async function getMessages(
  id: string,
  before?: string,
): Promise<ConversationMessage[]> {
  const { data } = await apiConversations.get<ConversationMessage[]>(
    `/conversations/${id}/messages`,
    { params: before ? { before } : undefined },
  );
  return data;
}

export async function getMessageMedia(
  conversationId: string,
  messageId: string,
): Promise<Blob> {
  const { data } = await apiConversations.get<Blob>(
    `/conversations/${conversationId}/messages/${messageId}/media`,
    { responseType: "blob" },
  );
  return data;
}

export async function sendMessage(
  id: string,
  input: SendConversationMessageInput,
): Promise<ConversationDetail> {
  const { data } = await apiConversations.post<ConversationDetail>(
    `/conversations/${id}/messages`,
    {
      content: input.content,
      media_url: input.mediaUrl,
    },
  );
  return data;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

export async function sendConversationMedia(
  id: string,
  file: File,
  caption?: string,
): Promise<void> {
  if (environment.CONVERSATIONS_MOCK) {
    throw new Error("Adjuntar archivos no está disponible en modo demo");
  }
  const dataBase64 = await fileToBase64(file);
  await apiConversations.post(`/conversations/${id}/media`, {
    mimeType: file.type || "application/octet-stream",
    filename: file.name,
    dataBase64,
    caption: caption?.trim() || undefined,
  });
}

export async function markConversationRead(id: string): Promise<void> {
  if (environment.CONVERSATIONS_MOCK) return;
  await apiConversations.post(`/conversations/${id}/read`);
}

export async function takeConversation(id: string): Promise<Conversation> {
  const { data } = await apiConversations.post<Conversation>(
    `/conversations/${id}/take`,
  );
  return data;
}

export async function closeConversation(
  id: string,
  resolutionNote?: string,
): Promise<Conversation> {
  const { data } = await apiConversations.post<Conversation>(
    `/conversations/${id}/close`,
    { resolution_note: resolutionNote },
  );
  return data;
}

export async function reopenConversation(id: string): Promise<Conversation> {
  const { data } = await apiConversations.post<Conversation>(
    `/conversations/${id}/reopen`,
  );
  return data;
}

export async function rerouteConversation(
  id: string,
  input: RerouteConversationInput,
): Promise<Conversation> {
  const { data } = await apiConversations.post<Conversation>(
    `/conversations/${id}/reroute`,
    {
      to_queue: input.toQueue,
      reason: input.reason,
    },
  );
  return data;
}

export async function addInternalNote(
  id: string,
  content: string,
): Promise<ConversationDetail> {
  const { data } = await apiConversations.post<ConversationDetail>(
    `/conversations/${id}/notes`,
    { content },
  );
  return data;
}

export async function updateTags(
  id: string,
  tags: string[],
): Promise<Conversation> {
  const { data } = await apiConversations.post<Conversation>(
    `/conversations/${id}/tags`,
    { tags },
  );
  return data;
}

export async function listQueues(): Promise<QueueRouting[]> {
  if (environment.CONVERSATIONS_MOCK) {
    return mockListQueues();
  }

  const { data } = await apiConversations.get<QueueRouting[]>("/queues");
  return data;
}

function buildListParams(filters: InboxFilters): {
  queue?: ConversationQueue | "all";
  status?: ConversationStatus;
  assignee?: "me" | "unassigned";
  search?: string;
  limit: number;
} {
  const status = filters.tab === "cerradas" ? "closed" : undefined;
  const assignee =
    filters.tab === "mias"
      ? "me"
      : filters.tab === "sin_asignar"
        ? "unassigned"
        : undefined;

  return {
    queue: filters.queue,
    status,
    assignee,
    search: filters.search?.trim() || undefined,
    limit: 50,
  };
}

function normalizeListResponse(
  data: ConversationListResponse,
  filters: InboxFilters,
): ConversationListResponse {
  if (filters.tab === "cerradas") {
    return data;
  }

  const items = data.items.filter((item) => item.status !== "closed");
  return {
    ...data,
    items,
    total: items.length,
  };
}
