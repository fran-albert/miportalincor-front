import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Save, AlertCircle } from "lucide-react";
import {
  useDoctorNotificationSettings,
  useCreateDoctorNotificationSettings,
  useUpdateDoctorNotificationSettings,
} from "@/hooks/Doctor-Notification-Settings/useDoctorNotificationSettings";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DoctorNotificationSettingsCardProps {
  doctorId: number;
}

export function DoctorNotificationSettingsCard({
  doctorId,
}: DoctorNotificationSettingsCardProps) {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [reminder24hEnabled, setReminder24hEnabled] = useState(true);
  const [cancellationEnabled, setCancellationEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, isLoading, error } = useDoctorNotificationSettings(doctorId);
  const createMutation = useCreateDoctorNotificationSettings();
  const updateMutation = useUpdateDoctorNotificationSettings();
  const { promiseToast } = useToastContext();

  // Initialize form with settings data or defaults
  useEffect(() => {
    if (settings) {
      setWhatsappEnabled(settings.whatsappEnabled);
      setConfirmationEnabled(settings.confirmationEnabled);
      setReminder24hEnabled(settings.reminder24hEnabled);
      setCancellationEnabled(settings.cancellationEnabled);
      setHasChanges(false);
    } else if (settings === null) {
      // No settings exist, use defaults (all enabled)
      setWhatsappEnabled(true);
      setConfirmationEnabled(true);
      setReminder24hEnabled(true);
      setCancellationEnabled(true);
      setHasChanges(true); // Mark as changed so user can save defaults
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (settings) {
      const changed =
        whatsappEnabled !== settings.whatsappEnabled ||
        confirmationEnabled !== settings.confirmationEnabled ||
        reminder24hEnabled !== settings.reminder24hEnabled ||
        cancellationEnabled !== settings.cancellationEnabled;
      setHasChanges(changed);
    }
  }, [whatsappEnabled, confirmationEnabled, reminder24hEnabled, cancellationEnabled, settings]);

  const handleSave = async () => {
    const payload = {
      whatsappEnabled,
      confirmationEnabled,
      reminder24hEnabled,
      cancellationEnabled,
    };

    if (settings) {
      // Update existing
      const promise = updateMutation.mutateAsync({
        id: settings.id,
        dto: payload,
      });

      await promiseToast(promise, {
        loading: {
          title: "Guardando configuracion...",
          description: "Actualizando preferencias de notificaciones",
        },
        success: {
          title: "Configuracion guardada",
          description: "Las preferencias de notificaciones han sido actualizadas",
        },
        error: (err: unknown) => ({
          title: "Error al guardar",
          description:
            (err instanceof Error ? err.message : undefined) ||
            "No se pudo guardar la configuracion",
        }),
      });
    } else {
      // Create new
      const promise = createMutation.mutateAsync({
        doctorId,
        ...payload,
      });

      await promiseToast(promise, {
        loading: {
          title: "Creando configuracion...",
          description: "Configurando preferencias de notificaciones",
        },
        success: {
          title: "Configuracion creada",
          description: "Las preferencias de notificaciones han sido configuradas",
        },
        error: (err: unknown) => ({
          title: "Error al crear",
          description:
            (err instanceof Error ? err.message : undefined) ||
            "No se pudo crear la configuracion",
        }),
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Error al cargar la configuracion. Por favor, intente nuevamente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle>Notificaciones de WhatsApp</CardTitle>
            <CardDescription>
              Configure las notificaciones de WhatsApp para los turnos de este medico
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle - WhatsApp Enabled */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="whatsappEnabled" className="text-base font-medium">
              Habilitar notificaciones WhatsApp
            </Label>
            <p className="text-sm text-gray-500">
              Activar o desactivar todas las notificaciones de WhatsApp para turnos
            </p>
          </div>
          <Switch
            id="whatsappEnabled"
            checked={whatsappEnabled}
            onCheckedChange={setWhatsappEnabled}
          />
        </div>

        {/* Confirmation Notification */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="confirmationEnabled" className="text-sm font-medium">
              Confirmacion de turno
            </Label>
            <p className="text-xs text-gray-500">
              Enviar mensaje cuando se crea un nuevo turno
            </p>
          </div>
          <Switch
            id="confirmationEnabled"
            checked={confirmationEnabled}
            onCheckedChange={setConfirmationEnabled}
            disabled={!whatsappEnabled}
          />
        </div>

        {/* 24h Reminder Notification */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="reminder24hEnabled" className="text-sm font-medium">
              Recordatorio 24 horas antes
            </Label>
            <p className="text-xs text-gray-500">
              Enviar recordatorio un dia antes del turno
            </p>
          </div>
          <Switch
            id="reminder24hEnabled"
            checked={reminder24hEnabled}
            onCheckedChange={setReminder24hEnabled}
            disabled={!whatsappEnabled}
          />
        </div>

        {/* Cancellation Notification */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="cancellationEnabled" className="text-sm font-medium">
              Aviso de cancelacion
            </Label>
            <p className="text-xs text-gray-500">
              Enviar mensaje cuando se cancela un turno
            </p>
          </div>
          <Switch
            id="cancellationEnabled"
            checked={cancellationEnabled}
            onCheckedChange={setCancellationEnabled}
            disabled={!whatsappEnabled}
          />
        </div>

        {/* Info Box */}
        {!settings && (
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Este medico aun no tiene configuracion de
              notificaciones. Al guardar se creara con los valores seleccionados.
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
