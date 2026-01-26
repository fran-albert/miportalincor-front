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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, User, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchPatients } from "@/hooks/Patient/useSearchPatients";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient } from "@/types/Patient/Patient";

export interface GuestData {
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface PatientSelectWithGuestOptionProps {
  value?: number;
  onValueChange: (patientId: number) => void;
  /** Called when user decides to create guest appointment */
  onGuestSelect: (guestData: GuestData) => void;
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
  onGuestSelect,
  placeholder = "Seleccionar paciente",
  disabled = false,
  className,
  defaultPatient,
  allowGuestCreation = true,
}: PatientSelectWithGuestOptionProps) => {
  const [open, setOpen] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestData, setGuestData] = useState<GuestData>({
    documentNumber: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const { patients, isLoading, isFetching, search, setSearch } = useSearchPatients({
    enabled: true,
    debounceMs: 300,
    minSearchLength: 7,
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
    setOpen(false);
    setShowGuestForm(false);
  }, [onValueChange]);

  const handleCreateGuestClick = useCallback(() => {
    setGuestData({
      documentNumber: search,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setShowGuestForm(true);
  }, [search]);

  const handleGuestSubmit = useCallback(() => {
    if (guestData.firstName && guestData.lastName && guestData.phone) {
      onGuestSelect(guestData);
      setOpen(false);
      setShowGuestForm(false);
    }
  }, [guestData, onGuestSelect]);

  const handleCancelGuest = useCallback(() => {
    setShowGuestForm(false);
    setGuestData({
      documentNumber: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
  }, []);

  const noResultsAndCanCreateGuest =
    allowGuestCreation &&
    search.length >= 7 &&
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
        {showGuestForm ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-purple-500" />
                Turno Rápido (Invitado)
              </h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelGuest}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              DNI: <strong>{guestData.documentNumber}</strong>
            </p>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Nombre"
                  value={guestData.firstName}
                  onChange={(e) => setGuestData({ ...guestData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Apellido"
                  value={guestData.lastName}
                  onChange={(e) => setGuestData({ ...guestData, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  placeholder="Teléfono"
                  value={guestData.phone}
                  onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={guestData.email}
                  onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelGuest}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleGuestSubmit}
                disabled={!guestData.firstName || !guestData.lastName || !guestData.phone}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Crear como Invitado
              </Button>
            </div>
          </div>
        ) : (
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
              ) : search.length < 7 ? (
                <CommandEmpty>
                  Ingrese al menos 7 dígitos del DNI
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
                      onClick={handleCreateGuestClick}
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
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PatientSelectWithGuestOption;
