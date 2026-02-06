import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Lock, CalendarOff, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SlotActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  hour: string;
  onCreateAppointment: () => void;
  onBlockSlot: () => void;
  onBlockFullDay?: () => void;
}

export const SlotActionDialog = ({
  open,
  onOpenChange,
  date,
  hour,
  onCreateAppointment,
  onBlockSlot,
  onBlockFullDay,
}: SlotActionDialogProps) => {
  const formattedDate = date
    ? format(new Date(date + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", { locale: es })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Horario Disponible</DialogTitle>
          <DialogDescription>
            ¿Qué desea hacer con este horario?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{hour}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onCreateAppointment}
            className="w-full justify-start h-auto py-4"
            variant="outline"
          >
            <CalendarPlus className="h-5 w-5 mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Crear Turno</div>
              <div className="text-xs text-muted-foreground">
                Asignar un turno a un paciente
              </div>
            </div>
          </Button>

          <Button
            onClick={onBlockSlot}
            className="w-full justify-start h-auto py-4"
            variant="outline"
          >
            <Lock className="h-5 w-5 mr-3 text-red-600" />
            <div className="text-left">
              <div className="font-medium">Bloquear Horario</div>
              <div className="text-xs text-muted-foreground">
                Impedir que se asignen turnos en este horario
              </div>
            </div>
          </Button>

          {onBlockFullDay && (
            <Button
              onClick={onBlockFullDay}
              className="w-full justify-start h-auto py-4"
              variant="outline"
            >
              <CalendarOff className="h-5 w-5 mr-3 text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Bloquear Dia Completo</div>
                <div className="text-xs text-muted-foreground">
                  Crear ausencia para todo el dia
                </div>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlotActionDialog;
