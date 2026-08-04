import { Send } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentsToArs } from "@/common/helpers/programMoney";
import {
  ProgramTariffTypeLabels,
} from "@/types/Program/ProgramActivity";
import {
  canSendWhatsappNotice,
  ProgramMonthlyPlan,
  ProgramMonthlyWhatsappStatus,
} from "@/types/Program/ProgramMonthlyPlan";
import { WhatsappStatusBadge } from "./WhatsappStatusBadge";

const periodFormatter = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const savedAtFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Cordoba",
});

const formatPeriod = (year: number, month: number) =>
  periodFormatter.format(new Date(Date.UTC(year, month - 1, 1)));

interface MonthlyPlanHistoryProps {
  plans: ProgramMonthlyPlan[];
  isLoading: boolean;
  sendingPeriod?: string;
  onSendWhatsapp: (plan: ProgramMonthlyPlan) => void;
}

export default function MonthlyPlanHistory({
  plans,
  isLoading,
  sendingPeriod,
  onSendWhatsapp,
}: MonthlyPlanHistoryProps) {
  return (
    <section aria-labelledby="monthly-plan-history-title" className="space-y-3">
      <div>
        <h2
          id="monthly-plan-history-title"
          className="text-base font-semibold text-slate-950"
        >
          Historial mensual
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Cada mes conserva el precio y descuento vigentes cuando fue guardado.
        </p>
      </div>

      {isLoading ? (
        <p className="rounded-lg border border-slate-200 px-4 py-5 text-sm text-slate-500">
          Cargando historial...
        </p>
      ) : plans.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
          Todavía no hay meses guardados.
        </p>
      ) : (
        <Accordion type="single" collapsible className="rounded-xl border border-slate-200 bg-white px-4">
          {plans.map((plan) => {
            const periodKey = `${plan.periodYear}-${plan.periodMonth}`;
            return (
              <AccordionItem key={plan.id ?? periodKey} value={periodKey}>
                <AccordionTrigger className="gap-4 hover:no-underline">
                  <div className="flex min-w-0 flex-1 flex-col gap-2 pr-2 text-left sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="capitalize text-slate-950">
                        {formatPeriod(plan.periodYear, plan.periodMonth)}
                      </p>
                      <p className="mt-0.5 text-xs font-normal text-slate-500">
                        Mes {plan.programMonthNumber}
                        {plan.updatedAt
                          ? ` · Guardado ${savedAtFormatter.format(new Date(plan.updatedAt))}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <WhatsappStatusBadge status={plan.whatsappStatus} />
                      <span className="font-semibold tabular-nums text-slate-950">
                        {formatCentsToArs(plan.discountedTotalCents)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Actividad</TableHead>
                          <TableHead>Modalidad</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Precio congelado</TableHead>
                          <TableHead className="text-right">Subtotal lista</TableHead>
                          <TableHead className="text-right">Con descuento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plan.activities.map((activity, index) => (
                          <TableRow key={activity.id ?? `${periodKey}-${index}`}>
                            <TableCell className="font-medium">
                              {activity.activityName}
                            </TableCell>
                            <TableCell>
                              {activity.tariffType
                                ? ProgramTariffTypeLabels[activity.tariffType]
                                : "Sin arancel"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {activity.quantity}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {activity.unitPriceCents
                                ? formatCentsToArs(activity.unitPriceCents)
                                : "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {formatCentsToArs(activity.listSubtotalCents)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
                              {formatCentsToArs(
                                activity.discountedSubtotalCents
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {plan.whatsappLastError ? (
                        <p className="text-sm text-red-700">
                          {plan.whatsappLastError}
                        </p>
                      ) : (
                        <span />
                      )}
                      {canSendWhatsappNotice(plan.whatsappStatus) ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onSendWhatsapp(plan)}
                          disabled={sendingPeriod === periodKey}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {sendingPeriod === periodKey
                            ? "Enviando..."
                            : plan.whatsappStatus ===
                                ProgramMonthlyWhatsappStatus.NOT_REQUESTED
                              ? "Enviar aviso al paciente"
                              : "Reintentar aviso"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </section>
  );
}
