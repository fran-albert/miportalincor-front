import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHealthInsurance } from "@/hooks/Health-Insurance/useHealthInsurance";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { Controller } from "react-hook-form";

interface HealthInsuranceSelectProps {
  name?: string;
  defaultValue?: HealthInsurance;
  control: any;
  disabled?: boolean;
  onHealthInsuranceChange: (value: HealthInsurance) => void;
}

export const HealthInsuranceSelect = ({
  name = "healthInsurance",
  control,
  defaultValue,
  disabled,
  onHealthInsuranceChange,
}: HealthInsuranceSelectProps) => {
  const { healthInsurances } = useHealthInsurance({});

  const handleValueChange = (selectedId: string) => {
    const selectedHC = healthInsurances.find(
      (hi) => String(hi.id) === selectedId
    );
    if (onHealthInsuranceChange && selectedHC) {
      onHealthInsuranceChange(selectedHC);
    }
  };

  return (
    <Controller
      name={name}
      defaultValue={defaultValue?.id?.toString() || ""}
      control={control}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              handleValueChange(value);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar la obra..." />
            </SelectTrigger>
            <SelectContent>
              {healthInsurances.map((hi) => (
                <SelectItem key={String(hi.id)} value={String(hi.id)}>
                  {hi.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
};
