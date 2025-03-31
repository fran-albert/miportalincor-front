import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { Controller } from "react-hook-form";

interface Props {
  control: any;
  disabled?: boolean;
}

export const DoctorSelect = ({ control, disabled }: Props) => {
  const { doctors } = useDoctors({ auth: true, fetchDoctors: true });

  return (
    <Controller
      name="DoctorId"
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
                key={doctor.id?.toString() || `doctor-${index}`}
                value={String(doctor.id || index)}
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
