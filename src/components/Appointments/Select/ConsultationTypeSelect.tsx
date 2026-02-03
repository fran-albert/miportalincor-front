import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConsultationTypes } from "@/hooks/ConsultationType";
import { Loader2 } from "lucide-react";

interface ConsultationTypeSelectProps {
  value?: number;
  onValueChange: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ConsultationTypeSelect = ({
  value,
  onValueChange,
  placeholder = "Tipo de consulta (opcional)",
  disabled = false,
}: ConsultationTypeSelectProps) => {
  const { consultationTypes, isLoading } = useConsultationTypes();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-gray-50">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Cargando tipos...</span>
      </div>
    );
  }

  return (
    <Select
      value={value?.toString() ?? ""}
      onValueChange={(val) => {
        if (val === "" || val === "none") {
          onValueChange(undefined);
        } else {
          onValueChange(parseInt(val, 10));
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-gray-500">Sin especificar</span>
        </SelectItem>
        {consultationTypes.map((type) => (
          <SelectItem key={type.id} value={type.id.toString()}>
            <div className="flex items-center gap-2">
              {type.color && (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: type.color }}
                />
              )}
              <span>{type.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ConsultationTypeSelect;
