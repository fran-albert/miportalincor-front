import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Globe, UserCog } from "lucide-react";
import { useDoctorBookingSettings } from "@/hooks/DoctorBookingSettings/useDoctorBookingSettings";
import { useDoctorBookingSettingsMutation } from "@/hooks/DoctorBookingSettings/useDoctorBookingSettingsMutation";
import { useToast } from "@/hooks/use-toast";

interface BookingSettingsToggleProps {
  doctorId: number;
}

export const BookingSettingsToggle = ({ doctorId }: BookingSettingsToggleProps) => {
  const { toast } = useToast();
  const { settings, allowOnlineBooking, isLoading } = useDoctorBookingSettings({ doctorId });
  const { updateSettings, isUpdating } = useDoctorBookingSettingsMutation();

  const handleToggleOnlineBooking = async (checked: boolean) => {
    try {
      await updateSettings.mutateAsync({
        doctorId,
        dto: { allowOnlineBooking: checked }
      });
      toast({
        title: checked ? "Turnos online habilitados" : "Turnos online deshabilitados",
        description: checked
          ? "Los pacientes pueden reservar turnos desde la web"
          : "Solo la secretaría puede asignar turnos a este profesional",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
      });
    }
  };

  const handleToggleSelfManage = async (checked: boolean) => {
    try {
      await updateSettings.mutateAsync({
        doctorId,
        dto: { canSelfManageSchedule: checked }
      });
      toast({
        title: checked ? "Autogestión habilitada" : "Autogestión deshabilitada",
        description: checked
          ? "El médico puede gestionar sus turnos, horarios y ausencias"
          : "Solo la secretaría/administrador puede gestionar turnos y horarios",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <div className="space-y-0.5">
            <Label htmlFor="allow-online-booking" className="text-base font-medium">
              Permitir turnos online
            </Label>
            <p className="text-sm text-muted-foreground">
              {allowOnlineBooking
                ? "Los pacientes pueden reservar turnos desde la web"
                : "Solo la secretaría puede asignar turnos"}
            </p>
          </div>
        </div>
        <Switch
          id="allow-online-booking"
          checked={allowOnlineBooking}
          onCheckedChange={handleToggleOnlineBooking}
          disabled={isUpdating}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-5 w-5 text-muted-foreground" />
          <div className="space-y-0.5">
            <Label htmlFor="can-self-manage" className="text-base font-medium">
              Autogestión de Agenda
            </Label>
            <p className="text-sm text-muted-foreground">
              {settings?.canSelfManageSchedule
                ? "El médico puede gestionar sus turnos, horarios y ausencias"
                : "Solo la secretaría/administrador puede gestionar la agenda"}
            </p>
          </div>
        </div>
        <Switch
          id="can-self-manage"
          checked={settings?.canSelfManageSchedule ?? false}
          onCheckedChange={handleToggleSelfManage}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
};
