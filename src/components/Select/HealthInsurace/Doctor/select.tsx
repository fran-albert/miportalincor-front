import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { useHealthInsurance } from "@/hooks/Health-Insurance/useHealthInsurance";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";

interface HealthInsuranceDoctorProps {
  selected?: HealthInsurance[];
  onHIChange?: (value: HealthInsurance[]) => void;
  disabled?: boolean;
}

export function HealthInsuranceDoctorSelect({
  selected = [],
  onHIChange,
  disabled,
}: HealthInsuranceDoctorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedHealthInsurances, setSelectedHealthInsurances] =
    React.useState<HealthInsurance[]>(selected); 

  const { healthInsurances } = useHealthInsurance({});

  React.useEffect(() => {
    setSelectedHealthInsurances(selected);
  }, [selected]);

  const handleSelect = (healthInsurance: HealthInsurance) => {
    const isSelected = selectedHealthInsurances.some(
      (s) => s.id === healthInsurance.id
    );
    const newSelected = isSelected
      ? selectedHealthInsurances.filter((s) => s.id !== healthInsurance.id)
      : [...selectedHealthInsurances, healthInsurance];
    
    setSelectedHealthInsurances(newSelected);

    if (onHIChange) {
      onHIChange(newSelected);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap">
              {selectedHealthInsurances.length > 0
                ? selectedHealthInsurances.map((s) => s.name).join(", ")
                : "Seleccione las obras sociales..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar obra social..." />
            <CommandList>
              <CommandEmpty>No se encontraron obras sociales.</CommandEmpty>
              <CommandGroup>
                {healthInsurances.map((insurance) => (
                  <CommandItem
                    key={insurance.id}
                    value={insurance.id.toString()}
                    onSelect={() => handleSelect(insurance)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedHealthInsurances.some(
                          (s) => s.id === insurance.id
                        )
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {insurance.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
