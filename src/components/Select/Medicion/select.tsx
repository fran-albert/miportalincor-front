import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, Control, FieldValues } from "react-hook-form";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";

interface Props {
  control: Control<FieldValues>;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
}

interface MedicionInputsProps {
  onMedicionChange: (medicionId: string, value: string) => void;
  disabled?: boolean;
}

// Nuevo componente para inputs directos de mediciones
export const MedicionInputs = ({ onMedicionChange, disabled }: MedicionInputsProps) => {
  const { data: medicionesData, isLoading } = useDataTypes({
    auth: true,
    fetch: true,
    categories: ["MEDICION"],
    apiType: "incor",
  });

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-xs text-gray-500">Cargando parámetros...</p>
      </div>
    );
  }

  if (!medicionesData || medicionesData.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No hay parámetros de medición disponibles</p>
      </div>
    );
  }

  // Función para obtener la unidad basada en el nombre
  const getUnit = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('presión') || lowerName.includes('presion')) return 'mmHg';
    if (lowerName.includes('frecuencia cardíaca') || lowerName.includes('frecuencia cardiaca')) return 'bpm';
    if (lowerName.includes('frecuencia respiratoria')) return 'rpm';
    if (lowerName.includes('temperatura')) return '°C';
    if (lowerName.includes('peso')) return 'kg';
    if (lowerName.includes('talla') || lowerName.includes('altura')) return 'cm';
    if (lowerName.includes('saturación') || lowerName.includes('saturacion')) return '%';
    if (lowerName.includes('glucosa') || lowerName.includes('glicemia')) return 'mg/dL';
    return '';
  };

  // Función para obtener placeholder basado en el nombre
  const getPlaceholder = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('presión sistólica') || lowerName.includes('presion sistolica')) return '120';
    if (lowerName.includes('presión diastólica') || lowerName.includes('presion diastolica')) return '80';
    if (lowerName.includes('frecuencia cardíaca') || lowerName.includes('frecuencia cardiaca')) return '72';
    if (lowerName.includes('frecuencia respiratoria')) return '16';
    if (lowerName.includes('temperatura')) return '36.5';
    if (lowerName.includes('peso')) return '70.5';
    if (lowerName.includes('talla') || lowerName.includes('altura')) return '170';
    if (lowerName.includes('saturación') || lowerName.includes('saturacion')) return '98';
    if (lowerName.includes('glucosa') || lowerName.includes('glicemia')) return '90';
    return '';
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-700 mb-4">
        💡 Completa solo los parámetros que necesites medir
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {medicionesData.map((medicion) => (
          <div key={medicion.id} className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              {medicion.name}
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                placeholder={getPlaceholder(medicion.name)}
                onChange={(e) => onMedicionChange(medicion.id.toString(), e.target.value)}
                className="text-sm h-8"
                disabled={disabled}
              />
              {getUnit(medicion.name) && (
                <span className="text-xs text-gray-500 min-w-fit">
                  {getUnit(medicion.name)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mantener el select original para compatibilidad
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
