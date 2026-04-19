import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useConsultationTypes } from "@/hooks/ConsultationType";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Stethoscope, X } from "lucide-react";

interface ConsultationTypesMultiSelectProps {
  value?: number[];
  onValueChange: (value: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  doctorId?: number;
  requireDoctorSelection?: boolean;
}

const SCOPE_LABELS = {
  global: "Global",
  specialty: "Especialidad",
  doctor: "Propio",
} as const;

export const ConsultationTypesMultiSelect = ({
  value = [],
  onValueChange,
  placeholder = "Seleccionar tipos (opcional)",
  disabled = false,
  doctorId,
  requireDoctorSelection = false,
}: ConsultationTypesMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const effectiveDoctorId =
    requireDoctorSelection && !doctorId ? 0 : doctorId;
  const { consultationTypes, isLoading } = useConsultationTypes(
    typeof effectiveDoctorId === "number"
      ? { doctorId: effectiveDoctorId }
      : undefined,
  );

  const normalizedValue = useMemo(
    () => Array.from(new Set((value ?? []).filter((id) => typeof id === "number"))),
    [value]
  );
  const isBlockedUntilDoctorSelected = requireDoctorSelection && !doctorId;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTypes = normalizedSearch
    ? consultationTypes.filter((type) => {
        const haystack = `${type.name} ${type.description ?? ""}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : consultationTypes;

  const selectedTypes = consultationTypes.filter((type) =>
    normalizedValue.includes(type.id)
  );

  useEffect(() => {
    if (!isLoading && normalizedValue.length > 0) {
      const allowedTypeIds = new Set(consultationTypes.map((type) => type.id));
      const filteredValue = normalizedValue.filter((id) => allowedTypeIds.has(id));

      if (filteredValue.length !== normalizedValue.length) {
        onValueChange(filteredValue);
      }
    }
  }, [consultationTypes, isLoading, normalizedValue, onValueChange]);

  const toggleType = (typeId: number) => {
    if (normalizedValue.includes(typeId)) {
      onValueChange(normalizedValue.filter((id) => id !== typeId));
      return;
    }

    onValueChange([...normalizedValue, typeId]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-gray-50">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Cargando tipos...</span>
      </div>
    );
  }

  const triggerLabel =
    selectedTypes.length === 0
      ? placeholder
      : selectedTypes.length === 1
        ? selectedTypes[0].name
        : `${selectedTypes[0].name} +${selectedTypes.length - 1}`;

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSearch("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || isBlockedUntilDoctorSelected}
          >
            <span
              className={cn(
                "flex min-w-0 items-center gap-2 truncate",
                selectedTypes.length === 0 && "text-muted-foreground"
              )}
            >
              <Stethoscope className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {isBlockedUntilDoctorSelected
                  ? "Seleccionar medico primero"
                  : triggerLabel}
              </span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[420px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar tipos de turno..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList
              className="max-h-[320px] overscroll-contain"
              onWheelCapture={(event) => {
                event.stopPropagation();
              }}
            >
              <CommandGroup heading="Acciones">
                <CommandItem
                  value="clear"
                  onSelect={() => onValueChange([])}
                  disabled={normalizedValue.length === 0}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar selección
                </CommandItem>
              </CommandGroup>

              {filteredTypes.length === 0 ? (
                <CommandEmpty>No se encontraron tipos de turno</CommandEmpty>
              ) : (
                <CommandGroup heading="Tipos de turno">
                  {filteredTypes.map((type) => {
                    const isSelected = normalizedValue.includes(type.id);
                    return (
                      <CommandItem
                        key={type.id}
                        value={type.id.toString()}
                        onSelect={() => toggleType(type.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex min-w-0 items-start gap-2">
                          {type.color && (
                            <span
                              className="mt-1 h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: type.color }}
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium">{type.name}</p>
                              {type.scope && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                  {SCOPE_LABELS[type.scope]}
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {type.description
                                ? `${type.description} • ${type.defaultDurationMinutes} min`
                                : `${type.defaultDurationMinutes} min`}
                            </p>
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTypes.map((type) => (
            <Badge
              key={type.id}
              variant="outline"
              className="gap-1 pr-1"
              style={{
                borderColor: type.color || undefined,
                color: type.color || undefined,
                backgroundColor: type.color ? `${type.color}12` : undefined,
              }}
            >
              <span>{type.name}</span>
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-black/5"
                onClick={() => toggleType(type.id)}
                aria-label={`Quitar ${type.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationTypesMultiSelect;
