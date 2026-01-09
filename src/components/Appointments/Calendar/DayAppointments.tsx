import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentCard } from "../Cards/AppointmentCard";
import { OverturnCard } from "../Cards/OverturnCard";
import { useDoctorTodayAppointments, useAppointmentMutations } from "@/hooks/Appointments";
import { useDoctorTodayOverturns, useOverturnMutations } from "@/hooks/Overturns";
import { AppointmentFullResponseDto, AppointmentStatus } from "@/types/Appointment/Appointment";
import { OverturnDetailedDto, OverturnStatus } from "@/types/Overturn/Overturn";
import { formatDateWithWeekdayAR } from "@/common/helpers/timezone";
import { CalendarDays, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DayAppointmentsProps {
  doctorId: number;
  onViewAppointment?: (appointment: AppointmentFullResponseDto) => void;
  onViewOverturn?: (overturn: OverturnDetailedDto) => void;
  className?: string;
  maxHeight?: string;
}

export const DayAppointments = ({
  doctorId,
  onViewAppointment,
  onViewOverturn,
  className,
  maxHeight = "500px"
}: DayAppointmentsProps) => {
  const { toast } = useToast();
  const today = new Date();

  const {
    appointments,
    isLoading: isLoadingAppointments
  } = useDoctorTodayAppointments({ doctorId });

  const {
    overturns,
    isLoading: isLoadingOverturns
  } = useDoctorTodayOverturns({ doctorId });

  const { changeStatus: changeAppointmentStatus, deleteAppointment } = useAppointmentMutations();
  const { changeStatus: changeOverturnStatus, deleteOverturn } = useOverturnMutations();

  const isLoading = isLoadingAppointments || isLoadingOverturns;

  // Combine and sort all items by hour
  const allItems = [
    ...appointments.map(apt => ({ type: 'appointment' as const, data: apt, hour: apt.hour })),
    ...overturns.map(ot => ({ type: 'overturn' as const, data: ot, hour: ot.hour }))
  ].sort((a, b) => a.hour.localeCompare(b.hour));

  const handleAppointmentStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      await changeAppointmentStatus.mutateAsync({ id, status });
      toast({
        title: "Estado actualizado",
        description: "El estado del turno se actualizó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
      });
    }
  };

  const handleOverturnStatusChange = async (id: number, status: OverturnStatus) => {
    try {
      await changeOverturnStatus.mutateAsync({ id, status });
      toast({
        title: "Estado actualizado",
        description: "El estado del sobreturno se actualizó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
      });
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!confirm("¿Está seguro que desea eliminar este turno?")) return;
    try {
      await deleteAppointment.mutateAsync(id);
      toast({
        title: "Turno eliminado",
        description: "El turno se eliminó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno",
      });
    }
  };

  const handleDeleteOverturn = async (id: number) => {
    if (!confirm("¿Está seguro que desea eliminar este sobreturno?")) return;
    try {
      await deleteOverturn.mutateAsync(id);
      toast({
        title: "Sobreturno eliminado",
        description: "El sobreturno se eliminó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el sobreturno",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Turnos del Día</CardTitle>
          </div>
          <Badge variant="secondary">
            {allItems.length} turno{allItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDateWithWeekdayAR(today)}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No hay turnos programados para hoy</p>
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            <div className="space-y-2">
              {allItems.map((item) =>
                item.type === 'appointment' ? (
                  <AppointmentCard
                    key={`apt-${item.data.id}`}
                    appointment={item.data}
                    compact
                    onView={onViewAppointment}
                    onChangeStatus={handleAppointmentStatusChange}
                    onDelete={handleDeleteAppointment}
                  />
                ) : (
                  <OverturnCard
                    key={`ot-${item.data.id}`}
                    overturn={item.data}
                    compact
                    onView={onViewOverturn}
                    onChangeStatus={handleOverturnStatusChange}
                    onDelete={handleDeleteOverturn}
                  />
                )
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DayAppointments;
