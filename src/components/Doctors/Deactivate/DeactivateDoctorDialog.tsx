import { useState } from "react";
import { isAxiosError } from "axios";
import { AlertTriangle, Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ActionIcon from "@/components/Icons/action";
import {
  useDeactivateDoctor,
  useDoctorPendingFuture,
} from "@/hooks/Doctor/useDoctorActivation";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { DeactivateDoctorConflict } from "@/api/Doctor/deactivate-doctor.action";
import {
  CHECK_FAILED_MESSAGE,
  DEACTIVATE_EXPLANATION,
  PendingSummary,
  pendingMessage,
} from "./messages";

interface DeactivateDoctorDialogProps {
  /** Id que espera la API de historia (`PATCH /doctor/:id/deactivate`). */
  doctorId: string;
  /** userId numérico legacy: el que usa la API de turnos. */
  legacyUserId?: number;
  doctorName: string;
}

const isConflictBody = (data: unknown): data is DeactivateDoctorConflict =>
  typeof data === "object" &&
  data !== null &&
  "pendingAppointments" in data &&
  "pendingOverturns" in data;

export default function DeactivateDoctorDialog({
  doctorId,
  legacyUserId,
  doctorName,
}: DeactivateDoctorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conflict, setConflict] = useState<PendingSummary | null>(null);
  const [deactivateFailed, setDeactivateFailed] = useState(false);

  const hasLegacyId = typeof legacyUserId === "number" && legacyUserId > 0;
  const pendingQuery = useDoctorPendingFuture(legacyUserId ?? 0, isOpen && hasLegacyId);
  const deactivateMutation = useDeactivateDoctor();
  const { showSuccess, showError } = useToastContext();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConflict(null);
      setDeactivateFailed(false);
      deactivateMutation.reset();
    }
  };

  const pending: PendingSummary | null =
    conflict ??
    (pendingQuery.data && pendingQuery.data.total > 0 ? pendingQuery.data : null);
  const isChecking = hasLegacyId && pendingQuery.isLoading;
  const checkFailed = deactivateFailed || (hasLegacyId && pendingQuery.isError);
  const canDeactivate =
    !isChecking && !checkFailed && !pending && !deactivateMutation.isPending;

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(doctorId);
      showSuccess("Médico desactivado", `${doctorName} ya no aparece en agendas ni listados.`);
      handleOpenChange(false);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const body: unknown = error.response.data;
        if (isConflictBody(body)) {
          setConflict({
            appointments: body.pendingAppointments,
            overturns: body.pendingOverturns,
            total: body.pendingAppointments + body.pendingOverturns,
            nextDate: body.nextDate,
          });
          return;
        }
      }
      if (isAxiosError(error) && error.response?.status === 503) {
        setDeactivateFailed(true);
        return;
      }
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      showError("No se pudo desactivar", message ?? "Probá de nuevo en un rato.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Desactivar">
          <ActionIcon
            tooltip="Desactivar"
            icon={<UserX className="h-4 w-4 text-gray-600" />}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Desactivar médico</DialogTitle>
          <DialogDescription>
            Vas a desactivar a <span className="font-medium text-gray-900">{doctorName}</span>.
            Lo podés reactivar cuando quieras desde "Ver desactivados".
          </DialogDescription>
        </DialogHeader>

        <div className="py-2" aria-live="polite">
          {isChecking ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Revisando turnos pendientes...
            </p>
          ) : checkFailed ? (
            <div
              role="alert"
              className="flex gap-2 rounded-md border bg-muted/40 p-3 text-sm text-gray-700"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>{CHECK_FAILED_MESSAGE}</p>
            </div>
          ) : pending ? (
            <div
              role="alert"
              className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            >
              <p className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{pendingMessage(pending)}</span>
              </p>
              <p className="pl-6 text-xs text-amber-800">
                Turnos: {pending.appointments} · Sobreturnos: {pending.overturns}
              </p>
            </div>
          ) : (
            <p className="rounded-md border bg-muted/40 p-3 text-sm text-gray-700">
              {DEACTIVATE_EXPLANATION}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-green-900"
            onClick={handleDeactivate}
            disabled={!canDeactivate}
          >
            {deactivateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
