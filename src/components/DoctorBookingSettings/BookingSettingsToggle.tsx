import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Globe } from "lucide-react";
import { useDoctorBookingSettings } from "@/hooks/DoctorBookingSettings/useDoctorBookingSettings";
import { useDoctorBookingSettingsMutation } from "@/hooks/DoctorBookingSettings/useDoctorBookingSettingsMutation";
import { useToast } from "@/hooks/use-toast";

interface BookingSettingsToggleProps {
  doctorId: number;
}

export const BookingSettingsToggle = ({ doctorId }: BookingSettingsToggleProps) => {
  const { toast } = useToast();
  const { allowOnlineBooking, isLoading } = useDoctorBookingSettings({ doctorId });
  const { updateSettings, isUpdating } = useDoctorBookingSettingsMutation();

  const handleToggle = async (checked: boolean) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando configuración...</span>
      </div>
    );
  }

  return (
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
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
    </div>
  );
};
