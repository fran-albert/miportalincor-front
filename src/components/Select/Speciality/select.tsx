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
import { useSpeciality } from "@/hooks/Speciality/useSpeciality";
import { Speciality } from "@/types/Speciality/Speciality";

interface SpecialitySelectProps {
  selected?: Speciality[];
  onSpecialityChange?: (value: Speciality[]) => void;
  disabled?: boolean;
}

export const SpecialitySelect = ({
  selected = [],
  onSpecialityChange,
  disabled,
}: SpecialitySelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedSpecialities, setSelectedSpecialities] =
    React.useState<Speciality[]>(selected);
  const { specialities } = useSpeciality({});

  React.useEffect(() => {
    setSelectedSpecialities(selected);
  }, [selected]);

  const handleSelect = (speciality: Speciality) => {
    const isSelected = selectedSpecialities.some((s) => s.id === speciality.id);
    const newSelected = isSelected
      ? selectedSpecialities.filter((s) => s.id !== speciality.id)
      : [...selectedSpecialities, speciality];
    setSelectedSpecialities(newSelected);

    if (onSpecialityChange) {
      onSpecialityChange(newSelected);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap">
              {selectedSpecialities.length > 0
                ? selectedSpecialities.map((s) => s.name).join(", ")
                : "Seleccione las especialidades..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar especialidad..." />
            <CommandList>
              <CommandEmpty>No se encontraron especialidades.</CommandEmpty>
              <CommandGroup>
                {specialities.map((speciality) => (
                  <CommandItem
                    key={speciality.id}
                    value={(speciality.id ?? "").toString()}
                    onSelect={() => handleSelect(speciality)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedSpecialities.some((s) => s.id === speciality.id)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {speciality.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
