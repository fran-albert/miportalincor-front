import { useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  centsToPesosInput,
  formatCentsToArs,
  isValidPesosInput,
  pesosInputToCents,
} from "@/common/helpers/programMoney";
import { useHealthInsurance } from "@/hooks/Health-Insurance/useHealthInsurance";
import { useProgramActivities } from "@/hooks/Program/useProgramActivities";
import {
  useProgramActivityCoverageMutations,
  useProgramActivityCoverages,
} from "@/hooks/Program/useProgramActivityCoverages";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";

interface ProgramCoverageSettingsProps {
  programId: string;
  canManage: boolean;
}

const isValidQuota = (value: string) =>
  /^\d+$/.test(value) && Number.isSafeInteger(Number(value));

export default function ProgramCoverageSettings({
  programId,
  canManage,
}: ProgramCoverageSettingsProps) {
  const { activities } = useProgramActivities(programId);
  const { healthInsurances } = useHealthInsurance({});
  const { data: coverages = [], isLoading } =
    useProgramActivityCoverages(programId);
  const { upsertMutation, deleteMutation } =
    useProgramActivityCoverageMutations(programId);
  const { showError, showSuccess } = useToastContext();

  const [activityId, setActivityId] = useState("");
  const [healthInsuranceId, setHealthInsuranceId] = useState("");
  const [quota, setQuota] = useState("");
  const [price, setPrice] = useState("");

  const sessionActivities = activities.filter(
    (activity) => activity.tariffType === ProgramTariffType.PER_SESSION
  );
  const isValid =
    activityId !== "" &&
    healthInsuranceId !== "" &&
    isValidQuota(quota) &&
    isValidPesosInput(price);

  const save = async () => {
    if (!isValid) return;
    try {
      await upsertMutation.mutateAsync({
        activityId,
        healthInsuranceId: Number(healthInsuranceId),
        dto: {
          coveredSessionsPerMonth: Number(quota),
          coveredUnitPriceCents: pesosInputToCents(price),
        },
      });
      showSuccess(
        "Cobertura guardada",
        "El arancel mensual ya la usa para calcular."
      );
      setQuota("");
      setPrice("");
    } catch {
      showError(
        "No se pudo guardar la cobertura",
        "Revisá los datos e intentá nuevamente."
      );
    }
  };

  const remove = async (coverageActivityId: string, insuranceId: number) => {
    try {
      await deleteMutation.mutateAsync({
        activityId: coverageActivityId,
        healthInsuranceId: insuranceId,
      });
      showSuccess(
        "Cobertura eliminada",
        "Esa actividad vuelve a cobrarse particular con esa obra social."
      );
    } catch {
      showError("No se pudo eliminar la cobertura", "Intentá nuevamente.");
    }
  };

  const editExisting = (
    coverageActivityId: string,
    insuranceId: number,
    coveredSessionsPerMonth: number,
    coveredUnitPriceCents: string
  ) => {
    setActivityId(coverageActivityId);
    setHealthInsuranceId(insuranceId.toString());
    setQuota(coveredSessionsPerMonth.toString());
    setPrice(centsToPesosInput(coveredUnitPriceCents));
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Cobertura por obra social
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Cupo mensual y precio por sesión que paga el paciente cuando entra
            por obra social. Sin fila, esa actividad se cobra particular.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando coberturas...</p>
      ) : coverages.length === 0 ? (
        <p className="text-sm text-slate-500">
          Todavía no hay coberturas cargadas.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actividad</TableHead>
              <TableHead>Obra social</TableHead>
              <TableHead className="text-right">Cupo mensual</TableHead>
              <TableHead className="text-right">Precio cubierto</TableHead>
              {canManage ? <TableHead /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {coverages.map((coverage) => (
              <TableRow key={coverage.id}>
                <TableCell className="font-medium">
                  {coverage.activityName}
                </TableCell>
                <TableCell>{coverage.healthInsuranceName ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {coverage.coveredSessionsPerMonth}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCentsToArs(coverage.coveredUnitPriceCents)}
                </TableCell>
                {canManage ? (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          editExisting(
                            coverage.activityId,
                            coverage.healthInsuranceId,
                            coverage.coveredSessionsPerMonth,
                            coverage.coveredUnitPriceCents
                          )
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Eliminar cobertura de ${coverage.activityName}`}
                        onClick={() =>
                          remove(
                            coverage.activityId,
                            coverage.healthInsuranceId
                          )
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {canManage ? (
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-end">
          <div className="w-full space-y-1 sm:w-52">
            <Label className="text-xs">Actividad</Label>
            <Select value={activityId} onValueChange={setActivityId}>
              <SelectTrigger aria-label="Actividad con cobertura">
                <SelectValue placeholder="Elegí una actividad" />
              </SelectTrigger>
              <SelectContent>
                {sessionActivities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-52">
            <Label className="text-xs">Obra social</Label>
            <Select
              value={healthInsuranceId}
              onValueChange={setHealthInsuranceId}
            >
              <SelectTrigger aria-label="Obra social de la cobertura">
                <SelectValue placeholder="Elegí una obra social" />
              </SelectTrigger>
              <SelectContent>
                {healthInsurances
                  .filter((insurance) => insurance.id !== undefined)
                  .map((insurance) => (
                    <SelectItem
                      key={insurance.id}
                      value={insurance.id!.toString()}
                    >
                      {insurance.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-28">
            <Label htmlFor="coverage-quota" className="text-xs">
              Cupo mensual
            </Label>
            <Input
              id="coverage-quota"
              value={quota}
              onChange={(event) => setQuota(event.target.value)}
              inputMode="numeric"
              aria-invalid={quota !== "" && !isValidQuota(quota)}
              className="tabular-nums"
            />
          </div>
          <div className="w-full space-y-1 sm:w-36">
            <Label htmlFor="coverage-price" className="text-xs">
              Precio cubierto
            </Label>
            <Input
              id="coverage-price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
              aria-invalid={price !== "" && !isValidPesosInput(price)}
              className="tabular-nums"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={save}
            disabled={!isValid || upsertMutation.isPending}
          >
            Guardar cobertura
          </Button>
        </div>
      ) : null}
    </div>
  );
}
