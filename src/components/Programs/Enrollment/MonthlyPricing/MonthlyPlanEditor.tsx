import { useMemo, useState } from "react";
import { AlertTriangle, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  calculateProgramPricing,
  formatCentsToArs,
} from "@/common/helpers/programMoney";
import {
  ProgramTariffType,
  ProgramTariffTypeLabels,
} from "@/types/Program/ProgramActivity";
import {
  canSendWhatsappNotice,
  ProgramMonthlyPlan,
  UpsertProgramMonthlyPlanDto,
} from "@/types/Program/ProgramMonthlyPlan";
import { WhatsappStatusBadge } from "./WhatsappStatusBadge";

const MAX_QUANTITY = 4_294_967_295;

interface MonthlyPlanEditorProps {
  plan: ProgramMonthlyPlan;
  isSaving: boolean;
  isSendingWhatsapp?: boolean;
  onSave: (dto: UpsertProgramMonthlyPlanDto) => Promise<void>;
  onSendWhatsapp?: (plan: ProgramMonthlyPlan) => void;
}

const quantityKey = (activityId: string | undefined, index: number) =>
  activityId ?? `deleted-snapshot-${index}`;

const isValidQuantity = (value: string) => {
  if (!/^\d+$/.test(value)) return false;
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity <= MAX_QUANTITY;
};

export default function MonthlyPlanEditor({
  plan,
  isSaving,
  isSendingWhatsapp = false,
  onSave,
  onSendWhatsapp,
}: MonthlyPlanEditorProps) {
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      plan.activities.map((activity, index) => [
        quantityKey(activity.activityId, index),
        activity.quantity.toString(),
      ])
    )
  );
  const hasDeletedSnapshot = plan.activities.some(
    (activity) => activity.activityId === undefined
  );
  const hasMissingPricing = plan.activities.some(
    (activity) =>
      !activity.pricingConfigured ||
      activity.tariffType === undefined ||
      activity.unitPriceCents === undefined
  );
  const hasInvalidQuantity = plan.activities.some((activity, index) =>
    !isValidQuantity(quantities[quantityKey(activity.activityId, index)] ?? "")
  );

  const calculation = useMemo(
    () =>
      calculateProgramPricing(
        plan.activities.map((activity, index) => ({
          activityId: activity.activityId,
          activityName: activity.activityName,
          tariffType: activity.tariffType ?? ProgramTariffType.PER_SESSION,
          unitPriceCents: activity.unitPriceCents ?? "0",
          quantity: isValidQuantity(
            quantities[quantityKey(activity.activityId, index)] ?? ""
          )
            ? Number(quantities[quantityKey(activity.activityId, index)])
            : 0,
        })),
        plan.discountBasisPoints
      ),
    [plan.activities, plan.discountBasisPoints, quantities]
  );

  const submit = async () => {
    if (hasDeletedSnapshot || hasMissingPricing || hasInvalidQuantity) return;
    await onSave({
      activities: plan.activities.map((activity, index) => ({
        activityId: activity.activityId!,
        quantity: Number(
          quantities[quantityKey(activity.activityId, index)]
        ),
      })),
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              Mes {plan.programMonthNumber} del programa
            </h2>
            {plan.persisted ? (
              <span className="text-xs text-slate-500">
                Revisión {plan.revision}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Cargá la cantidad prevista para este mes. El backend confirmará los
            importes al guardar.
          </p>
        </div>
        {plan.persisted ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            Aviso
            <WhatsappStatusBadge status={plan.whatsappStatus} />
          </div>
        ) : null}
      </div>

      {hasMissingPricing ? (
        <Alert className="m-4 border-amber-200 bg-amber-50 text-amber-900 sm:m-5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hay actividades sin arancel</AlertTitle>
          <AlertDescription>
            Un Admin o coordinador debe completar esos precios antes de guardar
            el primer mes.
          </AlertDescription>
        </Alert>
      ) : null}
      {hasDeletedSnapshot ? (
        <Alert className="m-4 border-slate-300 bg-slate-50 sm:m-5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Mes disponible sólo para consulta</AlertTitle>
          <AlertDescription>
            Una actividad de este snapshot fue eliminada. El historial se
            conserva, pero este mes no puede editarse.
          </AlertDescription>
        </Alert>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="min-w-44 pl-4 sm:pl-5">Actividad</TableHead>
            <TableHead className="min-w-36">Modalidad</TableHead>
            <TableHead className="w-32">Cantidad del mes</TableHead>
            <TableHead className="whitespace-nowrap text-right">Precio lista</TableHead>
            <TableHead className="whitespace-nowrap text-right">Subtotal lista</TableHead>
            <TableHead className="whitespace-nowrap text-right">Descuento</TableHead>
            <TableHead className="whitespace-nowrap pr-4 text-right sm:pr-5">
              Con descuento
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plan.activities.map((activity, index) => {
            const key = quantityKey(activity.activityId, index);
            const quantityValue = quantities[key] ?? "";
            const calculated = calculation.items[index];
            const isZero = quantityValue === "0";
            const pricingReady =
              activity.pricingConfigured &&
              activity.tariffType !== undefined &&
              activity.unitPriceCents !== undefined;

            return (
              <TableRow key={activity.id ?? key} className={cn(isZero && "text-slate-400")}>
                <TableCell className="pl-4 font-medium sm:pl-5">
                  {activity.activityName}
                </TableCell>
                <TableCell>
                  {activity.tariffType
                    ? ProgramTariffTypeLabels[activity.tariffType]
                    : "Sin arancel"}
                  {activity.tariffType === ProgramTariffType.MONTHLY_FIXED ? (
                    <span className="mt-0.5 block max-w-44 text-xs text-slate-500">
                      Una cantidad positiva cobra un único fijo.
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Cantidad de ${activity.activityName}`}
                    value={quantityValue}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    inputMode="numeric"
                    min={0}
                    step={1}
                    disabled={hasDeletedSnapshot}
                    aria-invalid={!isValidQuantity(quantityValue)}
                    className="w-24 tabular-nums"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {pricingReady
                    ? formatCentsToArs(activity.unitPriceCents!)
                    : "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {pricingReady
                    ? formatCentsToArs(calculated.listSubtotalCents)
                    : "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {pricingReady ? (
                    <>
                      <span className="block text-xs text-slate-500">
                        {plan.discountPercent}%
                      </span>
                      − {formatCentsToArs(calculated.discountAmountCents)}
                    </>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap pr-4 text-right font-semibold tabular-nums text-slate-950 sm:pr-5">
                  {pricingReady
                    ? formatCentsToArs(calculated.discountedSubtotalCents)
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="pl-4 font-semibold sm:pl-5">
              Total del mes
            </TableCell>
            <TableCell className="whitespace-nowrap text-right tabular-nums">
              {formatCentsToArs(calculation.listTotalCents)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-right tabular-nums text-slate-500">
              − {formatCentsToArs(calculation.discountAmountCents)}
            </TableCell>
            <TableCell className="whitespace-nowrap pr-4 text-right text-base font-bold tabular-nums text-emerald-800 sm:pr-5">
              {formatCentsToArs(calculation.discountedTotalCents)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">
          Los precios y el descuento quedarán congelados para este mes. Guardar
          no le avisa nada al paciente.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {plan.persisted &&
          onSendWhatsapp &&
          canSendWhatsappNotice(plan.whatsappStatus) ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSendWhatsapp(plan)}
              disabled={isSendingWhatsapp}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSendingWhatsapp ? "Enviando..." : "Enviar aviso al paciente"}
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={submit}
            disabled={
              hasDeletedSnapshot ||
              hasMissingPricing ||
              hasInvalidQuantity ||
              isSaving
            }
          >
            {isSaving ? "Guardando..." : "Guardar plan del mes"}
          </Button>
        </div>
      </div>
    </section>
  );
}
