import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";

interface Props {
  control: any;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
}

export const MedicionSelect = ({
  control,
  defaultValue,
  disabled,
  name = "mediciones",
  placeholder = "Seleccione mediciones...",
}: Props) => {
  const { data: medicionesData, isLoading } = useDataTypes({
    auth: true,
    fetch: true,
    categories: ["MEDICION"],
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
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {medicionesData?.map((medicion) => (
                <SelectItem key={medicion.id} value={medicion.id.toString()}>
                  {medicion.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
};
