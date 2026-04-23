import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { normalizeDoctorUserId } from "./normalizeDoctorUserId";

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
  const validDoctors = doctors
    .map((doctor) => ({
      ...doctor,
      normalizedUserId: normalizeDoctorUserId(doctor.userId),
    }))
    .filter((doctor) => doctor.normalizedUserId !== null);
  const hiddenDoctorsCount = doctors.length - validDoctors.length;

  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            disabled={disabled || validDoctors.length === 0}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  validDoctors.length === 0
                    ? "No hay médicos válidos disponibles"
                    : "Seleccione el médico..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {validDoctors.map((doctor) => (
                <SelectItem
                  key={String(doctor.normalizedUserId)}
                  value={String(doctor.normalizedUserId)}
                >
                  {doctor.lastName}, {doctor.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {hiddenDoctorsCount > 0 ? (
        <p className="text-xs text-amber-700">
          Ocultamos {hiddenDoctorsCount} médico(s) sin `userId` válido para
          evitar errores al regenerar el informe.
        </p>
      ) : null}
    </div>
  );
};
