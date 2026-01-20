import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Unlock, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BlockReason,
  BlockReasonLabels,
  BlockedSlotResponseDto,
} from "@/types/BlockedSlot/BlockedSlot";
import { useBlockedSlotMutations } from "@/hooks/BlockedSlots";

interface BlockSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "block" | "unblock";
  doctorId: number;
  date: string;
  hour: string;
  blockedSlot?: BlockedSlotResponseDto;
  onSuccess?: () => void;
}

export const BlockSlotDialog = ({
  open,
  onOpenChange,
  mode,
  doctorId,
  date,
  hour,
  blockedSlot,
  onSuccess,
}: BlockSlotDialogProps) => {
  const [reason, setReason] = useState<BlockReason>(BlockReason.PERSONAL);
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const { blockSlotAsync, isBlocking, unblockBySlotAsync, isUnblockingBySlot } =
    useBlockedSlotMutations();

  const formattedDate = date
    ? format(new Date(date + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", { locale: es })
    : "";

  const handleBlock = async () => {
    try {
      await blockSlotAsync({
        doctorId,
        date,
        hour,
        reason,
        notes: notes || undefined,
      });
      setReason(BlockReason.PERSONAL);
      setNotes("");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockBySlotAsync({ doctorId, date, hour });
      setShowConfirm(false);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  if (mode === "unblock") {
    return (
      <>
        <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Horario Bloqueado
              </DialogTitle>
              <DialogDescription>
                Este horario está bloqueado y no permite asignar turnos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-medium">{hour}</p>
                </div>
              </div>

              {blockedSlot && (
                <>
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Motivo</p>
                      <p className="font-medium">
                        {BlockReasonLabels[blockedSlot.reason] || blockedSlot.reason}
                      </p>
                    </div>
                  </div>

                  {blockedSlot.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="text-sm">{blockedSlot.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowConfirm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Desbloquear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Desbloquear este horario?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2">
                  <p>El horario quedará disponible para asignar turnos.</p>
                  <p className="font-medium">{formattedDate} - {hour}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnblock}
                disabled={isUnblockingBySlot}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUnblockingBySlot ? "Desbloqueando..." : "Sí, desbloquear"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Block mode
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-500" />
            Bloquear Horario
          </DialogTitle>
          <DialogDescription>
            Bloquea este horario para que no se puedan asignar turnos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Fecha y hora</p>
              <p className="font-medium">{formattedDate}</p>
              <p className="font-medium text-lg">{hour}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as BlockReason)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BlockReasonLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Agrega una nota o descripción..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleBlock}
            disabled={isBlocking}
            className="bg-red-600 hover:bg-red-700"
          >
            <Lock className="h-4 w-4 mr-2" />
            {isBlocking ? "Bloqueando..." : "Bloquear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockSlotDialog;
