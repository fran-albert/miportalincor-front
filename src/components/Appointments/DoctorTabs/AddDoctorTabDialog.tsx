import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { formatDoctorName } from "@/common/helpers/helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { type DoctorTab } from "@/hooks/Appointments/useDoctorTabs";

interface AddDoctorTabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeDoctorIds: number[];
  onSelectDoctor: (doctor: DoctorTab) => void;
}

export const AddDoctorTabDialog = ({
  open,
  onOpenChange,
  excludeDoctorIds,
  onSelectDoctor,
}: AddDoctorTabDialogProps) => {
  const [search, setSearch] = useState("");
  const { doctors, isLoading } = useDoctors({ auth: true, fetchDoctors: true });

  // Filter out already open doctors and apply search
  const availableDoctors = useMemo(() => {
    const filtered = doctors.filter(
      (d) => !excludeDoctorIds.includes(Number(d.userId))
    );

    if (!search) return filtered;

    const searchLower = search.toLowerCase();
    return filtered.filter((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [doctors, excludeDoctorIds, search]);

  const handleSelect = useCallback(
    (doctor: (typeof doctors)[0]) => {
      onSelectDoctor({
        doctorId: Number(doctor.userId),
        doctorName: formatDoctorName(doctor),
      });
      setSearch("");
    },
    [onSelectDoctor]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Agregar Médico
          </DialogTitle>
          <DialogDescription>
            Selecciona un médico para ver su calendario de turnos.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Command shouldFilter={false} className="border rounded-lg">
            <CommandInput
              placeholder="Buscar médico..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-[300px]">
              {availableDoctors.length === 0 ? (
                <CommandEmpty>
                  {doctors.length === excludeDoctorIds.length
                    ? "Todos los médicos ya están abiertos"
                    : "No se encontraron médicos"}
                </CommandEmpty>
              ) : (
                <CommandGroup heading="Médicos disponibles">
                  {availableDoctors.map((doctor) => (
                    <CommandItem
                      key={doctor.id}
                      value={doctor.userId?.toString() || doctor.id}
                      onSelect={() => handleSelect(doctor)}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatDoctorName(doctor)}
                        </span>
                        {doctor.specialities && doctor.specialities.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {doctor.specialities.map((s) => s.name).join(", ")}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDoctorTabDialog;
