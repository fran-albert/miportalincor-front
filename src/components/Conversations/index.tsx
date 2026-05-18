import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  Bot,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Lock,
  MoreHorizontal,
  MessageCircle,
  Phone,
  RefreshCcw,
  Search,
  Send,
  StickyNote,
  Tag,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  DialogContent,
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
  QUEUE_LABELS,
  QueueRouting,
  STATUS_LABELS,
} from "@/types/Conversations";
import { useConversationMutations } from "@/hooks/Conversations/useConversationMutations";

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

  return (
    <section className="flex min-h-0 flex-col border-r bg-white">
      <div className="space-y-3 border-b px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-950">Bandeja</h2>
            <p className="text-xs text-gray-500">
              {total} {total === 1 ? "caso visible" : "casos visibles"}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isFetching}
            aria-label="Actualizar conversaciones"
          >
            <RefreshCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={filters.search ?? ""}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Buscar por nombre, DNI o teléfono"
            className="pl-9"
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
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-gray-100 p-1">
            <TabsTrigger value="activas">Activas</TabsTrigger>
            <TabsTrigger value="mias">Mías</TabsTrigger>
            <TabsTrigger value="sin_asignar">Sin asignar</TabsTrigger>
            <TabsTrigger value="cerradas">Cerradas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-md" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
            <MessageCircle className="mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">No hay conversaciones</p>
            <p className="mt-1 text-xs text-gray-500">Probá con otra cola o pestaña.</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
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
  const name = getPatientName(conversation);
  const pending = conversation.status === "awaiting_human" && !conversation.assignedToUserId;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full gap-3 rounded-md border px-3 py-3 text-left transition-colors",
        "border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/40",
        selected && "border-teal-300 bg-teal-50/80 shadow-sm",
      )}
    >
      <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
        {initials(name)}
        {conversation.unread && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">{name}</p>
            <p className="truncate text-xs text-gray-500">
              {conversation.patient.dni ?? conversation.patient.phone}
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-gray-400">
            {formatRelative(conversation.lastMessageAt ?? conversation.createdAt)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-5 text-gray-600">
          {conversation.lastMessagePreview || "Sin mensajes disponibles"}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <QueueBadge queue={conversation.queue} />
          <StatusBadge status={conversation.status} />
          {pending && (
            <Badge className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50">
              Urgente
            </Badge>
          )}
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
    <Select value={value} onValueChange={(next) => onChange(next as ConversationQueue | "all")}>
      <SelectTrigger>
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
      <section className="flex min-h-0 flex-1 flex-col bg-[#f5f7f6]">
        <div className="space-y-4 p-4">
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-[420px] rounded-md" />
        </div>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="flex min-h-0 flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="mx-auto mb-3 h-9 w-9 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">
            Seleccioná una conversación
          </p>
        </div>
      </section>
    );
  }

  const canRespond = detail.status !== "closed";

  return (
    <section className="flex min-h-0 flex-1 bg-[#f5f7f6]">
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
          disabled={!canRespond || mutations.sendMessage.isPending}
          onSend={(content) => mutations.sendMessage.mutate({ content })}
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
  return (
    <div className="border-b bg-white px-5 py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-gray-950">
              {getPatientName(conversation)}
            </h2>
            <QueueBadge queue={conversation.queue} />
            <StatusBadge status={conversation.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {conversation.patient.phone}
            </span>
            {conversation.assignedToName && (
              <span className="inline-flex items-center gap-1">
                <UserRound className="h-3.5 w-3.5" />
                {conversation.assignedToName}
              </span>
            )}
            {conversation.zammadTicketId && (
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Ticket #{conversation.zammadTicketId}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onOpenPatient}>
            <FileText className="mr-2 h-4 w-4" />
            Datos
          </Button>
          {conversation.status === "closed" ? (
            <Button variant="outline" size="sm" onClick={onReopen} disabled={isBusy}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reabrir
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={onTake} disabled={isBusy}>
                <Lock className="mr-2 h-4 w-4" />
                Tomar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Más acciones">
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
    </div>
  );
}

export function MessageThread({ messages }: { messages: ConversationMessage[] }) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  );
}

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const inbound = message.direction === "inbound";
  const senderLabel =
    message.sender === "bot"
      ? "Bot"
      : message.sender === "human"
        ? message.senderName ?? "Agente"
        : message.senderName ?? "Paciente";

  return (
    <div className={cn("flex", inbound ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[78%] rounded-md border px-3 py-2 shadow-sm",
          inbound
            ? "border-gray-200 bg-white text-gray-900"
            : "border-teal-200 bg-[#E5F7F5] text-gray-950",
        )}
      >
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          {message.sender === "bot" ? (
            <Bot className="h-3.5 w-3.5" />
          ) : (
            <UserRound className="h-3.5 w-3.5" />
          )}
          {senderLabel}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-400">
          <span>{formatTime(message.createdAt)}</span>
          {!inbound && <span>{message.status === "failed" ? "!" : "✓"}</span>}
        </div>
      </div>
    </div>
  );
}

interface MessageComposerProps {
  disabled: boolean;
  onSend: (content: string) => void;
}

export function MessageComposer({ disabled, onSend }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const trimmed = content.trim();

  const submit = () => {
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setContent("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t bg-white px-5 py-4">
      <div className="mx-auto flex max-w-5xl items-end gap-2">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Conversación cerrada" : "Responder por WhatsApp"}
          className="max-h-36 min-h-[52px] resize-none rounded-md"
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={!trimmed || disabled}
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

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
        <SheetHeader className="border-b px-5 py-4">
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
    <aside className="min-h-0 bg-white p-5">
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-950">Paciente</h3>
          <div className="mt-3 space-y-2 text-sm">
            <InfoRow label="Nombre" value={getPatientName(conversation)} />
            <InfoRow label="DNI" value={conversation.patient.dni ?? "Sin DNI"} />
            <InfoRow label="Obra social" value={conversation.patient.healthInsurance ?? "Sin dato"} />
            <InfoRow label="Email" value={conversation.patient.email ?? "Sin email"} />
          </div>
        </section>

        <Separator />

        <section>
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-greenPrimary" />
            <h3 className="text-sm font-semibold text-gray-950">Próximos turnos</h3>
          </div>
          {conversation.upcomingAppointments.length === 0 ? (
            <p className="rounded-md border border-dashed bg-gray-50 p-3 text-sm text-gray-500">
              No hay turnos próximos cargados para mostrar.
            </p>
          ) : (
            <div className="space-y-2">
              {conversation.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-md border bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-950">
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
            <h3 className="text-sm font-semibold text-gray-950">Tags</h3>
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
            <h3 className="text-sm font-semibold text-gray-950">Notas internas</h3>
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
              <div key={item.id} className="rounded-md border bg-gray-50 p-2 text-xs">
                <p className="font-medium text-gray-800">{item.author}</p>
                <p className="mt-1 text-gray-600">{item.content}</p>
              </div>
            ))}
            {conversation.internalNotes.length === 0 && (
              <p className="rounded-md border border-dashed bg-gray-50 p-3 text-sm text-gray-500">
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
          <Select value={queue} onValueChange={(value) => setQueue(value as ConversationQueue)}>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}

function QueueBadge({ queue }: { queue: ConversationQueue }) {
  return (
    <Badge className="border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-50">
      {QUEUE_LABELS[queue]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: Conversation["status"] }) {
  const className =
    status === "awaiting_human"
      ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
      : status === "human_handled"
        ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
        : status === "closed"
          ? "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50";

  return (
    <Badge className={className}>
      {status === "awaiting_human" && <AlertCircle className="mr-1 h-3 w-3" />}
      {status === "bot_active" && <Bot className="mr-1 h-3 w-3" />}
      {status === "human_handled" && <UserRound className="mr-1 h-3 w-3" />}
      {status === "closed" && <Check className="mr-1 h-3 w-3" />}
      {STATUS_LABELS[status]}
    </Badge>
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

function getPatientName(conversation: Conversation): string {
  const name = [conversation.patient.firstName, conversation.patient.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || conversation.patient.phone;
}

function initials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatRelative(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
