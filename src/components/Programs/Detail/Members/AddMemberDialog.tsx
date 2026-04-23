import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorSelect } from "@/components/Appointments/Select/DoctorSelect";
import { useMemberMutations } from "@/hooks/Program/useMemberMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { MemberRole, MemberRoleLabels } from "@/types/Program/ProgramMember";

interface AddMemberDialogProps {
  programId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AddMemberDialog({
  programId,
  isOpen,
  setIsOpen,
}: AddMemberDialogProps) {
  const { addMemberMutation } = useMemberMutations(programId);
  const { promiseToast } = useToastContext();
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [role, setRole] = useState<MemberRole>(MemberRole.PROFESSIONAL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      const promise = addMemberMutation.mutateAsync({
        userId: selectedUserId.toString(),
        role,
      });
      await promiseToast(promise, {
        loading: {
          title: "Agregando miembro...",
          description: "Procesando",
        },
        success: {
          title: "Miembro agregado",
          description: "El miembro se agregó correctamente.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo agregar el miembro.",
        }),
      });
      setSelectedUserId(undefined);
      setRole(MemberRole.PROFESSIONAL);
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Miembro</DialogTitle>
          <DialogDescription>
            El administrador define quién coordina y quién integra el equipo del programa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Profesional</Label>
            <DoctorSelect
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              placeholder="Buscar profesional..."
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as MemberRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MemberRoleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {role === MemberRole.COORDINATOR
                ? "Coordinador: gestiona la operatoria del programa, como actividades, inscripciones, planes y resúmenes."
                : "Profesional: participa del seguimiento asistencial y registra notas o asistencia cuando corresponde."}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={addMemberMutation.isPending || !selectedUserId}
            >
              Agregar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
