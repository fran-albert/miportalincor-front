import { useState } from "react";
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
import { useConsultationTypes } from "@/hooks/ConsultationType";
import { Check, ChevronsUpDown, Loader2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { consultationTypes, isLoading } = useConsultationTypes();

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTypes = normalizedSearch
    ? consultationTypes.filter((type) => {
        const haystack = `${type.name} ${type.description ?? ""}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : consultationTypes;
  const selectedType = consultationTypes.find((type) => type.id === value);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-gray-50">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Cargando tipos...</span>
      </div>
    );
  }

  return (
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
          disabled={disabled}
        >
          {selectedType ? (
            <span className="flex min-w-0 items-center gap-2">
              <Stethoscope className="h-4 w-4 shrink-0" />
              {selectedType.color && (
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: selectedType.color }}
                />
              )}
              <span className="truncate">{selectedType.name}</span>
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
            placeholder="Buscar tipo de turno..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList
            className="max-h-[280px] overscroll-contain"
            onWheelCapture={(event) => {
              event.stopPropagation();
            }}
          >
            <CommandGroup heading="Opciones">
              <CommandItem
                value="none"
                onSelect={() => {
                  onValueChange(undefined);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === undefined ? "opacity-100" : "opacity-0")} />
                <span className="text-muted-foreground">Sin especificar</span>
              </CommandItem>
            </CommandGroup>

            {filteredTypes.length === 0 ? (
              <CommandEmpty>No se encontraron tipos de turno</CommandEmpty>
            ) : (
              <CommandGroup heading="Tipos de turno">
                {filteredTypes.map((type) => (
                  <CommandItem
                    key={type.id}
                    value={type.id.toString()}
                    onSelect={() => {
                      onValueChange(type.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === type.id ? "opacity-100" : "opacity-0"
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
                        <p className="truncate font-medium">{type.name}</p>
                        {type.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {type.description}
                          </p>
                        )}
                      </div>
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

export default ConsultationTypeSelect;
