import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Info,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  ProgramMonthlyWhatsappStatus,
  ProgramPlanPeriodStatus,
  ProgramPlanPeriodStatusTitles,
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
  const [coveredQuantities, setCoveredQuantities] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      plan.activities.map((activity, index) => [
        quantityKey(activity.activityId, index),
        (activity.coveredQuantity ?? 0).toString(),
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
  const hasAnyCoverage = plan.activities.some(
    (activity) => activity.coverageAvailable
  );

  const coveredQuantityOf = (
    activityId: string | undefined,
    index: number
  ): number => {
    const activity = plan.activities[index];
    if (!activity.coverageAvailable) return 0;
    const raw = coveredQuantities[quantityKey(activityId, index)] ?? "";
    return isValidQuantity(raw) ? Number(raw) : 0;
  };

  const quantityOf = (activityId: string | undefined, index: number): number => {
    const raw = quantities[quantityKey(activityId, index)] ?? "";
    return isValidQuantity(raw) ? Number(raw) : 0;
  };

  // "Actualizar cantidades desde el plan" solo rellena el formulario: guardar
  // sigue siendo un acto aparte, y es lo único que puede mover la plata.
  const applyPlanSuggestion = () => {
    const suggested = plan.activities.map((activity, index) => {
      const key = quantityKey(activity.activityId, index);
      const quantity = activity.planSuggestedQuantity ?? 0;
      return { key, activity, quantity };
    });
    setQuantities((current) => ({
      ...current,
      ...Object.fromEntries(
        suggested.map(({ key, quantity }) => [key, quantity.toString()])
      ),
    }));
    setCoveredQuantities((current) => ({
      ...current,
      ...Object.fromEntries(
        suggested.map(({ key, activity, quantity }) => [
          key,
          activity.coverageAvailable
            ? Math.min(
                quantity,
                activity.coveredSessionsPerMonth ?? quantity
              ).toString()
            : "0",
        ])
      ),
    }));
  };

  const outdatedActivities = plan.activities.filter(
    (activity) =>
      activity.planSuggestedQuantity !== undefined &&
      activity.planSuggestedQuantity !== activity.quantity
  );
  const showPlanMismatch =
    plan.persisted && plan.planQuantitiesOutdated === true;
  const alreadyNotified =
    plan.whatsappStatus === ProgramMonthlyWhatsappStatus.SENT;

  const hasInvalidCoveredQuantity = plan.activities.some((activity, index) => {
    if (!activity.coverageAvailable) return false;
    const raw = coveredQuantities[quantityKey(activity.activityId, index)] ?? "";
    if (!isValidQuantity(raw)) return true;
    return Number(raw) > quantityOf(activity.activityId, index);
  });

  const calculation = useMemo(
    () =>
      calculateProgramPricing(
        plan.activities.map((activity, index) => ({
          activityId: activity.activityId,
          activityName: activity.activityName,
          tariffType: activity.tariffType ?? ProgramTariffType.PER_SESSION,
          unitPriceCents: activity.unitPriceCents ?? "0",
          quantity: quantityOf(activity.activityId, index),
          coveredQuantity: hasInvalidCoveredQuantity
            ? 0
            : coveredQuantityOf(activity.activityId, index),
          coveredUnitPriceCents: activity.coveredUnitPriceCents,
        })),
        plan.discountBasisPoints
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      plan.activities,
      plan.discountBasisPoints,
      quantities,
      coveredQuantities,
      hasInvalidCoveredQuantity,
    ]
  );

  const submit = async () => {
    if (
      hasDeletedSnapshot ||
      hasMissingPricing ||
      hasInvalidQuantity ||
      hasInvalidCoveredQuantity
    ) {
      return;
    }
    await onSave({
      activities: plan.activities.map((activity, index) => ({
        activityId: activity.activityId!,
        quantity: Number(
          quantities[quantityKey(activity.activityId, index)]
        ),
        ...(activity.coverageAvailable
          ? { coveredQuantity: coveredQuantityOf(activity.activityId, index) }
          : {}),
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

      {!plan.persisted &&
      plan.planStatus === ProgramPlanPeriodStatus.ACTIVE ? (
        <Alert className="m-4 border-sky-200 bg-sky-50 text-sky-900 sm:m-5">
          <ClipboardList className="h-4 w-4" />
          <AlertTitle>
            {ProgramPlanPeriodStatusTitles[ProgramPlanPeriodStatus.ACTIVE]}
          </AlertTitle>
          <AlertDescription>
            Revisalas antes de guardar: son una sugerencia y se pueden corregir.
            Guardar es lo que habilita avisarle al paciente.
          </AlertDescription>
        </Alert>
      ) : null}
      {plan.planStatus && plan.planStatus !== ProgramPlanPeriodStatus.ACTIVE ? (
        <Alert className="m-4 border-amber-200 bg-amber-50 text-amber-900 sm:m-5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {ProgramPlanPeriodStatusTitles[plan.planStatus]}
          </AlertTitle>
          <AlertDescription>
            {plan.planStatusMessage} Las cantidades arrancan en cero hasta que el
            plan cubra este mes.
          </AlertDescription>
        </Alert>
      ) : null}
      {showPlanMismatch ? (
        <Alert className="m-4 border-amber-200 bg-amber-50 text-amber-900 sm:m-5">
          <RefreshCw className="h-4 w-4" />
          <AlertTitle>
            El plan del paciente cambió después de guardar este mes
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {outdatedActivities.length > 0 ? (
                <ul className="list-disc pl-4">
                  {outdatedActivities.map((activity) => (
                    <li key={activity.id ?? activity.activityId}>
                      {activity.activityName}: {activity.quantity} guardadas,{" "}
                      {activity.planSuggestedQuantity} según el plan actual
                    </li>
                  ))}
                </ul>
              ) : null}
              {alreadyNotified ? (
                <p className="font-medium">
                  Al paciente ya se le informó el total de este mes. Si
                  actualizás las cantidades, hay que volver a avisarle.
                </p>
              ) : null}
              <p>
                Los valores guardados quedan como están hasta que actualices y
                guardes.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyPlanSuggestion}
              >
                Actualizar cantidades desde el plan
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      {plan.hasHealthInsurance ? (
        <Alert className="m-4 border-emerald-200 bg-emerald-50 text-emerald-900 sm:m-5">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Obra social: {plan.healthInsuranceName}</AlertTitle>
          <AlertDescription>
            {hasAnyCoverage
              ? "Las sesiones dentro del cupo se facturan al precio con cobertura; el resto va particular."
              : "Ninguna actividad de este programa tiene cobertura cargada para esta obra social: todo se cobra particular."}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="m-4 border-amber-200 bg-amber-50 text-amber-900 sm:m-5">
          <Info className="h-4 w-4" />
          <AlertTitle>El paciente no tiene obra social cargada</AlertTitle>
          <AlertDescription>
            Todas las sesiones se cobran como particulares. Cargá la obra social
            en la ficha del paciente para aplicar la cobertura.
          </AlertDescription>
        </Alert>
      )}
      {hasInvalidCoveredQuantity ? (
        <Alert className="m-4 border-red-200 bg-red-50 text-red-900 sm:m-5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Revisá las sesiones con obra social</AlertTitle>
          <AlertDescription>
            No pueden ser más que las sesiones del mes.
          </AlertDescription>
        </Alert>
      ) : null}
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
            <TableHead className="w-32">Sesiones del mes</TableHead>
            <TableHead className="w-36">De esas, con obra social</TableHead>
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
            const coveredValue = coveredQuantities[key] ?? "";
            const calculated = calculation.items[index];
            const isZero = quantityValue === "0";
            const coveredIsInvalid =
              activity.coverageAvailable &&
              (!isValidQuantity(coveredValue) ||
                Number(coveredValue) >
                  quantityOf(activity.activityId, index));
            const quotaExceeded =
              activity.coverageAvailable &&
              !coveredIsInvalid &&
              activity.coveredSessionsPerMonth !== undefined &&
              Number(coveredValue) > activity.coveredSessionsPerMonth;
            const pricingReady =
              activity.pricingConfigured &&
              activity.tariffType !== undefined &&
              activity.unitPriceCents !== undefined;
            const isMonthlyFixed =
              activity.tariffType === ProgramTariffType.MONTHLY_FIXED;

            return (
              <TableRow key={activity.id ?? key} className={cn(isZero && "text-slate-400")}>
                <TableCell className="pl-4 font-medium sm:pl-5">
                  {activity.activityName}
                </TableCell>
                <TableCell>
                  {activity.tariffType
                    ? ProgramTariffTypeLabels[activity.tariffType]
                    : "Sin arancel"}
                  {isMonthlyFixed ? (
                    <span className="mt-0.5 block max-w-44 text-xs text-slate-500">
                      Se cobra un único fijo, no por sesión.
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  {isMonthlyFixed ? (
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <Checkbox
                        aria-label={`Cobrar ${activity.activityName} este mes`}
                        checked={quantityOf(activity.activityId, index) > 0}
                        disabled={hasDeletedSnapshot}
                        onCheckedChange={(checked) =>
                          setQuantities((current) => ({
                            ...current,
                            [key]:
                              checked === true
                                ? isValidQuantity(quantityValue) &&
                                  Number(quantityValue) > 0
                                  ? quantityValue
                                  : "1"
                                : "0",
                          }))
                        }
                      />
                      Se cobra este mes
                    </label>
                  ) : (
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
                  )}
                </TableCell>
                <TableCell>
                  {activity.coverageAvailable ? (
                    <>
                      <Input
                        aria-label={`Sesiones con obra social de ${activity.activityName}`}
                        value={coveredValue}
                        onChange={(event) =>
                          setCoveredQuantities((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        inputMode="numeric"
                        min={0}
                        step={1}
                        disabled={hasDeletedSnapshot}
                        aria-invalid={coveredIsInvalid}
                        className="w-24 tabular-nums"
                      />
                      {activity.coveredSessionsPerMonth !== undefined ? (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Cupo {activity.coveredSessionsPerMonth}/mes
                        </span>
                      ) : null}
                      {quotaExceeded ? (
                        <span className="mt-0.5 block text-xs font-medium text-amber-700">
                          Supera el cupo
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">Sin cobertura</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {pricingReady
                    ? formatCentsToArs(activity.unitPriceCents!)
                    : "—"}
                  {activity.coverageAvailable && activity.coveredUnitPriceCents ? (
                    <span className="mt-0.5 block text-xs text-emerald-700">
                      OS {formatCentsToArs(activity.coveredUnitPriceCents)}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {pricingReady
                    ? formatCentsToArs(calculated.listSubtotalCents)
                    : "—"}
                  {pricingReady && calculated.coveredQuantity > 0 ? (
                    <span className="mt-0.5 block whitespace-nowrap text-xs text-slate-500">
                      {calculated.coveredQuantity} con obra social ×{" "}
                      {formatCentsToArs(activity.coveredUnitPriceCents!)} +{" "}
                      {calculated.privateQuantity} particulares ×{" "}
                      {formatCentsToArs(activity.unitPriceCents!)}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {pricingReady ? (
                    <>
                      <span className="block text-xs text-slate-500">
                        {calculated.discountBasisPoints / 100}%
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
            <TableCell colSpan={5} className="pl-4 font-semibold sm:pl-5">
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
              hasInvalidCoveredQuantity ||
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
