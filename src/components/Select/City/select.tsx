import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCity } from "@/hooks/City/useCity";
import { City } from "@/types/City/City";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";

interface CitySelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name?: Path<T>;
  idState: number;
  defaultValue?: City;
  onCityChange?: (value: City) => void;
  disabled?: boolean;
}

export const CitySelect = <T extends FieldValues = FieldValues>({
  control,
  name = "city" as Path<T>,
  idState,
  defaultValue,
  onCityChange,
  disabled,
}: CitySelectProps<T>) => {
  const { cities } = useCity({ idState });

  const handleValueChange = (cityId: string) => {
    const city = cities.find((c) => String(c.id) === cityId);
    if (city && onCityChange) {
      onCityChange(city);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: "Este campo es obligatorio" }}
      defaultValue={(defaultValue ? String(defaultValue.id) : "") as PathValue<T, Path<T>>}
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
              <SelectValue placeholder="Seleccione la localidad..." />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={String(city.id)} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
};
