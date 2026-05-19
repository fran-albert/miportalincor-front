import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { environment } from "@/config/environment";
import {
  conversationKeys,
  listConversations,
} from "@/api/Conversations/conversations.api";
import {
  connectConversationsSocket,
  ConversationSocketEvents,
} from "@/services/conversations-socket.config";
import { InboxFilters } from "@/types/Conversations";

const PENDING_FILTERS: InboxFilters = { queue: "all", tab: "sin_asignar" };
const POLLING_INTERVAL = 60 * 1000;
const BATCH_WINDOW = 1500;

const conversationNotificationKeys = {
  pendingCount: [...conversationKeys.all, "pendingCount"] as const,
};

interface UseConversationNotificationsOptions {
  /** Si el usuario tiene permiso y el módulo está habilitado. */
  enabled?: boolean;
  /** Dispara toast/sonido/notificación/título. El Sidebar lo usa en false. */
  notify?: boolean;
}

interface IncomingInfo {
  name?: string;
  preview?: string;
}

function extractInfo(payload: unknown): IncomingInfo | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;
  const conversation = root.conversation as Record<string, unknown> | undefined;
  const patient = (root.patient ?? conversation?.patient) as
    | Record<string, unknown>
    | undefined;

  const first =
    typeof patient?.firstName === "string" ? patient.firstName : "";
  const last = typeof patient?.lastName === "string" ? patient.lastName : "";
  const composed = `${first} ${last}`.trim();
  const name =
    composed ||
    (typeof root.patientName === "string" ? root.patientName : undefined);

  const message = (root.message ?? root) as Record<string, unknown>;
  const preview =
    typeof message.content === "string"
      ? message.content
      : typeof root.lastMessagePreview === "string"
        ? root.lastMessagePreview
        : undefined;

  return { name: name || undefined, preview: preview || undefined };
}

let sharedAudioCtx: AudioContext | null = null;
let audioUnlockBound = false;

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/** Los navegadores bloquean el audio hasta que el usuario interactúa. */
function ensureAudioUnlock(): void {
  if (audioUnlockBound) return;
  audioUnlockBound = true;
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

function playPing(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }
    const now = ctx.currentTime;

    const play = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + start + duration,
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    play(880, 0, 0.16);
    play(1175, 0.13, 0.18);
  } catch {
    /* el audio es best-effort, nunca debe romper la app */
  }
}

export function useConversationNotifications(
  options: UseConversationNotificationsOptions = {},
) {
  const { enabled = true, notify = false } = options;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const liveEnabled =
    enabled && environment.CONVERSATIONS_ENABLED;
  const socketEnabled =
    liveEnabled && notify && !environment.CONVERSATIONS_MOCK;

  const { data } = useQuery({
    queryKey: conversationNotificationKeys.pendingCount,
    queryFn: () => listConversations(PENDING_FILTERS),
    enabled: liveEnabled,
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true,
    staleTime: 30 * 1000,
  });

  const pendingCount = data?.total ?? 0;

  const batchRef = useRef<{ count: number; last?: IncomingInfo }>({
    count: 0,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToConversations = useCallback(() => {
    window.focus();
    navigate("/conversaciones");
  }, [navigate]);

  const flush = useCallback(() => {
    const { count, last } = batchRef.current;
    batchRef.current = { count: 0 };
    timerRef.current = null;
    if (count <= 0) return;

    queryClient.invalidateQueries({
      queryKey: conversationNotificationKeys.pendingCount,
    });

    const title =
      count === 1
        ? "Nuevo mensaje de WhatsApp"
        : `${count} mensajes nuevos de WhatsApp`;
    const description =
      count === 1 && last?.name
        ? `${last.name}${last.preview ? `: ${last.preview}` : ""}`
        : "Hay conversaciones esperando respuesta del equipo.";

    toast.info(title, {
      description,
      action: { label: "Ver", onClick: goToConversations },
      duration: 8000,
    });

    playPing();

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      document.hidden
    ) {
      try {
        const notification = new Notification(title, {
          body: description,
          tag: "incor-conversaciones",
        });
        notification.onclick = () => {
          goToConversations();
          notification.close();
        };
      } catch {
        /* notificación best-effort */
      }
    }
  }, [queryClient, goToConversations]);

  const handleIncoming = useCallback(
    (payload?: unknown) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      const info = extractInfo(payload);
      batchRef.current.count += 1;
      if (info) batchRef.current.last = info;
      if (!timerRef.current) {
        timerRef.current = setTimeout(flush, BATCH_WINDOW);
      }
    },
    [queryClient, flush],
  );

  // Habilitar el audio en la primera interacción del usuario.
  useEffect(() => {
    if (liveEnabled && notify) ensureAudioUnlock();
  }, [liveEnabled, notify]);

  // Pedir permiso de notificaciones del navegador una sola vez.
  useEffect(() => {
    if (!socketEnabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
  }, [socketEnabled]);

  // Suscripción global al socket de conversaciones.
  useEffect(() => {
    if (!socketEnabled) return undefined;

    const socket = connectConversationsSocket();
    socket.on(ConversationSocketEvents.MESSAGE_RECEIVED, handleIncoming);
    socket.on(ConversationSocketEvents.CREATED, handleIncoming);
    socket.on(ConversationSocketEvents.ESCALATED, handleIncoming);

    return () => {
      socket.off(ConversationSocketEvents.MESSAGE_RECEIVED, handleIncoming);
      socket.off(ConversationSocketEvents.CREATED, handleIncoming);
      socket.off(ConversationSocketEvents.ESCALATED, handleIncoming);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [socketEnabled, handleIncoming]);

  // Contador en el título de la pestaña cuando está en segundo plano.
  useEffect(() => {
    if (!liveEnabled || !notify) return undefined;

    const baseTitle = document.title.replace(/^\(\d+\)\s*/, "");
    const apply = () => {
      document.title =
        pendingCount > 0 && document.hidden
          ? `(${pendingCount}) ${baseTitle}`
          : baseTitle;
    };

    apply();
    document.addEventListener("visibilitychange", apply);
    return () => {
      document.removeEventListener("visibilitychange", apply);
      document.title = baseTitle;
    };
  }, [liveEnabled, notify, pendingCount]);

  return {
    pendingCount,
    hasPending: pendingCount > 0,
  };
}
