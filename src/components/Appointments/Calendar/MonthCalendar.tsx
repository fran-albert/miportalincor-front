import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "../Cards/AppointmentCard";
import { DoctorSelect } from "../Select/DoctorSelect";
import { useAppointments, useAppointmentMutations } from "@/hooks/Appointments";
import {
  AppointmentFullResponseDto,
  AppointmentStatus
} from "@/types/Appointment/Appointment";
import {
  formatDateForCalendar,
  formatDateWithWeekdayAR,
  getMonthYearAR
} from "@/common/helpers/timezone";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface MonthCalendarProps {
  onView?: (appointment: AppointmentFullResponseDto) => void;
  onEdit?: (appointment: AppointmentFullResponseDto) => void;
  className?: string;
}

export const MonthCalendar = ({
  onView,
  className
}: MonthCalendarProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();

  // Get first and last day of the month for the query
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const { appointments, isLoading } = useAppointments({
    doctorId: selectedDoctorId,
    dateFrom: formatDateForCalendar(firstDayOfMonth),
    dateTo: formatDateForCalendar(lastDayOfMonth),
    limit: 500
  });

  const { changeStatus, deleteAppointment } = useAppointmentMutations();

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentFullResponseDto[]> = {};
    appointments.forEach((apt) => {
      const dateKey = apt.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    // Sort each day's appointments by hour
    Object.values(grouped).forEach((dayAppointments) => {
      dayAppointments.sort((a, b) => a.hour.localeCompare(b.hour));
    });
    return grouped;
  }, [appointments]);

  // Get appointments for selected date
  const selectedDateKey = formatDateForCalendar(selectedDate);
  const selectedDayAppointments = appointmentsByDate[selectedDateKey] || [];

  const handleChangeStatus = async (id: number, status: AppointmentStatus) => {
    try {
      await changeStatus.mutateAsync({ id, status });
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

  const handleDelete = async (id: number) => {
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

  // Custom day render to show appointment count
  const getDayContent = (day: Date) => {
    const dateKey = formatDateForCalendar(day);
    const dayAppointments = appointmentsByDate[dateKey];
    const count = dayAppointments?.length || 0;

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{day.getDate()}</span>
        {count > 0 && (
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            {count}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${className}`}>
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {getMonthYearAR(month)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMonth(new Date());
                  setSelectedDate(new Date());
                }}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 w-64">
            <DoctorSelect
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
              placeholder="Todos los médicos"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={month}
            onMonthChange={setMonth}
            locale={es}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => getDayContent(date),
            }}
          />
        </CardContent>
      </Card>

      {/* Day appointments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {formatDateWithWeekdayAR(selectedDate)}
          </CardTitle>
          <Badge variant="secondary">
            {selectedDayAppointments.length} turno{selectedDayAppointments.length !== 1 ? 's' : ''}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : selectedDayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No hay turnos para este día</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {selectedDayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    compact
                    onView={onView}
                    onChangeStatus={handleChangeStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthCalendar;
