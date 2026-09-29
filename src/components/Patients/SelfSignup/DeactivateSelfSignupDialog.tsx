import { useState } from "react";
import { UserX } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useSelfSignupMutations } from "./useSelfSignupMutations";

const MIN_REASON_LENGTH = 5;

interface Props {
  userId: string | number;
}

/**
 * "El DNI no es de esta persona": solo Admin. La cuenta deja de poder entrar;
 * no se borra ni la ficha ni los turnos.
 */
export function DeactivateSelfSignupDialog({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { deactivateMutation } = useSelfSignupMutations();
  const { showSuccess, showError } = useToastContext();
  const validReason = reason.trim().length >= MIN_REASON_LENGTH;

  const reset = (next: boolean) => {
    setOpen(next);
    if (!next) setReason("");
  };

  const confirm = async () => {
    try {
      await deactivateMutation.mutateAsync({ userId, reason: reason.trim() });
      showSuccess("Cuenta desactivada", "La ficha y los turnos no se borraron.");
      reset(false);
    } catch {
      showError("No se pudo desactivar", "Probá de nuevo en un momento.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="deactivate-self-signup"
        >
          <UserX className="h-4 w-4 mr-2" />
          El DNI no es de esta persona
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Desactivar cuenta</DialogTitle>
          <DialogDescription>
            Usalo solo si el DNI no es de la persona que se registró. La cuenta
            deja de poder entrar a Mi Portal; la ficha y los turnos no se
            borran. No crees otra ficha: el caso se resuelve unificando datos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="deactivate-reason">Motivo</Label>
          <Textarea
            id="deactivate-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej: la titular del DNI se presentó en recepción"
            rows={3}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => reset(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!validReason || deactivateMutation.isPending}
            onClick={confirm}
            data-testid="deactivate-self-signup-confirm"
          >
            Desactivar cuenta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
