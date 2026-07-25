import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useProgramPricing,
  useProgramPricingMutation,
} from "@/hooks/Program/useProgramPricing";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface ProgramPricingSettingsProps {
  programId: string;
  canManage: boolean;
}

interface DiscountEditorProps extends ProgramPricingSettingsProps {
  discountPercent: number;
}

const DiscountEditor = ({
  programId,
  canManage,
  discountPercent,
}: DiscountEditorProps) => {
  const [value, setValue] = useState(discountPercent.toString());
  const mutation = useProgramPricingMutation(programId);
  const { showSuccess, showError } = useToastContext();
  const parsedValue = Number(value);
  const isValid =
    value.trim() !== "" &&
    Number.isFinite(parsedValue) &&
    parsedValue >= 0 &&
    parsedValue <= 100 &&
    /^\d+(?:[.,]\d{1,2})?$/.test(value);

  const save = async () => {
    if (!isValid) return;
    try {
      await mutation.mutateAsync({ discountPercent: parsedValue });
      showSuccess("Descuento actualizado", `El programa aplica ${parsedValue}%.`);
    } catch {
      showError(
        "No se pudo actualizar el descuento",
        "Intentá nuevamente."
      );
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Descuento del programa
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Se aplica por rubro y queda congelado al guardar cada mes.
        </p>
      </div>
      {canManage ? (
        <div className="flex items-end gap-2">
          <div className="w-28 space-y-1">
            <Label htmlFor="program-discount" className="text-xs">
              Porcentaje
            </Label>
            <div className="relative">
              <Input
                id="program-discount"
                value={value}
                onChange={(event) => setValue(event.target.value.replace(",", "."))}
                inputMode="decimal"
                aria-invalid={!isValid}
                className="pr-7"
              />
              <span className="pointer-events-none absolute right-3 top-2 text-sm text-slate-500">
                %
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={save}
            disabled={!isValid || mutation.isPending}
          >
            Guardar
          </Button>
        </div>
      ) : (
        <span className="text-lg font-semibold tabular-nums text-slate-900">
          {discountPercent}%
        </span>
      )}
    </div>
  );
};

export default function ProgramPricingSettings({
  programId,
  canManage,
}: ProgramPricingSettingsProps) {
  const { data, isLoading, isError } = useProgramPricing(programId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando descuento...</p>;
  }
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        No se pudo cargar el descuento del programa.
      </p>
    );
  }

  return (
    <DiscountEditor
      key={data.discountBasisPoints}
      programId={programId}
      canManage={canManage}
      discountPercent={data.discountPercent}
    />
  );
}
