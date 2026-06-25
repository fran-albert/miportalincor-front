import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name?: Path<T>;
  disabled?: boolean;
}

export const DoctorSelect = <T extends FieldValues = FieldValues>({
  control,
  name = "DoctorId" as Path<T>,
  disabled,
}: Props<T>) => {
  const { doctors } = useDoctors({ auth: true, fetchDoctors: true });
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          value={field.value || ""}
          disabled={disabled}
          onValueChange={(value) => field.onChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione el médico..." />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor, index) => (
              <SelectItem
                key={doctor.userId?.toString() || `doctor-${index}`}
                value={String(doctor.userId || index)}
              >
                {doctor.lastName}, {doctor.firstName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
};
