import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";

interface AntecedentesSelectProps {
  control: any;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
}

export const AntecedentesSelect = ({
  control,
  defaultValue,
  disabled,
  name = "antecedentes",
  placeholder = "Seleccione antecedentes...",
}: AntecedentesSelectProps) => {
  const { data: antecedentesData, isLoading } = useDataTypes({
    auth: true,
    fetch: true,
    categories: ["ANTECEDENTES"],
    apiType: "incor",
  });

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || ""}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            disabled={disabled || isLoading}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {antecedentesData?.map((antecedente) => (
                <SelectItem key={antecedente.id} value={antecedente.id.toString()}>
                  {antecedente.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
};