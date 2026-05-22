import {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  Bot,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  FileText,
  Lock,
  MoreHorizontal,
  MessageCircle,
  Paperclip,
  Phone,
  RefreshCcw,
  Search,
  Send,
  X,
  StickyNote,
  Tag,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Conversation,
  ConversationDetail,
  ConversationMessage,
  ConversationQueue,
  ConversationTab,
  InboxFilters,
  MessageStatus,
  QUEUE_LABELS,
  QueueRouting,
  STATUS_LABELS,
} from "@/types/Conversations";
import { useConversationMutations } from "@/hooks/Conversations/useConversationMutations";
import { useConversationTabCounts } from "@/hooks/Conversations/useConversationTabCounts";
import { getMessageMedia } from "@/api/Conversations/conversations.api";
import { toast } from "sonner";
import { getConversationDisplayIdentity } from "./conversation-identity";

/* -------------------------------------------------------------------------- */
/*  Estilo base tipo WhatsApp Web con marca INCOR (#187B80)                    */
/* -------------------------------------------------------------------------- */

const CHAT_WALLPAPER: CSSProperties = {
  backgroundColor: "#eaf1f0",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Cg fill='none' stroke='%23187B80' stroke-opacity='0.045' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='M18 20h7M21.5 16.5v7'/%3E%3Ccircle cx='66' cy='62' r='4.5'/%3E%3Cpath d='M12 64h9M58 16l6 6M70 22l-6 6'/%3E%3Cpath d='M40 46c0-3 3-5 6-4'/%3E%3C/g%3E%3C/svg%3E\")",
};

const AVATAR_PALETTE = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function Avatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const dims =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : size === "sm"
        ? "h-9 w-9 text-xs"
        : "h-12 w-12 text-sm";
  const imageSrc = imageUrl?.trim();

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  if (imageSrc && !imageFailed) {
    return (
      <img
        src={imageSrc}
        alt={name}
        onError={() => setImageFailed(true)}
        className={cn(
          "shrink-0 select-none rounded-full object-cover ring-1 ring-black/5",
          dims,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
        dims,
        avatarColor(name),
      )}
    >
      {initials(name)}
    </div>
  );
}

function StatusDot({ status }: { status: Conversation["status"] }) {
  const color =
    status === "awaiting_human"
      ? "bg-amber-500"
      : status === "human_handled"
        ? "bg-sky-500"
        : status === "closed"
          ? "bg-gray-400"
          : "bg-emerald-500";
  return <span className={cn("h-2 w-2 shrink-0 rounded-full", color)} />;
}

/* -------------------------------------------------------------------------- */
/*  Bandeja (lista de chats)                                                   */
/* -------------------------------------------------------------------------- */

interface ConversationsInboxProps {
  conversations: Conversation[];
  total: number;
  filters: InboxFilters;
  queues: QueueRouting[];
  selectedId: string | null;
  isLoading: boolean;
  isFetching: boolean;
  onSelect: (id: string) => void;
  onFiltersChange: (filters: InboxFilters) => void;
  onRefresh: () => void;
}

export function ConversationsInbox({
  conversations,
  total,
  filters,
  queues,
  selectedId,
  isLoading,
  isFetching,
  onSelect,
  onFiltersChange,
  onRefresh,
}: ConversationsInboxProps) {
  const update = (patch: Partial<InboxFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };
  const tabCounts = useConversationTabCounts(filters.queue);

  return (
    <section className="flex min-h-0 flex-col border-r border-gray-200 bg-white">
      <div className="space-y-3 px-3 pb-3 pt-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Chats</h2>
            <p className="text-xs text-gray-400">
              {total} {total === 1 ? "conversación" : "conversaciones"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isFetching}
            aria-label="Actualizar conversaciones"
            className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <RefreshCcw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={filters.search ?? ""}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Buscar por nombre, DNI o teléfono"
            className="h-10 rounded-full border-0 bg-gray-100 pl-10 text-sm shadow-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-greenPrimary/30"
          />
        </div>

        <QueueSelector
          value={filters.queue}
          queues={queues}
          onChange={(queue) => update({ queue })}
        />

        <Tabs
          value={filters.tab}
          onValueChange={(value) => update({ tab: value as ConversationTab })}
        >
          <TabsList className="grid h-9 w-full grid-cols-4 gap-1 rounded-full bg-gray-100 p-1">
            {(
              [
                ["activas", "Activas"],
                ["mias", "Mías"],
                ["sin_asignar", "Sin asignar"],
                ["cerradas", "Cerradas"],
              ] as const
            ).map(([value, label]) => {
              const count = tabCounts[value];
              const isUrgent = value === "sin_asignar" && count > 0;
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center justify-center gap-1 rounded-full px-1 text-[12px] data-[state=active]:bg-white data-[state=active]:text-greenSecondary data-[state=active]:shadow-sm"
                >
                  <span className="truncate">{label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                        isUrgent
                          ? "bg-red-500 text-white"
                          : "bg-greenPrimary/15 text-greenSecondary",
                      )}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="min-h-0 flex-1 [&>div>div]:!block">
        {isLoading ? (
          <div className="space-y-1 px-2 py-1">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-2 py-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <MessageCircle className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              No hay conversaciones
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Probá con otra cola o pestaña.
            </p>
          </div>
        ) : (
          <div className="pb-2">
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                selected={conversation.id === selectedId}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </section>
  );
}

interface ConversationListItemProps {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
}

export function ConversationListItem({
  conversation,
  selected,
  onSelect,
}: ConversationListItemProps) {
  const identity = getConversationDisplayIdentity(conversation);
  const urgent =
    conversation.priority === "urgent" ||
    (conversation.status === "awaiting_human" &&
      !conversation.assignedToUserId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-center gap-3 px-3 py-3 text-left transition-colors",
        "hover:bg-gray-50",
        selected && "bg-greenPrimary/[0.07] hover:bg-greenPrimary/[0.07]",
      )}
    >
      {selected && (
        <span className="absolute inset-y-0 left-0 w-[3px] rounded-r bg-greenPrimary" />
      )}
      <div className="relative">
        <Avatar
          name={identity.avatarName}
          imageUrl={identity.profileImageUrl}
        />
        {conversation.unread && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-greenPrimary" />
        )}
      </div>
      <div className="min-w-0 flex-1 border-b border-gray-100 pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm text-gray-900",
              conversation.unread ? "font-semibold" : "font-medium",
            )}
          >
            {identity.displayName}
          </p>
          <span
            className={cn(
              "shrink-0 text-[11px]",
              conversation.unread
                ? "font-semibold text-greenPrimary"
                : "text-gray-400",
            )}
          >
            {formatRelative(
              conversation.lastMessageAt ?? conversation.createdAt,
            )}
          </span>
        </div>
        {identity.listContext && (
          <p className="mt-0.5 truncate text-[11px] leading-4 text-gray-400">
            {identity.listContext}
          </p>
        )}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-[13px] leading-5",
              conversation.unread
                ? "text-gray-700"
                : "text-gray-500",
            )}
          >
            {conversation.lastMessagePreview || "Sin mensajes disponibles"}
          </p>
          {urgent && (
            <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-px text-[10px] font-semibold text-white">
              Urgente
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-greenPrimary/10 px-2 py-0.5 text-[10.5px] font-medium text-greenSecondary">
            {QUEUE_LABELS[conversation.queue]}
          </span>
          <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-400">
            <StatusDot status={conversation.status} />
            {STATUS_LABELS[conversation.status]}
          </span>
        </div>
      </div>
    </button>
  );
}

interface QueueSelectorProps {
  value: ConversationQueue | "all";
  queues: QueueRouting[];
  onChange: (queue: ConversationQueue | "all") => void;
}

export function QueueSelector({ value, queues, onChange }: QueueSelectorProps) {
  if (queues.length <= 1) {
    return null;
  }

  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as ConversationQueue | "all")}
    >
      <SelectTrigger className="h-9 rounded-full border-0 bg-gray-100 text-sm shadow-none focus:ring-2 focus:ring-greenPrimary/30">
        <SelectValue placeholder="Cola" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las colas</SelectItem>
        {queues.map((queue) => (
          <SelectItem key={queue.queue} value={queue.queue}>
            {queue.displayName || QUEUE_LABELS[queue.queue]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* -------------------------------------------------------------------------- */
/*  Vista de conversación                                                      */
/* -------------------------------------------------------------------------- */

interface ConversationDetailViewProps {
  detail: ConversationDetail | undefined;
  queues: QueueRouting[];
  isLoading: boolean;
  mutations: ReturnType<typeof useConversationMutations>;
}

export function ConversationDetailView({
  detail,
  queues,
  isLoading,
  mutations,
}: ConversationDetailViewProps) {
  const [rerouteOpen, setRerouteOpen] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);

  if (isLoading) {
    return (
      <section
        className="flex min-h-0 flex-1 flex-col"
        style={CHAT_WALLPAPER}
      >
        <div className="h-[68px] border-b border-gray-200 bg-white" />
        <div className="flex-1 space-y-4 p-6">
          <Skeleton className="h-12 w-1/2 rounded-2xl" />
          <Skeleton className="ml-auto h-16 w-2/3 rounded-2xl" />
          <Skeleton className="h-12 w-2/5 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!detail) {
    return (
      <section
        className="flex min-h-0 flex-1 flex-col items-center justify-center border-b-4 border-greenPrimary/70"
        style={CHAT_WALLPAPER}
      >
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/70 shadow-sm">
            <MessageCircle className="h-9 w-9 text-greenPrimary" />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            Bandeja de WhatsApp
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Seleccioná una conversación de la izquierda para ver los mensajes y
            responder al paciente.
          </p>
        </div>
      </section>
    );
  }

  const canRespond = detail.status !== "closed";

  return (
    <section className="flex min-h-0 flex-1" style={CHAT_WALLPAPER}>
      <div className="flex min-h-0 flex-1 flex-col">
        <ConversationHeader
          conversation={detail}
          onTake={() => mutations.takeConversation.mutate()}
          onClose={() => mutations.closeConversation.mutate(undefined)}
          onReopen={() => mutations.reopenConversation.mutate()}
          onReroute={() => setRerouteOpen(true)}
          onOpenPatient={() => setPatientOpen(true)}
          isBusy={
            mutations.takeConversation.isPending ||
            mutations.closeConversation.isPending ||
            mutations.reopenConversation.isPending
          }
        />
        <MessageThread messages={detail.messages} />
        <MessageComposer
          disabled={
            !canRespond ||
            mutations.sendMessage.isPending ||
            mutations.sendMedia.isPending
          }
          onSend={(content) => mutations.sendMessage.mutateAsync({ content })}
          onSendMedia={(input) => mutations.sendMedia.mutateAsync(input)}
          onTyping={() => mutations.sendTyping.mutate()}
        />
      </div>
      <PatientContextSheet
        open={patientOpen}
        onOpenChange={setPatientOpen}
        conversation={detail}
        isSavingNote={mutations.addInternalNote.isPending}
        isSavingTags={mutations.updateTags.isPending}
        onAddNote={(content) => mutations.addInternalNote.mutate(content)}
        onUpdateTags={(tags) => mutations.updateTags.mutate(tags)}
      />
      <RerouteDialog
        open={rerouteOpen}
        queues={queues.filter((queue) => queue.queue !== detail.queue)}
        onOpenChange={setRerouteOpen}
        onSubmit={(input) => {
          mutations.rerouteConversation.mutate(input, {
            onSuccess: () => setRerouteOpen(false),
          });
        }}
        isPending={mutations.rerouteConversation.isPending}
      />
    </section>
  );
}

interface ConversationHeaderProps {
  conversation: ConversationDetail;
  isBusy: boolean;
  onTake: () => void;
  onClose: () => void;
  onReopen: () => void;
  onReroute: () => void;
  onOpenPatient: () => void;
}

function ConversationHeader({
  conversation,
  isBusy,
  onTake,
  onClose,
  onReopen,
  onReroute,
  onOpenPatient,
}: ConversationHeaderProps) {
  const identity = getConversationDisplayIdentity(conversation);

  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
      <button
        type="button"
        onClick={onOpenPatient}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 pr-2 text-left transition-colors hover:bg-gray-50"
      >
        <Avatar
          name={identity.avatarName}
          imageUrl={identity.profileImageUrl}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {identity.displayName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <StatusDot status={conversation.status} />
            <span className="truncate">
              {identity.headerContext} · {QUEUE_LABELS[conversation.queue]} ·{" "}
              {STATUS_LABELS[conversation.status]}
              {conversation.assignedToName
                ? ` · ${conversation.assignedToName}`
                : ""}
            </span>
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenPatient}
          aria-label="Datos del paciente"
          className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <FileText className="h-4 w-4" />
        </Button>

        {conversation.status === "closed" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onReopen}
            disabled={isBusy}
            className="rounded-full"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reabrir
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              onClick={onTake}
              disabled={isBusy}
              className="rounded-full bg-greenPrimary hover:bg-greenSecondary"
            >
              <Lock className="mr-2 h-4 w-4" />
              Tomar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Más acciones"
                  className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onReroute}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transferir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClose} disabled={isBusy}>
                  <Check className="mr-2 h-4 w-4" />
                  Cerrar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}

interface GroupedMessage {
  message: ConversationMessage;
  firstOfGroup: boolean;
  lastOfGroup: boolean;
  showDate: boolean;
}

const GROUP_GAP_MS = 5 * 60 * 1000;

function groupMessages(messages: ConversationMessage[]): GroupedMessage[] {
  return messages.map((message, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const sameSenderAsPrev =
      !!prev &&
      prev.direction === message.direction &&
      prev.sender === message.sender;
    const closeToPrev =
      !!prev &&
      new Date(message.createdAt).getTime() -
        new Date(prev.createdAt).getTime() <
        GROUP_GAP_MS;
    const sameDayAsPrev =
      !!prev && isSameDay(prev.createdAt, message.createdAt);

    const sameGroupAsNext =
      !!next &&
      next.direction === message.direction &&
      next.sender === message.sender &&
      isSameDay(next.createdAt, message.createdAt) &&
      new Date(next.createdAt).getTime() -
        new Date(message.createdAt).getTime() <
        GROUP_GAP_MS;

    return {
      message,
      firstOfGroup:
        !prev || !sameSenderAsPrev || !closeToPrev || !sameDayAsPrev,
      lastOfGroup: !sameGroupAsNext,
      showDate: !prev || !sameDayAsPrev,
    };
  });
}

export function MessageThread({
  messages,
}: {
  messages: ConversationMessage[];
}) {
  const grouped = useMemo(() => groupMessages(messages), [messages]);
  const conversationId = messages[0]?.conversationId ?? null;
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLElement | null>(null);
  const prevConvRef = useRef<string | null>(null);
  const lastLenRef = useRef(0);
  const [showJump, setShowJump] = useState(false);

  const getViewport = useCallback((): HTMLElement | null => {
    if (!viewportRef.current) {
      viewportRef.current =
        rootRef.current?.querySelector<HTMLElement>(
          "[data-radix-scroll-area-viewport]",
        ) ?? null;
    }
    return viewportRef.current;
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const viewport = getViewport();
      if (!viewport) return;
      viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    },
    [getViewport],
  );

  useEffect(() => {
    const viewport = getViewport();
    if (!viewport) return undefined;

    const onScroll = () => {
      const distance =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      setShowJump(distance > 240);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [getViewport]);

  useLayoutEffect(() => {
    const changedConversation = prevConvRef.current !== conversationId;
    const length = messages.length;
    const grew = !changedConversation && length > lastLenRef.current;
    prevConvRef.current = conversationId;
    lastLenRef.current = length;

    if (changedConversation) {
      // Esperar al pintado y bajar al último mensaje sí o sí.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => scrollToBottom("auto")),
      );
      return;
    }

    const viewport = getViewport();
    if (!viewport) {
      scrollToBottom("auto");
      return;
    }

    const distance =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    if (!grew || distance < 320) {
      requestAnimationFrame(() => scrollToBottom(grew ? "smooth" : "auto"));
    }
  }, [conversationId, messages.length, scrollToBottom, getViewport]);

  return (
    <div ref={rootRef} className="relative min-h-0 flex-1">
      <ScrollArea className="h-full [&>div>div]:!block">
        <div className="flex w-full flex-col px-4 py-5 sm:px-[8%]">
          {grouped.map(({ message, firstOfGroup, lastOfGroup, showDate }) => (
            <div key={message.id} className="flex flex-col">
              {showDate && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 shadow-sm">
                    {dateSeparatorLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={message}
                firstOfGroup={firstOfGroup}
                lastOfGroup={lastOfGroup}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      {showJump && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          aria-label="Ir al último mensaje"
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-greenPrimary shadow-md ring-1 ring-black/5 transition hover:bg-gray-50"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ConversationMessage;
  firstOfGroup?: boolean;
  lastOfGroup?: boolean;
}

function isMediaPlaceholder(message: ConversationMessage): boolean {
  return (
    !!message.mediaUrl &&
    /^\[(image|document|audio|video|sticker)\]$/i.test(
      message.content.trim(),
    )
  );
}

function MediaAttachment({ message }: { message: ConversationMessage }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const type = (message.mediaType ?? "").toLowerCase();

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setUrl(null);
    setFailed(false);
    getMessageMedia(message.conversationId, message.id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [message.conversationId, message.id]);

  if (failed) {
    return (
      <div className="mb-1 rounded-lg bg-black/5 px-3 py-2 text-[12px] text-gray-500">
        No se pudo cargar el adjunto
      </div>
    );
  }
  if (!url) {
    return (
      <div className="mb-1 h-40 w-56 max-w-full animate-pulse rounded-lg bg-black/5" />
    );
  }
  if (type === "image" || type === "sticker") {
    return (
      <ImageAttachmentPreview
        url={url}
        title={type === "sticker" ? "Sticker recibido" : "Imagen recibida"}
      />
    );
  }
  if (type === "audio") {
    return <audio controls src={url} className="mb-1 w-60 max-w-full" />;
  }
  if (type === "video") {
    return (
      <video
        controls
        src={url}
        className="mb-1 max-h-72 w-auto max-w-full rounded-lg"
      />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download
      className="mb-1 inline-flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-[13px] font-medium text-greenSecondary hover:bg-black/10"
    >
      <FileText className="h-4 w-4" />
      Abrir adjunto
    </a>
  );
}

function ImageAttachmentPreview({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-1 block max-w-full rounded-lg text-left outline-none ring-greenPrimary/40 transition hover:brightness-95 focus-visible:ring-2"
        aria-label={`Ver ${title.toLowerCase()}`}
      >
        <img
          src={url}
          alt={title}
          className="max-h-72 w-auto max-w-full rounded-lg object-cover"
        />
      </button>
      <DialogContent className="max-h-[92vh] max-w-[94vw] gap-3 border-white/10 bg-slate-950 p-3 text-white shadow-2xl sm:max-w-[88vw] sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Vista ampliada del adjunto recibido en la conversacion.
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[78vh] min-h-[220px] items-center justify-center overflow-hidden rounded-lg bg-black">
          <img
            src={url}
            alt={title}
            className="max-h-[78vh] max-w-full object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-white/70">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded-full bg-white/10 px-3 py-1.5 font-medium text-white transition hover:bg-white/20"
            >
              Abrir original
            </a>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-full px-3 text-xs text-white hover:bg-white/15 hover:text-white"
              >
                Cerrar
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MessageBubble({
  message,
  firstOfGroup = true,
  lastOfGroup = true,
}: MessageBubbleProps) {
  const inbound = message.direction === "inbound";
  const isBot = message.sender === "bot";
  const senderLabel =
    message.sender === "bot"
      ? "Bot Incor"
      : message.sender === "human"
        ? message.senderName ?? "Agente"
        : message.senderName ?? "Paciente";

  return (
    <div
      className={cn(
        "flex",
        inbound ? "justify-start" : "justify-end",
        lastOfGroup ? "mb-2.5" : "mb-0.5",
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] px-3 py-1.5 text-sm shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] sm:max-w-[65%]",
          "rounded-2xl",
          inbound
            ? "bg-white text-gray-900"
            : isBot
              ? "bg-[#e8f4ec] text-[#0c3f3f]"
              : "bg-[#d6efea] text-[#0c3f3f]",
          firstOfGroup && (inbound ? "rounded-tl-md" : "rounded-tr-md"),
        )}
      >
        {firstOfGroup && !inbound && (
          <div
            className={cn(
              "mb-0.5 flex items-center gap-1 text-[11px] font-semibold",
              isBot ? "text-emerald-700" : "text-greenSecondary",
            )}
          >
            {isBot ? (
              <Bot className="h-3.5 w-3.5" />
            ) : (
              <UserRound className="h-3.5 w-3.5" />
            )}
            {senderLabel}
          </div>
        )}
        {message.mediaUrl && <MediaAttachment message={message} />}
        {!isMediaPlaceholder(message) && (
          <p className="whitespace-pre-wrap break-words text-[14px] leading-[19px]">
            {message.content}
          </p>
        )}
        <div className="float-right ml-2 mt-1 flex translate-y-0.5 items-center gap-1 text-[10px] text-gray-400">
          <span>{formatTime(message.createdAt)}</span>
          {!inbound && <DeliveryStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function DeliveryStatus({ status }: { status: MessageStatus }) {
  if (status === "failed") {
    return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
  }
  if (status === "pending") {
    return <Clock3 className="h-3 w-3 text-gray-400" />;
  }
  if (status === "read") {
    return <CheckCheck className="h-3.5 w-3.5 text-sky-500" />;
  }
  if (status === "delivered") {
    return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
  }
  return <Check className="h-3.5 w-3.5 text-gray-400" />;
}

const MAX_ATTACHMENT_BYTES = 16 * 1024 * 1024;
const TYPING_PULSE_INTERVAL_MS = 8_000;

interface MessageComposerProps {
  disabled: boolean;
  onSend: (content: string) => Promise<unknown> | unknown;
  onSendMedia: (input: { file: File; caption?: string }) => Promise<unknown> | unknown;
  onTyping?: () => void;
}

export function MessageComposer({
  disabled,
  onSend,
  onSendMedia,
  onTyping,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingPulseRef = useRef(0);
  const trimmed = content.trim();
  const canSubmit = !disabled && !isSubmitting && (!!file || !!trimmed);

  const reset = () => {
    setContent("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pulseTyping = () => {
    if (disabled || isSubmitting || !onTyping) return;
    const now = Date.now();
    if (now - lastTypingPulseRef.current < TYPING_PULSE_INTERVAL_MS) return;
    lastTypingPulseRef.current = now;
    onTyping();
  };

  const submit = async () => {
    if (!canSubmit) return;
    pulseTyping();
    setIsSubmitting(true);
    try {
      if (file) {
        await onSendMedia({ file, caption: trimmed || undefined });
      } else {
        await onSend(trimmed);
      }
      reset();
    } catch {
      // El hook de mutación muestra el error. Mantener el borrador evita perder el adjunto.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_ATTACHMENT_BYTES) {
      toast.error("El archivo supera el límite de 16 MB");
      event.target.value = "";
      return;
    }
    setFile(selected);
    pulseTyping();
  };

  return (
    <div className="border-t border-gray-200 bg-[#f0f2f1] px-4 py-3">
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
          <Paperclip className="h-4 w-4 shrink-0 text-greenPrimary" />
          <span className="min-w-0 flex-1 truncate text-gray-700">
            {file.name}
          </span>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            aria-label="Quitar adjunto"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSubmitting}
          aria-label="Adjuntar archivo"
          className="h-11 w-11 shrink-0 rounded-full text-gray-500 hover:bg-gray-200"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <div className="flex-1 rounded-3xl bg-white shadow-sm">
          <Textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (event.target.value.trim()) {
                pulseTyping();
              }
            }}
            onFocus={() => {
              if (trimmed || file) pulseTyping();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            placeholder={
              disabled
                ? "Conversación cerrada"
                : file
                  ? "Agregá un comentario (opcional)"
                  : "Escribí un mensaje  ·  Enter para enviar, Shift+Enter para salto de línea"
            }
            className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <Button
          size="icon"
          onClick={() => void submit()}
          disabled={!canSubmit}
          aria-label="Enviar mensaje"
          className="h-11 w-11 shrink-0 rounded-full bg-greenPrimary hover:bg-greenSecondary disabled:bg-gray-300"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel de paciente                                                          */
/* -------------------------------------------------------------------------- */

interface PatientContextSheetProps extends PatientPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PatientContextSheet({
  open,
  onOpenChange,
  ...panelProps
}: PatientContextSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-gray-200 px-5 py-4">
          <SheetTitle>Datos del paciente</SheetTitle>
        </SheetHeader>
        <PatientPanel {...panelProps} />
      </SheetContent>
    </Sheet>
  );
}

interface PatientPanelProps {
  conversation: ConversationDetail;
  isSavingNote: boolean;
  isSavingTags: boolean;
  onAddNote: (content: string) => void;
  onUpdateTags: (tags: string[]) => void;
}

export function PatientPanel({
  conversation,
  isSavingNote,
  isSavingTags,
  onAddNote,
  onUpdateTags,
}: PatientPanelProps) {
  const [note, setNote] = useState("");
  const conversationTags = conversation.tags.join(", ");
  const [tags, setTags] = useState(conversationTags);
  const identity = getConversationDisplayIdentity(conversation);
  const parsedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  useEffect(() => {
    setTags(conversationTags);
  }, [conversationTags]);

  return (
    <aside className="min-h-0 bg-white">
      <div className="flex flex-col items-center gap-3 border-b border-gray-100 px-5 py-6 text-center">
        <Avatar
          name={identity.avatarName}
          imageUrl={identity.profileImageUrl}
          size="lg"
        />
        <div>
          <p className="text-base font-semibold text-gray-900">
            {identity.displayName}
          </p>
          {identity.panelContext && (
            <p className="mt-0.5 text-xs text-gray-500">
              {identity.panelContext}
            </p>
          )}
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="h-3.5 w-3.5" />
            {conversation.patient.phone}
          </p>
        </div>
      </div>

      <div className="space-y-6 p-5">
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Datos
          </h3>
          <div className="space-y-2 text-sm">
            {identity.whatsappName && (
              <InfoRow label="WhatsApp" value={identity.whatsappName} />
            )}
            {identity.declaredContactName &&
              identity.declaredContactName !== identity.displayName && (
                <InfoRow label="Declarado" value={identity.declaredContactName} />
              )}
            {identity.patientName &&
              identity.patientName !== identity.displayName && (
                <InfoRow label="Paciente" value={identity.patientName} />
              )}
            <InfoRow label="DNI" value={conversation.patient.dni ?? "Sin DNI"} />
            <InfoRow
              label="Obra social"
              value={conversation.patient.healthInsurance ?? "Sin dato"}
            />
            <InfoRow
              label="Email"
              value={conversation.patient.email ?? "Sin email"}
            />
          </div>
        </section>

        <Separator />

        <section>
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-greenPrimary" />
            <h3 className="text-sm font-semibold text-gray-900">
              Próximos turnos
            </h3>
          </div>
          {conversation.upcomingAppointments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
              No hay turnos próximos cargados para mostrar.
            </p>
          ) : (
            <div className="space-y-2">
              {conversation.upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.doctorName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {appointment.speciality}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-600">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDateTime(appointment.date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <Separator />

        <section>
          <div className="mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4 text-greenPrimary" />
            <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
          </div>
          <Input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="prioridad, comprobante"
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => onUpdateTags(parsedTags)}
            disabled={isSavingTags}
          >
            Guardar tags
          </Button>
        </section>

        <Separator />

        <section>
          <div className="mb-2 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-greenPrimary" />
            <h3 className="text-sm font-semibold text-gray-900">
              Notas internas
            </h3>
          </div>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Agregar nota para el equipo"
            className="min-h-[88px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={!note.trim() || isSavingNote}
            onClick={() => {
              onAddNote(note.trim());
              setNote("");
            }}
          >
            Agregar nota
          </Button>
          <div className="mt-3 space-y-2">
            {conversation.internalNotes.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs"
              >
                <p className="font-medium text-gray-800">{item.author}</p>
                <p className="mt-1 text-gray-600">{item.content}</p>
              </div>
            ))}
            {conversation.internalNotes.length === 0 && (
              <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                Todavía no hay notas internas.
              </p>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}

interface RerouteDialogProps {
  open: boolean;
  queues: QueueRouting[];
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { toQueue: ConversationQueue; reason?: string }) => void;
}

export function RerouteDialog({
  open,
  queues,
  isPending,
  onOpenChange,
  onSubmit,
}: RerouteDialogProps) {
  const [queue, setQueue] = useState<ConversationQueue | "">("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setQueue("");
      setReason("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir conversación</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select
            value={queue}
            onValueChange={(value) => setQueue(value as ConversationQueue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cola destino" />
            </SelectTrigger>
            <SelectContent>
              {queues.map((item) => (
                <SelectItem key={item.queue} value={item.queue}>
                  {item.displayName || QUEUE_LABELS[item.queue]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo interno"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!queue || isPending}
            onClick={() => {
              if (!queue) return;
              onSubmit({ toQueue: queue, reason: reason.trim() || undefined });
            }}
          >
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const result = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  return result || "?";
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function dateSeparatorLabel(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(value, now.toISOString())) return "Hoy";
  if (isSameDay(value, yesterday.toISOString())) return "Ayer";
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatRelative(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
