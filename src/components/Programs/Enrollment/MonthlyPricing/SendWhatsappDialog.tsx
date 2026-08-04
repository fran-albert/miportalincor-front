import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCentsToArs } from "@/common/helpers/programMoney";
import { ProgramMonthlyPlan } from "@/types/Program/ProgramMonthlyPlan";

const periodFormatter = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

interface SendWhatsappDialogProps {
  plan?: ProgramMonthlyPlan;
  patientName: string;
  isSending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SendWhatsappDialog({
  plan,
  patientName,
  isSending,
  onConfirm,
  onCancel,
}: SendWhatsappDialogProps) {
  return (
    <AlertDialog
      open={Boolean(plan)}
      onOpenChange={(open) => {
        if (!open && !isSending) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enviar aviso al paciente</AlertDialogTitle>
          <AlertDialogDescription>
            El paciente va a recibir un WhatsApp con el arancel del mes. Una vez
            enviado no se puede dar de baja.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {plan ? (
          <dl className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Paciente</dt>
              <dd className="font-medium text-slate-950">{patientName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Mes</dt>
              <dd className="font-medium capitalize text-slate-950">
                {periodFormatter.format(
                  new Date(Date.UTC(plan.periodYear, plan.periodMonth - 1, 1))
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Total que va a recibir</dt>
              <dd className="text-base font-bold tabular-nums text-emerald-800">
                {formatCentsToArs(plan.discountedTotalCents)}
              </dd>
            </div>
          </dl>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isSending ? "Enviando..." : "Enviar aviso"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
