import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";

interface AntecedentesSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  defaultValue?: string;
  disabled?: boolean;
  name?: Path<T>;
  placeholder?: string;
}

export const AntecedentesSelect = <T extends FieldValues = FieldValues>({
  control,
  defaultValue,
  disabled,
  name = "antecedentes" as Path<T>,
  placeholder = "Seleccione antecedentes...",
}: AntecedentesSelectProps<T>) => {
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
      defaultValue={(defaultValue || "") as PathValue<T, Path<T>>}
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
                <SelectItem
                  key={antecedente.id}
                  value={antecedente.id.toString()}
                >
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
