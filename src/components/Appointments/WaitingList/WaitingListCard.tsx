import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { WaitingItem } from "./WaitingItem";
import { useWaitingList } from "@/hooks/Appointments";
import { useDoctorTodayOverturns } from "@/hooks/Overturns";
import { useAppointmentMutations } from "@/hooks/Appointments";
import { useOverturnMutations } from "@/hooks/Overturns";
import { AppointmentStatus } from "@/types/Appointment/Appointment";
import { OverturnStatus } from "@/types/Overturn/Overturn";
import { Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaitingListCardProps {
  doctorId: number;
  className?: string;
  maxHeight?: string;
}

export const WaitingListCard = ({
  doctorId,
  className,
  maxHeight = "400px"
}: WaitingListCardProps) => {
  const { toast } = useToast();

  const {
    waitingList,
    isLoading: isLoadingAppointments,
    isFetching: isFetchingAppointments
  } = useWaitingList({ doctorId, refetchInterval: 30000 });

  const {
    waitingOverturns,
    isLoading: isLoadingOverturns,
    isFetching: isFetchingOverturns
  } = useDoctorTodayOverturns({ doctorId, refetchInterval: 30000 });

  const { changeStatus: changeAppointmentStatus } = useAppointmentMutations();
  const { changeStatus: changeOverturnStatus } = useOverturnMutations();

  const isLoading = isLoadingAppointments || isLoadingOverturns;
  const isFetching = isFetchingAppointments || isFetchingOverturns;

  // Combine and sort by hour
  const allWaitingItems = [
    ...waitingList.map(appointment => ({
      type: 'appointment' as const,
      data: appointment,
      hour: appointment.hour
    })),
    ...waitingOverturns.map(overturn => ({
      type: 'overturn' as const,
      data: overturn,
      hour: overturn.hour
    }))
  ].sort((a, b) => a.hour.localeCompare(b.hour));

  const handleAttend = async (id: number, type: 'appointment' | 'overturn') => {
    try {
      if (type === 'appointment') {
        await changeAppointmentStatus.mutateAsync({
          id,
          status: AppointmentStatus.ATTENDING
        });
      } else {
        await changeOverturnStatus.mutateAsync({
          id,
          status: OverturnStatus.ATTENDING
        });
      }
      toast({
        title: "Paciente en atención",
        description: "El estado se actualizó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
      });
    }
  };

  const handleCancel = async (id: number, type: 'appointment' | 'overturn') => {
    try {
      if (type === 'appointment') {
        await changeAppointmentStatus.mutateAsync({
          id,
          status: AppointmentStatus.CANCELLED_BY_SECRETARY
        });
      } else {
        await changeOverturnStatus.mutateAsync({
          id,
          status: OverturnStatus.CANCELLED_BY_SECRETARY
        });
      }
      toast({
        title: "Turno cancelado",
        description: "El turno se canceló correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cancelar el turno",
      });
    }
  };

  const totalWaiting = allWaitingItems.length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Lista de Espera</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isFetching && (
              <div className="animate-pulse">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <Badge variant={totalWaiting > 0 ? "default" : "secondary"}>
              {totalWaiting} {totalWaiting === 1 ? 'paciente' : 'pacientes'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : allWaitingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No hay pacientes en espera</p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-2">
              {allWaitingItems.map((item) => (
                <WaitingItem
                  key={`${item.type}-${item.data.id}`}
                  item={item}
                  onAttend={handleAttend}
                  onCancel={handleCancel}
                  isLoading={
                    changeAppointmentStatus.isPending || changeOverturnStatus.isPending
                  }
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default WaitingListCard;
