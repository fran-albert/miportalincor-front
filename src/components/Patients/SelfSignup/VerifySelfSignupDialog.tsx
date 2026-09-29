import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useSelfSignupMutations } from "./useSelfSignupMutations";

interface Props {
  userId: string | number;
}

/**
 * "Datos verificados": recepción confirma que vio el DNI y la credencial de
 * la obra social. Guarda quién y cuándo, y el distintivo desaparece.
 */
export function VerifySelfSignupDialog({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [sawDni, setSawDni] = useState(false);
  const [sawCard, setSawCard] = useState(false);
  const { verifyMutation } = useSelfSignupMutations();
  const { showSuccess, showError } = useToastContext();

  const reset = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSawDni(false);
      setSawCard(false);
    }
  };

  const confirm = async () => {
    try {
      await verifyMutation.mutateAsync(userId);
      showSuccess("Datos verificados", "El paciente ya no figura como autoregistro.");
      reset(false);
    } catch {
      showError("No se pudo verificar", "Probá de nuevo en un momento.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-greenPrimary text-greenPrimary hover:bg-gray-50 hover:text-greenPrimary"
          data-testid="verify-self-signup"
        >
          <BadgeCheck className="h-4 w-4 mr-2" />
          Datos verificados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>¿Verificaste los datos?</DialogTitle>
          <DialogDescription>
            Antes de confirmar, corregí lo que haga falta en la ficha. Confirmá
            que viste en persona:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 cursor-pointer">
            <Checkbox
              checked={sawDni}
              onCheckedChange={(checked) => setSawDni(checked === true)}
              aria-label="Vi el DNI del paciente"
            />
            <span className="text-sm text-gray-800">Vi el DNI del paciente</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 cursor-pointer">
            <Checkbox
              checked={sawCard}
              onCheckedChange={(checked) => setSawCard(checked === true)}
              aria-label="Vi la credencial de la obra social"
            />
            <span className="text-sm text-gray-800">
              Vi la credencial de la obra social
            </span>
          </label>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => reset(false)}>
            Cancelar
          </Button>
          <Button
            variant="incor"
            disabled={!sawDni || !sawCard || verifyMutation.isPending}
            onClick={confirm}
            data-testid="verify-self-signup-confirm"
          >
            Confirmar verificación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
