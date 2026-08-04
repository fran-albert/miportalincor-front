import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getArgentinaTodayDate } from "@/common/helpers/argentinaDate";
import {
  useProgramMonthlyPlan,
  useProgramMonthlyPlanMutations,
  useProgramMonthlyPlans,
} from "@/hooks/Program/useProgramMonthlyPlans";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  ProgramMonthlyPlan,
  ProgramMonthlyWhatsappStatus,
  UpsertProgramMonthlyPlanDto,
} from "@/types/Program/ProgramMonthlyPlan";
import MonthlyPlanEditor from "./MonthlyPlanEditor";
import MonthlyPlanHistory from "./MonthlyPlanHistory";
import SendWhatsappDialog from "./SendWhatsappDialog";

interface MonthlyPricingTabProps {
  enrollmentId: string;
  patientName: string;
}

const currentPeriod = () => getArgentinaTodayDate().slice(0, 7);

const parsePeriod = (period: string) => {
  const [year, month] = period.split("-").map(Number);
  return { year, month };
};

const periodKeyOf = (plan: ProgramMonthlyPlan) =>
  `${plan.periodYear}-${plan.periodMonth}`;

const saveNotice = (status: ProgramMonthlyWhatsappStatus) => {
  switch (status) {
    case ProgramMonthlyWhatsappStatus.NOT_REQUESTED:
      return "Plan guardado. El paciente todavía no fue avisado.";
    case ProgramMonthlyWhatsappStatus.SENT:
      return "El aviso por WhatsApp ya había sido enviado para esta revisión.";
    case ProgramMonthlyWhatsappStatus.PENDING:
      return "Plan guardado. El aviso quedó en curso.";
    case ProgramMonthlyWhatsappStatus.FAILED:
      return "Plan guardado. El último aviso no pudo enviarse y puede reintentarse.";
    case ProgramMonthlyWhatsappStatus.SKIPPED_NO_PHONE:
      return "Plan guardado. El paciente no tiene un teléfono disponible.";
    case ProgramMonthlyWhatsappStatus.DISABLED:
      return "Plan guardado. El aviso por WhatsApp está desactivado.";
  }
};

export default function MonthlyPricingTab({
  enrollmentId,
  patientName,
}: MonthlyPricingTabProps) {
  const [period, setPeriod] = useState(currentPeriod);
  const [planToNotify, setPlanToNotify] = useState<ProgramMonthlyPlan>();
  const [sendingPeriod, setSendingPeriod] = useState<string>();
  const { year, month } = parsePeriod(period);
  const monthlyPlan = useProgramMonthlyPlan(enrollmentId, year, month);
  const history = useProgramMonthlyPlans(enrollmentId);
  const { saveMutation, sendWhatsappMutation } =
    useProgramMonthlyPlanMutations(enrollmentId);
  const { showError, showSuccess } = useToastContext();

  const save = async (dto: UpsertProgramMonthlyPlanDto) => {
    try {
      const saved = await saveMutation.mutateAsync({ year, month, dto });
      showSuccess("Plan mensual guardado", saveNotice(saved.whatsappStatus));
    } catch {
      showError(
        "No se pudo guardar el plan mensual",
        "Revisá los datos e intentá nuevamente."
      );
    }
  };

  const confirmSend = async () => {
    if (!planToNotify) return;
    const plan = planToNotify;
    setSendingPeriod(periodKeyOf(plan));
    try {
      const updated = await sendWhatsappMutation.mutateAsync({
        year: plan.periodYear,
        month: plan.periodMonth,
      });
      setPlanToNotify(undefined);
      if (updated.whatsappStatus === ProgramMonthlyWhatsappStatus.SENT) {
        showSuccess(
          "Aviso enviado",
          "El WhatsApp fue entregado al canal de envío."
        );
      } else {
        showError(
          "El aviso no pudo enviarse",
          updated.whatsappLastError ??
            "El plan económico sigue guardado sin cambios."
        );
      }
    } catch {
      setPlanToNotify(undefined);
      showError(
        "No se pudo enviar el aviso",
        "El plan económico sigue guardado sin cambios."
      );
    } finally {
      setSendingPeriod(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Arancel mensual
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            El cálculo usa lo planificado para el mes, no las asistencias.
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="program-month-period">Mes a planificar</Label>
          <Input
            id="program-month-period"
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {monthlyPlan.isLoading ? (
        <p className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-500">
          Cargando arancel del mes...
        </p>
      ) : monthlyPlan.isError || !monthlyPlan.data ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo cargar el mes</AlertTitle>
          <AlertDescription>
            Verificá que el período pertenezca a la inscripción e intentá de
            nuevo.
          </AlertDescription>
        </Alert>
      ) : (
        <MonthlyPlanEditor
          key={`${monthlyPlan.data.id ?? "draft"}-${monthlyPlan.data.revision}-${period}`}
          plan={monthlyPlan.data}
          isSaving={saveMutation.isPending}
          isSendingWhatsapp={
            sendingPeriod === periodKeyOf(monthlyPlan.data)
          }
          onSave={save}
          onSendWhatsapp={setPlanToNotify}
        />
      )}

      {history.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo cargar el historial</AlertTitle>
          <AlertDescription>Intentá nuevamente en unos instantes.</AlertDescription>
        </Alert>
      ) : (
        <MonthlyPlanHistory
          plans={history.data ?? []}
          isLoading={history.isLoading}
          sendingPeriod={sendingPeriod}
          onSendWhatsapp={setPlanToNotify}
        />
      )}

      <SendWhatsappDialog
        plan={planToNotify}
        patientName={patientName}
        isSending={sendWhatsappMutation.isPending}
        onConfirm={confirmSend}
        onCancel={() => setPlanToNotify(undefined)}
      />
    </div>
  );
}
