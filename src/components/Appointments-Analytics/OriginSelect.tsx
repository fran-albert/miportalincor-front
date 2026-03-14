import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentOrigin, AppointmentOriginLabels } from "@/types/Appointment/Appointment";

interface OriginSelectProps {
  value?: AppointmentOrigin;
  onValueChange: (value?: AppointmentOrigin) => void;
}

export function OriginSelect({ value, onValueChange }: OriginSelectProps) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === "all" ? undefined : (nextValue as AppointmentOrigin))
      }
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Origen" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los orígenes</SelectItem>
        {Object.values(AppointmentOrigin).map((origin) => (
          <SelectItem key={origin} value={origin}>
            {AppointmentOriginLabels[origin]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
