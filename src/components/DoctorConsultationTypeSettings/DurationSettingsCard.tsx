import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Timer, Plus, Pencil, Trash2, Loader2, Info } from 'lucide-react';
import {
  useDoctorConsultationTypeSettings,
  useDoctorConsultationTypeSettingsMutations,
} from '@/hooks/DoctorConsultationTypeSettings';
import { useConsultationTypes } from '@/hooks/ConsultationType';
import { DoctorConsultationTypeSettingResponseDto } from '@/types/DoctorConsultationTypeSettings';
import { toast } from 'sonner';

interface DurationSettingsCardProps {
  doctorId: number;
  readOnly?: boolean;
}

interface EditingItem {
  consultationTypeId: number;
  durationMinutes: number;
}

export const DurationSettingsCard = ({ doctorId, readOnly = false }: DurationSettingsCardProps) => {
  const { settings, isLoading } = useDoctorConsultationTypeSettings(doctorId);
  const { upsert, remove, isUpserting, isRemoving } = useDoctorConsultationTypeSettingsMutations(doctorId);
  const { consultationTypes } = useConsultationTypes({ doctorId });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [durationValue, setDurationValue] = useState<string>('');

  // Filter out already-configured types
  const availableTypes = consultationTypes.filter(
    (ct) => !settings.some((s) => s.consultationTypeId === ct.id),
  );

  const handleOpenAdd = () => {
    setSelectedTypeId('');
    setDurationValue('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (setting: DoctorConsultationTypeSettingResponseDto) => {
    setEditingItem({
      consultationTypeId: setting.consultationTypeId,
      durationMinutes: setting.durationMinutes,
    });
    setDurationValue(setting.durationMinutes.toString());
  };

  const handleSaveAdd = async () => {
    const ctId = parseInt(selectedTypeId, 10);
    const duration = parseInt(durationValue, 10);
    if (isNaN(ctId) || isNaN(duration) || duration < 5 || duration > 480) {
      toast.error('La duración debe ser entre 5 y 480 minutos');
      return;
    }

    const existingSettings = settings.map((s) => ({
      consultationTypeId: s.consultationTypeId,
      durationMinutes: s.durationMinutes,
    }));

    try {
      await upsert.mutateAsync({
        settings: [...existingSettings, { consultationTypeId: ctId, durationMinutes: duration }],
      });
      toast.success('Duración configurada correctamente');
      setIsAddOpen(false);
    } catch {
      toast.error('Error al guardar la configuración');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const duration = parseInt(durationValue, 10);
    if (isNaN(duration) || duration < 5 || duration > 480) {
      toast.error('La duración debe ser entre 5 y 480 minutos');
      return;
    }

    const updatedSettings = settings.map((s) => ({
      consultationTypeId: s.consultationTypeId,
      durationMinutes: s.consultationTypeId === editingItem.consultationTypeId ? duration : s.durationMinutes,
    }));

    try {
      await upsert.mutateAsync({ settings: updatedSettings });
      toast.success('Duración actualizada correctamente');
      setEditingItem(null);
    } catch {
      toast.error('Error al actualizar la configuración');
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success('Configuración eliminada');
      setDeleteId(null);
    } catch {
      toast.error('Error al eliminar la configuración');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Duración por Tipo de Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Duración por Tipo de Consulta
          </CardTitle>
          {!readOnly && availableTypes.length > 0 && (
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>No hay duraciones personalizadas configuradas.</p>
                <p className="mt-1">
                  Se usa la duración del slot de disponibilidad por defecto para todos los tipos de consulta.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {setting.consultationType?.color && (
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: setting.consultationType.color }}
                      />
                    )}
                    <span className="font-medium text-sm">
                      {setting.consultationType?.name ?? `Tipo #${setting.consultationTypeId}`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {setting.durationMinutes} min
                    </span>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(setting)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteId(setting.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Agregar duración personalizada</DialogTitle>
            <DialogDescription>
              Configure la duración del turno para un tipo de consulta específico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Consulta</label>
              <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id.toString()}>
                      <div className="flex items-center gap-2">
                        {ct.color && (
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ct.color }}
                          />
                        )}
                        <span>{ct.name}</span>
                        <span className="text-xs text-muted-foreground">
                          (default: {ct.defaultDurationMinutes} min)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duración (minutos)</label>
              <Input
                type="number"
                min={5}
                step={5}
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="Ej: 60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAdd}
              disabled={!selectedTypeId || !durationValue || isUpserting}
            >
              {isUpserting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={(open) => { if (!open) setEditingItem(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Editar duración</DialogTitle>
            <DialogDescription>
              Modifique la duración del turno para este tipo de consulta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Consulta</label>
              <Input
                disabled
                value={
                  settings.find((s) => s.consultationTypeId === editingItem?.consultationTypeId)
                    ?.consultationType?.name ?? ''
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duración (minutos)</label>
              <Input
                type="number"
                min={5}
                step={5}
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="Ej: 60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!durationValue || isUpserting}
            >
              {isUpserting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar configuración?</AlertDialogTitle>
            <AlertDialogDescription>
              Se usará la duración por defecto del slot para este tipo de consulta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
