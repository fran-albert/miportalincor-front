import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmStudyInbox } from "@/api/StudyInbox/confirm-study-inbox.action";
import { discardStudyInbox } from "@/api/StudyInbox/discard-study-inbox.action";
import { reprocessStudyInbox } from "@/api/StudyInbox/reprocess-study-inbox.action";
import { ingestStudyInbox } from "@/api/StudyInbox/ingest-study-inbox.action";
import { ConfirmStudyInboxPayload } from "@/types/StudyInbox/StudyInbox.types";
import { useToastContext } from "@/hooks/Toast/toast-context";

export const useStudyInboxMutations = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastContext();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["study-inbox"] });

  const confirm = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ConfirmStudyInboxPayload;
    }) => confirmStudyInbox(id, payload),
    onSuccess: () => {
      showSuccess("Estudio cargado", "El estudio se asoció al paciente.");
      invalidate();
    },
    onError: () =>
      showError("No se pudo cargar", "Revisá los datos e intentá de nuevo."),
  });

  const discard = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      discardStudyInbox(id, reason),
    onSuccess: () => {
      showSuccess("Estudio descartado");
      invalidate();
    },
    onError: () => showError("No se pudo descartar"),
  });

  const reprocess = useMutation({
    mutationFn: (id: string) => reprocessStudyInbox(id),
    onSuccess: () => {
      showSuccess("Reprocesado", "Se volvieron a detectar los datos.");
      invalidate();
    },
    onError: () => showError("No se pudo reprocesar"),
  });

  const ingest = useMutation({
    mutationFn: (file: File) => ingestStudyInbox(file),
    onSuccess: () => {
      showSuccess("PDF subido", "Quedó en la bandeja para revisar.");
      invalidate();
    },
    onError: () =>
      showError("No se pudo subir el PDF", "Verificá que sea un archivo PDF."),
  });

  return { confirm, discard, reprocess, ingest };
};
