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

interface MonthlyPricingTabProps {
  enrollmentId: string;
}

const currentPeriod = () => getArgentinaTodayDate().slice(0, 7);

const parsePeriod = (period: string) => {
  const [year, month] = period.split("-").map(Number);
  return { year, month };
};

const saveNotice = (status: ProgramMonthlyWhatsappStatus) => {
  switch (status) {
    case ProgramMonthlyWhatsappStatus.SENT:
      return "El aviso por WhatsApp fue enviado.";
    case ProgramMonthlyWhatsappStatus.PENDING:
      return "El aviso por WhatsApp quedó pendiente.";
    case ProgramMonthlyWhatsappStatus.FAILED:
      return "El plan quedó guardado. El aviso no pudo enviarse y podrá reintentarse.";
    case ProgramMonthlyWhatsappStatus.SKIPPED_NO_PHONE:
      return "El plan quedó guardado. El paciente no tiene un teléfono disponible.";
    case ProgramMonthlyWhatsappStatus.DISABLED:
      return "El plan quedó guardado. El aviso por WhatsApp está desactivado.";
  }
};

export default function MonthlyPricingTab({
  enrollmentId,
}: MonthlyPricingTabProps) {
  const [period, setPeriod] = useState(currentPeriod);
  const [retryingPeriod, setRetryingPeriod] = useState<string>();
  const { year, month } = parsePeriod(period);
  const monthlyPlan = useProgramMonthlyPlan(enrollmentId, year, month);
  const history = useProgramMonthlyPlans(enrollmentId);
  const { saveMutation, retryWhatsappMutation } =
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

  const retry = async (plan: ProgramMonthlyPlan) => {
    const periodKey = `${plan.periodYear}-${plan.periodMonth}`;
    setRetryingPeriod(periodKey);
    try {
      const updated = await retryWhatsappMutation.mutateAsync({
        year: plan.periodYear,
        month: plan.periodMonth,
      });
      if (updated.whatsappStatus === ProgramMonthlyWhatsappStatus.SENT) {
        showSuccess("Aviso enviado", "El WhatsApp fue entregado al canal de envío.");
      } else {
        showError(
          "El aviso todavía no pudo enviarse",
          "El plan económico sigue guardado sin cambios."
        );
      }
    } catch {
      showError(
        "No se pudo reintentar el aviso",
        "El plan económico sigue guardado sin cambios."
      );
    } finally {
      setRetryingPeriod(undefined);
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
          onSave={save}
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
          retryingPeriod={retryingPeriod}
          onRetry={retry}
        />
      )}
    </div>
  );
}
