import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCity } from "@/hooks/City/useCity";
import { City } from "@/types/City/City";
import { Controller } from "react-hook-form";

interface CitySelectProps {
  control: any;
  idState: number;
  defaultValue?: City;
  onCityChange?: (value: City) => void;
  disabled?: boolean;
}

export const CitySelect = ({
  control,
  idState,
  defaultValue,
  onCityChange,
  disabled,
}: CitySelectProps) => {
  const { cities } = useCity({ idState });

  const handleValueChange = (cityId: string) => {
    const city = cities.find((c) => String(c.id) === cityId);
    if (city) {
      onCityChange && onCityChange(city);
    }
  };

  return (
    <Controller
      name="city"
      control={control}
      rules={{ required: "Este campo es obligatorio" }}
      defaultValue={defaultValue ? String(defaultValue.id) : ""}
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
