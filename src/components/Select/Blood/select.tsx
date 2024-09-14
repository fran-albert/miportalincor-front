import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

interface BloodSelectProps {
  control: any;
  defaultValue?: string;
  disabled?: boolean;
}

export const BloodSelect = ({
  control,
  defaultValue,
  disabled,
}: BloodSelectProps) => {
  const bloodTypes = [
    { id: "A", name: "A" },
    { id: "B", name: "B" },
    { id: "O", name: "O" },
  ];

  return (
    <Controller
      name="bloodType"
      control={control}
      defaultValue={defaultValue || ""}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            disabled={disabled}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione el tipo de sangre..." />
            </SelectTrigger>
            <SelectContent>
              {bloodTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
};
