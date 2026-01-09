import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Save, AlertCircle } from "lucide-react";
import {
  useMyDoctorSettings,
  useUpdateMyDoctorSettings,
} from "@/hooks/Doctor-Settings/useDoctorSettings";
import { useToastContext } from "@/hooks/Toast/toast-context";

export function MyPrescriptionSettings() {
  const [acceptsRequests, setAcceptsRequests] = useState(false);
  const [maxPending, setMaxPending] = useState(10);
  const [notes, setNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, isLoading, error } = useMyDoctorSettings();
  const updateMutation = useUpdateMyDoctorSettings();
  const { promiseToast } = useToastContext();

  // Initialize form with settings data
  useEffect(() => {
    if (settings) {
      setAcceptsRequests(settings.acceptsPrescriptionRequests);
      setMaxPending(settings.maxPendingPrescriptions);
      setNotes(settings.prescriptionRequestNotes || "");
      setHasChanges(false);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (settings) {
      const changed =
        acceptsRequests !== settings.acceptsPrescriptionRequests ||
        maxPending !== settings.maxPendingPrescriptions ||
        notes !== (settings.prescriptionRequestNotes || "");
      setHasChanges(changed);
    }
  }, [acceptsRequests, maxPending, notes, settings]);

  const handleSave = async () => {
    const promise = updateMutation.mutateAsync({
      acceptsPrescriptionRequests: acceptsRequests,
      maxPendingPrescriptions: maxPending,
      prescriptionRequestNotes: notes || undefined,
    });

    await promiseToast(promise, {
      loading: {
        title: "Guardando configuracion...",
        description: "Actualizando preferencias de recetas",
      },
      success: {
        title: "Configuracion guardada",
        description: "Sus preferencias de recetas han sido actualizadas",
      },
      error: (err: unknown) => ({
        title: "Error al guardar",
        description:
          (err instanceof Error ? err.message : undefined) ||
          "No se pudo guardar la configuracion",
      }),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-greenPrimary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-greenPrimary" />
          </div>
          <div>
            <CardTitle>Configuracion de Recetas</CardTitle>
            <CardDescription>
              Configure si desea recibir solicitudes de recetas de sus pacientes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Accept Requests */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="acceptRequests" className="text-base font-medium">
              Aceptar solicitudes de recetas
            </Label>
            <p className="text-sm text-gray-500">
              Cuando esta habilitado, los pacientes podran solicitarle recetas
            </p>
          </div>
          <Switch
            id="acceptRequests"
            checked={acceptsRequests}
            onCheckedChange={setAcceptsRequests}
          />
        </div>

        {/* Max Pending Requests */}
        <div className="space-y-2">
          <Label htmlFor="maxPending" className="text-sm font-medium">
            Maximo de solicitudes pendientes
          </Label>
          <Input
            id="maxPending"
            type="number"
            min={1}
            max={100}
            value={maxPending}
            onChange={(e) => setMaxPending(Number(e.target.value))}
            className="w-32"
            disabled={!acceptsRequests}
          />
          <p className="text-xs text-gray-500">
            Cantidad maxima de solicitudes pendientes que puede tener (1-100)
          </p>
        </div>

        {/* Notes for Patients */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notas para los pacientes (opcional)
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones o informacion importante para los pacientes que soliciten recetas..."
            rows={4}
            className="resize-none"
            maxLength={1000}
            disabled={!acceptsRequests}
          />
          <div className="flex items-center justify-between text-xs">
            <p className="text-gray-500">
              Este mensaje sera visible para los pacientes al solicitar una receta
            </p>
            <span className="text-gray-400">{notes.length} / 1000</span>
          </div>
        </div>

        {/* Info Box */}
        {acceptsRequests && (
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Las solicitudes de recetas apareceran en su
              seccion "Solicitudes de Recetas" en el menu lateral. Recibira
              notificaciones cuando un paciente solicite una receta.
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className="bg-greenPrimary hover:bg-greenPrimary/90"
          >
            {updateMutation.isPending ? (
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
