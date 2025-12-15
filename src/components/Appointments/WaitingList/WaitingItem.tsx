import { Button } from "@/components/ui/button";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";
import { OverturnDetailedDto } from "@/types/Overturn/Overturn";
import { formatTimeAR } from "@/common/helpers/timezone";
import { User, Clock, PlayCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDoctorName } from "@/common/helpers/helpers";

type WaitingItemType =
  | { type: 'appointment'; data: AppointmentFullResponseDto }
  | { type: 'overturn'; data: OverturnDetailedDto };

interface WaitingItemProps {
  item: WaitingItemType;
  onAttend?: (id: number, type: 'appointment' | 'overturn') => void;
  onCancel?: (id: number, type: 'appointment' | 'overturn') => void;
  isLoading?: boolean;
}

export const WaitingItem = ({
  item,
  onAttend,
  onCancel,
  isLoading = false
}: WaitingItemProps) => {
  const data = item.data;
  const isOverturn = item.type === 'overturn';

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg transition-colors",
        isOverturn ? "border-l-4 border-l-orange-500 bg-orange-50/50" : "bg-white"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {data.patient?.firstName} {data.patient?.lastName}
            </span>
            {isOverturn && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Sobreturno
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAR(data.hour)}</span>
            <span className="text-xs">•</span>
            <span>
              {data.doctor && formatDoctorName(data.doctor)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onAttend && (
          <Button
            size="sm"
            onClick={() => onAttend(data.id, item.type)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Atender
          </Button>
        )}
        {onCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(data.id, item.type)}
            disabled={isLoading}
            className="text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default WaitingItem;
