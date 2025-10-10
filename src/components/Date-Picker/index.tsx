import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, X, AlertCircle } from "lucide-react";
import moment from "moment-timezone";
import "moment/locale/es";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UseFormSetValue } from "react-hook-form";
moment.locale("es");
interface CustomDatePickerProps {
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setValue: UseFormSetValue<any>;
  fieldName: string;
  initialDate?: Date | null;
  disabled?: boolean;
  compact?: boolean;
  whiteBg?: boolean;
}
export default function CustomDatePicker({
  setStartDate,
  setValue,
  fieldName,
  disabled,
  initialDate = null,
  compact = false,
  whiteBg = false,
}: CustomDatePickerProps) {
  const [date, setDate] = useState<moment.Moment | null>(
    initialDate ? moment(initialDate) : null
  );
  const [month, setMonth] = useState<number>(moment().month());
  const [year, setYear] = useState<number>(moment().year());
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputError, setInputError] = useState<boolean>(false);
  useEffect(() => {
    if (date) {
      setMonth(date.month());
      setYear(date.year());
      setInputValue(date.format("DD/MM/YYYY"));
    }
  }, [date]);
  const formatInput = (value: string) => {
    // Eliminar todo excepto números
    const cleaned = value.replace(/\D/g, "");
    // Aplicar formato DD/MM/YYYY solo para números puros
    if (cleaned.length >= 8) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
        4,
        8
      )}`;
    } else if (cleaned.length >= 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
        4
      )}`;
    } else if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };
  const validateDate = (dateString: string) => {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const [day, month, yearStr] = parts;
      // Crear fecha con validación estricta
      const parsedDate = moment(
        `${yearStr}-${month}-${day}`,
        "YYYY-MM-DD",
        true
      );
      if (parsedDate.isValid()) {
        setDate(parsedDate);
        setStartDate(parsedDate.toDate());
        setValue(fieldName, parsedDate.toISOString());
        setInputError(false);
        setMonth(parsedDate.month());
        setYear(parsedDate.year());
      } else {
        setInputError(true);
      }
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Detectar si el usuario está borrando
    const isDeleting = value.length < inputValue.length;
    // Si está borrando, permitir edición libre
    if (isDeleting) {
      // Solo eliminar caracteres no numéricos excepto /
      const cleaned = value.replace(/[^\d/]/g, "");
      setInputValue(cleaned);
      // Validar solo si tiene formato completo
      if (cleaned.length === 10 && cleaned.split("/").length === 3) {
        validateDate(cleaned);
      } else {
        setInputError(false);
      }
      return;
    }
    // Si está escribiendo, aplicar formato automático
    const cleaned = value.replace(/[^\d/]/g, "");
    const formatted = formatInput(cleaned);
    setInputValue(formatted);
    // Validar cuando complete el formato
    if (formatted.length === 10) {
      validateDate(formatted);
    } else {
      setInputError(false);
    }
  };
  const handleClear = () => {
    setInputValue("");
    setDate(null);
    setStartDate(undefined);
    setValue(fieldName, "");
    setInputError(false);
  };
  const handleDateChange = (newDate: Date | undefined) => {
    const momentDate = newDate ? moment(newDate) : null;
    setDate(momentDate);
    if (momentDate) {
      const formattedDateISO = momentDate.toISOString();
      setStartDate(momentDate.toDate());
      setValue(fieldName, formattedDateISO);
      setInputValue(momentDate.format("DD/MM/YYYY"));
      setInputError(false);
    }
    setIsOpen(false);
  };
  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value));
  };
  const handleYearChange = (value: string) => {
    setYear(parseInt(value));
  };
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const currentYear = moment().year();
  const years = Array.from({ length: 201 }, (_, i) => currentYear);

  if (compact) {
    return (
      <div className="w-full">
        <Input
          type="text"
          placeholder="DD/MM/AAAA"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn(
            "text-xs p-1 h-8",
            whiteBg && "bg-white",
            inputError && "border-red-500"
          )}
          maxLength={10}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="space-y-1 flex-1">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="DD/MM/AAAA"
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled}
              className={cn(
                inputValue && !disabled && "pr-8",
                whiteBg && "bg-white",
                inputError && "border-red-500 focus-visible:ring-red-500"
              )}
              maxLength={10}
            />
            {/* Botón para limpiar */}
            {inputValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400over:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Botón del calendario */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "shrink-0",
                  whiteBg && "bg-white hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex justify-between items-center p-3">
                <Select
                  value={month.toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((monthName, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Select
                    value={year.toString()}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {years.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={date?.toDate()}
                locale={es}
                onSelect={handleDateChange}
                month={moment({ year, month }).toDate()}
                onMonthChange={(newMonth) => {
                  const momentMonth = moment(newMonth);
                  setMonth(momentMonth.month());
                  setYear(momentMonth.year());
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Mensaje de error */}
        {inputError && (
          <p className="text-xs text-red-600 flex items-center gap-1 ml-1">
            <AlertCircle className="h-3 w-3" />
            Fecha inválida. Formato: DD/MM/AAAA
          </p>
        )}
      </div>
    </div>
  );
}
