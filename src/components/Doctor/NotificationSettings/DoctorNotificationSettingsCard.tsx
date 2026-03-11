import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Save, AlertCircle, Lock } from "lucide-react";
import {
  useDoctorNotificationSettings,
  useCreateDoctorNotificationSettings,
  useUpdateDoctorNotificationSettings,
} from "@/hooks/Doctor-Notification-Settings/useDoctorNotificationSettings";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useCheckDoctorService } from "@/hooks/Doctor-Services/useDoctorServices";
import { ServiceType } from "@/types/Doctor-Services/DoctorServices";

interface DoctorNotificationSettingsCardProps {
  doctorId: number;
  doctorUserId: string;
  doctorPhoneNumber?: string;
  doctorPhoneNumber2?: string;
}

export function DoctorNotificationSettingsCard({
  doctorId,
  doctorUserId,
  doctorPhoneNumber,
  doctorPhoneNumber2,
}: DoctorNotificationSettingsCardProps) {
  // Check if doctor has WHATSAPP_APPOINTMENTS service enabled
  const { isServiceEnabled: hasWhatsAppService, isLoading: isLoadingService } = useCheckDoctorService({
    doctorUserId,
    serviceType: ServiceType.WHATSAPP_APPOINTMENTS,
  });
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [reminder24hEnabled, setReminder24hEnabled] = useState(true);
  const [cancellationEnabled, setCancellationEnabled] = useState(true);
  const [dailyAgendaEnabled, setDailyAgendaEnabled] = useState(false);
  const [dailyAgendaTime, setDailyAgendaTime] = useState("07:00");
  const [previousDayDailyAgendaEnabled, setPreviousDayDailyAgendaEnabled] = useState(false);
  const [previousDayDailyAgendaTime, setPreviousDayDailyAgendaTime] = useState("19:00");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, isLoading, error } = useDoctorNotificationSettings(doctorId);
  const createMutation = useCreateDoctorNotificationSettings();
  const updateMutation = useUpdateDoctorNotificationSettings();
  const { promiseToast } = useToastContext();
  const rawWhatsappNumber = doctorPhoneNumber || doctorPhoneNumber2 || "";
  const normalizedWhatsappNumber = rawWhatsappNumber
    ? (() => {
        let cleaned = rawWhatsappNumber.replace(/[\s\-+]/g, "");
        if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
        if (!cleaned.startsWith("54")) cleaned = `54${cleaned}`;
        return `+${cleaned}`;
      })()
    : null;

  // Initialize form with settings data or defaults
  useEffect(() => {
    if (settings) {
      setWhatsappEnabled(settings.whatsappEnabled);
      setConfirmationEnabled(settings.confirmationEnabled);
      setReminder24hEnabled(settings.reminder24hEnabled);
      setCancellationEnabled(settings.cancellationEnabled);
      setDailyAgendaEnabled(settings.dailyAgendaEnabled);
      setDailyAgendaTime(settings.dailyAgendaTime);
      setPreviousDayDailyAgendaEnabled(settings.previousDayDailyAgendaEnabled);
      setPreviousDayDailyAgendaTime(settings.previousDayDailyAgendaTime);
      setHasChanges(false);
    } else if (settings === null) {
      // No settings exist, use defaults (all enabled)
      setWhatsappEnabled(true);
      setConfirmationEnabled(true);
      setReminder24hEnabled(true);
      setCancellationEnabled(true);
      setDailyAgendaEnabled(false);
      setDailyAgendaTime("07:00");
      setPreviousDayDailyAgendaEnabled(false);
      setPreviousDayDailyAgendaTime("19:00");
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
        cancellationEnabled !== settings.cancellationEnabled ||
        dailyAgendaEnabled !== settings.dailyAgendaEnabled ||
        dailyAgendaTime !== settings.dailyAgendaTime ||
        previousDayDailyAgendaEnabled !== settings.previousDayDailyAgendaEnabled ||
        previousDayDailyAgendaTime !== settings.previousDayDailyAgendaTime;
      setHasChanges(changed);
    }
  }, [
    whatsappEnabled,
    confirmationEnabled,
    reminder24hEnabled,
    cancellationEnabled,
    dailyAgendaEnabled,
    dailyAgendaTime,
    previousDayDailyAgendaEnabled,
    previousDayDailyAgendaTime,
    settings,
  ]);

  const handleSave = async () => {
    const payload = {
      whatsappEnabled,
      confirmationEnabled,
      reminder24hEnabled,
      cancellationEnabled,
      dailyAgendaEnabled,
      dailyAgendaTime,
      previousDayDailyAgendaEnabled,
      previousDayDailyAgendaTime,
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

  if (isLoading || isLoadingService) {
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
  const isDisabled = !hasWhatsAppService;

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
              Configure las notificaciones de WhatsApp para los turnos de este médico
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Not Enabled Warning */}
        {!hasWhatsAppService && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Servicio no habilitado
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  El servicio de WhatsApp para turnos no está habilitado para este médico.
                  Contacte al administrador para activar este servicio desde el panel de Servicios Médicos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Master Toggle - WhatsApp Enabled */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${hasWhatsAppService ? 'bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
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
            disabled={isDisabled}
          />
        </div>

        {/* Confirmation Notification */}
        <div className={`flex items-center justify-between p-3 border rounded-lg ${isDisabled ? 'opacity-60' : ''}`}>
          <div className="space-y-1">
            <Label htmlFor="confirmationEnabled" className="text-sm font-medium">
              Confirmación de turno
            </Label>
            <p className="text-xs text-gray-500">
              Enviar mensaje cuando se crea un nuevo turno
            </p>
          </div>
          <Switch
            id="confirmationEnabled"
            checked={confirmationEnabled}
            onCheckedChange={setConfirmationEnabled}
            disabled={isDisabled || !whatsappEnabled}
          />
        </div>

        {/* 24h Reminder Notification */}
        <div className={`flex items-center justify-between p-3 border rounded-lg ${isDisabled ? 'opacity-60' : ''}`}>
          <div className="space-y-1">
            <Label htmlFor="reminder24hEnabled" className="text-sm font-medium">
              Recordatorio 24 horas antes
            </Label>
            <p className="text-xs text-gray-500">
              Enviar recordatorio un día antes del turno
            </p>
          </div>
          <Switch
            id="reminder24hEnabled"
            checked={reminder24hEnabled}
            onCheckedChange={setReminder24hEnabled}
            disabled={isDisabled || !whatsappEnabled}
          />
        </div>

        {/* Cancellation Notification */}
        <div className={`flex items-center justify-between p-3 border rounded-lg ${isDisabled ? 'opacity-60' : ''}`}>
          <div className="space-y-1">
            <Label htmlFor="cancellationEnabled" className="text-sm font-medium">
              Aviso de cancelación
            </Label>
            <p className="text-xs text-gray-500">
              Enviar mensaje cuando se cancela un turno
            </p>
          </div>
          <Switch
            id="cancellationEnabled"
            checked={cancellationEnabled}
            onCheckedChange={setCancellationEnabled}
            disabled={isDisabled || !whatsappEnabled}
          />
        </div>

        <div className={`border rounded-lg p-3 space-y-3 ${isDisabled ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dailyAgendaEnabled" className="text-sm font-medium">
                Agenda del día por WhatsApp
              </Label>
              <p className="text-xs text-gray-500">
                Enviar al médico su agenda del día con hora configurable
              </p>
            </div>
            <Switch
              id="dailyAgendaEnabled"
              checked={dailyAgendaEnabled}
              onCheckedChange={setDailyAgendaEnabled}
              disabled={isDisabled || !whatsappEnabled}
            />
          </div>

          <div className="space-y-2">
              <Label htmlFor="dailyAgendaTime" className="text-sm font-medium">
              Hora de envío
            </Label>
            <Input
              id="dailyAgendaTime"
              type="time"
              value={dailyAgendaTime}
              onChange={(event) => setDailyAgendaTime(event.target.value)}
              disabled={isDisabled || !whatsappEnabled || !dailyAgendaEnabled}
              className="max-w-44"
            />
            <p className="text-xs text-gray-500">
              Usar formato 24 horas. Ejemplo: 07:00 o 19:00. Hora local de
              Argentina. Si no hay agenda ese día, no se enviará mensaje.
            </p>
          </div>
        </div>

        <div className={`border rounded-lg p-3 space-y-3 ${isDisabled ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="previousDayDailyAgendaEnabled" className="text-sm font-medium">
                Agenda de mañana por WhatsApp
              </Label>
              <p className="text-xs text-gray-500">
                Enviar el día anterior la agenda del día siguiente
              </p>
            </div>
            <Switch
              id="previousDayDailyAgendaEnabled"
              checked={previousDayDailyAgendaEnabled}
              onCheckedChange={setPreviousDayDailyAgendaEnabled}
              disabled={isDisabled || !whatsappEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousDayDailyAgendaTime" className="text-sm font-medium">
              Hora de envío
            </Label>
            <Input
              id="previousDayDailyAgendaTime"
              type="time"
              value={previousDayDailyAgendaTime}
              onChange={(event) => setPreviousDayDailyAgendaTime(event.target.value)}
              disabled={isDisabled || !whatsappEnabled || !previousDayDailyAgendaEnabled}
              className="max-w-44"
            />
            <p className="text-xs text-gray-500">
              Usar formato 24 horas. Ejemplo: 07:00 o 19:00. Hora local de
              Argentina. Si no hay agenda para mañana, no se enviará mensaje.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-900">
            Número al que se enviará
          </p>
          {rawWhatsappNumber ? (
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>
                Configurado: <span className="font-medium text-gray-900">{rawWhatsappNumber}</span>
              </p>
              <p>
                Formato usado por WhatsApp: <span className="font-medium text-gray-900">{normalizedWhatsappNumber}</span>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-700">
              Este médico no tiene teléfono configurado. No se podrán enviar mensajes hasta completar el número.
            </p>
          )}
        </div>

        {/* Info Box */}
        {!settings && hasWhatsAppService && (
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Este médico aún no tiene configuración de
              notificaciones. Al guardar se creará con los valores seleccionados.
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isDisabled || !hasChanges || isPending}
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
