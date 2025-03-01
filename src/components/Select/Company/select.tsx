import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/hooks/Company/useCompanies";
import { Controller } from "react-hook-form";

interface Props {
  control: any;
  defaultValue?: { id: number; name: string; shortName: string } | null;
  disabled?: boolean;
}

export const CompanySelect = ({ control, defaultValue, disabled }: Props) => {
  const { companies } = useCompanies({ auth: true, fetch: true });

  return (
    <Controller
      name="idCompany"
      control={control}
      defaultValue={defaultValue || null}
      render={({ field }) => (
        <Select
          value={field.value?.toString() || ""}
          disabled={disabled}
          onValueChange={(value) => field.onChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione la empresa..." />
          </SelectTrigger>
          <SelectContent>
            {companies.map((unit) => (
              <SelectItem key={unit.id} value={unit.id.toString()}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
};
