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
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchPatients } from "@/hooks/Patient/useSearchPatients";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/types/Patient/Patient";

interface PatientSelectProps {
  value?: number;
  onValueChange: (patientId: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PatientSelect = ({
  value,
  onValueChange,
  placeholder = "Seleccionar paciente",
  disabled = false,
  className
}: PatientSelectProps) => {
  const [open, setOpen] = useState(false);

  const { patients, isLoading, isFetching, search, setSearch } = useSearchPatients({
    enabled: true,
    debounceMs: 300
  });

  // Memoize selected patient
  const selectedPatient = useMemo(() =>
    patients?.find(p => Number(p.userId) === value),
    [patients, value]
  );

  // Memoize the select handler
  const handleSelect = useCallback((patient: Patient) => {
    const numericId = Number(patient.userId);
    onValueChange(numericId);
    setOpen(false);
  }, [onValueChange]);

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
          {selectedPatient ? (
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {selectedPatient.firstName} {selectedPatient.lastName}
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
            placeholder="Buscar por nombre o DNI..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading || isFetching ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : search.length < 2 ? (
              <CommandEmpty>
                Ingrese al menos 2 caracteres para buscar
              </CommandEmpty>
            ) : patients?.length === 0 ? (
              <CommandEmpty>No se encontraron pacientes</CommandEmpty>
            ) : (
              <CommandGroup heading="Pacientes">
                {patients?.map((patient) => (
                  <CommandItem
                    key={patient.userId || patient.id}
                    value={patient.userId?.toString() || patient.id}
                    onSelect={() => handleSelect(patient)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === Number(patient.userId) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        DNI: {patient.userName}
                      </span>
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

export default PatientSelect;
