import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  authProfileKeys,
  useMyAuthProfile,
  useUpdateMyTwoFactorPreference,
} from "@/hooks/Auth/useMyAuthProfile";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";

export default function AdminTwoFactorCard() {
  const queryClient = useQueryClient();
  const { promiseToast } = useToastContext();
  const { profile, isLoading } = useMyAuthProfile(true);
  const updateTwoFactorPreferenceMutation = useUpdateMyTwoFactorPreference();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  useEffect(() => {
    if (profile) {
      setTwoFactorEnabled(profile.twoFactorEnabled ?? true);
    }
  }, [profile]);

  const handleToggle = async (checked: boolean) => {
    const previousValue = twoFactorEnabled;
    setTwoFactorEnabled(checked);

    try {
      await promiseToast(
        updateTwoFactorPreferenceMutation.mutateAsync({ enabled: checked }),
        {
          loading: {
            title: checked ? "Habilitando 2FA" : "Deshabilitando 2FA",
            description: "Actualizando preferencia de seguridad",
          },
          success: {
            title: checked ? "2FA habilitado" : "2FA deshabilitado",
            description: "El cambio impactará desde el próximo login",
          },
          error: (error: unknown) => ({
            title: "No se pudo actualizar 2FA",
            description:
              (error as { response?: { data?: { message?: string } } }).response
                ?.data?.message || "Ocurrió un error inesperado",
          }),
        },
      );

      queryClient.invalidateQueries({ queryKey: authProfileKeys.me() });
    } catch {
      setTwoFactorEnabled(previousValue);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 border-b border-amber-200">
          <CardTitle className="flex items-center gap-3 text-amber-900">
            <div className="p-2 bg-amber-500 rounded-full">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            Seguridad de Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 border-b border-amber-200">
          <CardTitle className="flex items-center gap-3 text-amber-900">
            <div className="p-2 bg-amber-500 rounded-full">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            Seguridad de Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-slate-600">
            No se pudo cargar tu preferencia de 2FA en este momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 border-b border-amber-200">
        <CardTitle className="flex items-center gap-3 text-amber-900">
          <div className="p-2 bg-amber-500 rounded-full">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          Seguridad de Acceso
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-slate-900">
              Segundo factor para administradores
            </p>
            <p className="text-sm text-slate-600">
              Define si tu próximo inicio de sesión va a requerir el código por
              email.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-100 text-amber-800"
          >
            Solo admin
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="space-y-1">
            <Label
              htmlFor="admin-two-factor-toggle"
              className="flex items-center gap-2 text-base font-medium text-slate-900"
            >
              <KeyRound className="h-4 w-4 text-amber-600" />
              Requerir 2FA
            </Label>
            <p className="text-sm text-slate-600">
              {twoFactorEnabled
                ? "Activo: en tu próximo login se pedirá el código de verificación."
                : "Inactivo: en tu próximo login no se pedirá el código de verificación."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {updateTwoFactorPreferenceMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : null}
            <Switch
              id="admin-two-factor-toggle"
              checked={twoFactorEnabled}
              onCheckedChange={handleToggle}
              disabled={updateTwoFactorPreferenceMutation.isPending}
            />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Este cambio no cierra tu sesión actual. Empieza a aplicar desde el
          próximo login.
        </div>
      </CardContent>
    </Card>
  );
}
