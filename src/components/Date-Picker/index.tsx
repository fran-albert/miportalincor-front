import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import moment from "moment-timezone";
import "moment/locale/es";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
}

export default function CustomDatePicker({
  setStartDate,
  setValue,
  fieldName,
  disabled,
  initialDate = null,
}: CustomDatePickerProps) {
  const [date, setDate] = useState<moment.Moment | null>(
    initialDate ? moment(initialDate) : null
  );

  const [month, setMonth] = useState<number>(moment().month());
  const [year, setYear] = useState<number>(moment().year());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (date) {
      setMonth(date.month());
      setYear(date.year());
    }
  }, [date]);

  const handleDateChange = (newDate: Date | undefined) => {
    const momentDate = newDate ? moment(newDate) : null;
    setDate(momentDate);
    if (momentDate) {
      const formattedDateISO = momentDate.toISOString();
      setStartDate(momentDate.toDate());
      setValue(fieldName, formattedDateISO);
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
  const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              date.format("DD/MM/YYYY")
            ) : (
              <span>Selecciona una fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex justify-between items-center p-3">
            <Select value={month.toString()} onValueChange={handleMonthChange}>
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
              <Select value={year.toString()} onValueChange={handleYearChange}>
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
  );
}
