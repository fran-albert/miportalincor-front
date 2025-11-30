import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useRoles } from "@/hooks/Role/useRoles";
import { useUserRoles } from "@/hooks/Role/useUserRoles";
import { StaffUser } from "@/api/Role/get-staff-users.action";
import { ApiError } from "@/types/Error/ApiError";
import { Settings, Loader2 } from "lucide-react";

interface Props {
  user: StaffUser;
  onSuccess: () => void;
}

export default function UserRolesDialog({ user, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { showSuccess, showError } = useToastContext();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { userRoles, isLoading: userRolesLoading, assignRole, removeRole } = useUserRoles(user.id);

  const isLoading = rolesLoading || userRolesLoading;

  const handleRoleToggle = async (roleId: number, roleName: string, isCurrentlyAssigned: boolean) => {
    try {
      if (isCurrentlyAssigned) {
        await removeRole.mutateAsync(roleId);
        showSuccess("Rol removido", `Se quitó el rol "${roleName}" de ${user.firstName} ${user.lastName}`);
      } else {
        await assignRole.mutateAsync(roleId);
        showSuccess("Rol asignado", `Se asignó el rol "${roleName}" a ${user.firstName} ${user.lastName}`);
      }
      onSuccess();
    } catch (error) {
      const apiError = error as ApiError;
      showError(
        "Error",
        apiError.response?.data?.message || `Error al ${isCurrentlyAssigned ? "quitar" : "asignar"} el rol`
      );
    }
  };

  const isRoleAssigned = (roleId: number) => {
    return userRoles.some((r) => r.id === roleId);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings className="h-4 w-4" />
          Roles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Roles</DialogTitle>
          <DialogDescription>
            Administra los roles de{" "}
            <strong>
              {user.firstName} {user.lastName}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Roles actuales:</p>
            <div className="flex flex-wrap gap-1">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">Sin roles asignados</span>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Selecciona los roles:</p>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {roles.map((role) => {
                  const isAssigned = isRoleAssigned(role.id);
                  const isPending = assignRole.isPending || removeRole.isPending;

                  return (
                    <div key={role.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={isAssigned}
                        disabled={isPending}
                        onCheckedChange={() => handleRoleToggle(role.id, role.name, isAssigned)}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {role.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
