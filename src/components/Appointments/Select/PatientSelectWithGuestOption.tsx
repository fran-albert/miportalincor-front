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
import { Check, ChevronsUpDown, User, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchPatients } from "@/hooks/Patient/useSearchPatients";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/types/Patient/Patient";

interface PatientSelectWithGuestOptionProps {
  value?: number;
  onValueChange: (patientId: number) => void;
  onPatientSelect?: (patient: Patient) => void;
  /** Called when user wants to create a guest appointment - passes the searched DNI */
  onCreateGuestClick: (documentNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultPatient?: {
    userId: number;
    firstName: string;
    lastName: string;
    userName?: string;
  };
  /** If true, show option to create guest when no patient found */
  allowGuestCreation?: boolean;
}

export const PatientSelectWithGuestOption = ({
  value,
  onValueChange,
  onPatientSelect,
  onCreateGuestClick,
  placeholder = "Seleccionar paciente",
  disabled = false,
  className,
  defaultPatient,
  allowGuestCreation = true,
}: PatientSelectWithGuestOptionProps) => {
  const [open, setOpen] = useState(false);

  const { patients, isLoading, isFetching, search, setSearch } = useSearchPatients({
    enabled: true,
    debounceMs: 300,
    minSearchLength: 6,
  });

  // Memoize selected patient
  const selectedPatient = useMemo(() => {
    if (defaultPatient) {
      return defaultPatient as Patient;
    }
    const fromSearch = patients?.find(p => Number(p.userId) === value);
    return fromSearch || undefined;
  }, [patients, value, defaultPatient]);

  // Memoize the select handler
  const handleSelect = useCallback((patient: Patient) => {
    const numericId = Number(patient.userId);
    onValueChange(numericId);
    onPatientSelect?.(patient);
    setOpen(false);
  }, [onPatientSelect, onValueChange]);

  const handleCreateGuestClickInternal = useCallback(() => {
    onCreateGuestClick(search);
    setOpen(false);
  }, [search, onCreateGuestClick]);

  const noResultsAndCanCreateGuest =
    allowGuestCreation &&
    search.length >= 6 &&
    patients?.length === 0 &&
    !isLoading &&
    !isFetching;

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
            placeholder="Buscar por DNI..."
            value={search}
            onValueChange={(value) => setSearch(value.replace(/\D/g, ""))}
          />
          <CommandList>
            {isLoading || isFetching ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : search.length < 6 ? (
              <CommandEmpty>
                Ingrese al menos 6 dígitos del DNI
              </CommandEmpty>
            ) : noResultsAndCanCreateGuest ? (
              <div className="p-4 space-y-4">
                <div className="text-center text-muted-foreground">
                  <p>No se encontró paciente con</p>
                  <p className="font-semibold text-foreground">DNI {search}</p>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={handleCreateGuestClickInternal}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Crear Turno Rápido (Invitado)</p>
                      <p className="text-xs text-muted-foreground">Solo necesita nombre y teléfono</p>
                    </div>
                  </Button>
                </div>
              </div>
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

export default PatientSelectWithGuestOption;
