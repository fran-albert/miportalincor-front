import { useState, useMemo, useCallback } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { Skeleton } from "@/components/ui/skeleton";

interface DoctorSelectProps {
  value?: number;
  onValueChange: (doctorId: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DoctorSelect = ({
  value,
  onValueChange,
  placeholder = "Seleccionar médico",
  disabled = false,
  className
}: DoctorSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { doctors, isLoading } = useDoctors({ auth: true, fetchDoctors: true });

  // Memoize filtered doctors to prevent recalculation on every render
  const filteredDoctors = useMemo(() => {
    if (!search) return doctors;
    const searchLower = search.toLowerCase();
    return doctors.filter(doctor => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [doctors, search]);

  // Memoize selected doctor
  const selectedDoctor = useMemo(() =>
    doctors.find(d => Number(d.userId) === value),
    [doctors, value]
  );

  // Memoize the select handler
  const handleSelect = useCallback((doctor: typeof doctors[0]) => {
    const numericId = Number(doctor.userId);
    onValueChange(numericId);
    setOpen(false);
  }, [onValueChange]);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedDoctor ? (
            <span className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar médico..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredDoctors.length === 0 ? (
              <CommandEmpty>No se encontraron médicos</CommandEmpty>
            ) : (
              <CommandGroup heading="Médicos">
                {filteredDoctors.map((doctor) => (
                  <CommandItem
                    key={doctor.id}
                    value={doctor.userId?.toString() || doctor.id}
                    onSelect={() => handleSelect(doctor)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === Number(doctor.userId) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </span>
                      {doctor.specialities && doctor.specialities.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {doctor.specialities.map(s => s.name).join(", ")}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DoctorSelect;
