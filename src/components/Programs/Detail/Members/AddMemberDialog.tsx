import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemberMutations } from "@/hooks/Program/useMemberMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  AddMemberSchema,
  AddMemberFormValues,
} from "@/validators/Program/member.schema";
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

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: { userId: "", role: "PROFESSIONAL" },
  });

  const onSubmit = async (data: AddMemberFormValues) => {
    try {
      const promise = addMemberMutation.mutateAsync({
        userId: data.userId,
        role: data.role as MemberRole,
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
      reset();
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
            Ingresá el ID del usuario y seleccioná su rol en el programa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">ID de Usuario</Label>
            <Input
              id="userId"
              placeholder="ID del usuario (UUID)"
              {...register("userId")}
            />
            {errors.userId && (
              <p className="text-sm text-red-500">{errors.userId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              defaultValue="PROFESSIONAL"
              onValueChange={(value) =>
                setValue("role", value as "PROFESSIONAL" | "COORDINATOR" | "OTHER")
              }
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
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addMemberMutation.isPending}>
              Agregar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
