import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAvailableSlots } from "@/hooks/Appointments";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";
import { formatDateWithWeekdayAR, formatDateForCalendar } from "@/common/helpers/timezone";
import { Check, X, Clock, Calendar, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotInfo {
  hour: string;
  available: boolean;
  appointment?: AppointmentFullResponseDto;
  patientName?: string;
}

interface SlotAvailabilityPanelProps {
  doctorId?: number;
  selectedDate: Date;
  appointments: AppointmentFullResponseDto[];
  onSlotClick: (hour: string) => void;
  onAppointmentClick?: (appointment: AppointmentFullResponseDto) => void;
  className?: string;
}

export const SlotAvailabilityPanel = ({
  doctorId,
  selectedDate,
  appointments,
  onSlotClick,
  onAppointmentClick,
  className,
}: SlotAvailabilityPanelProps) => {
  const dateString = formatDateForCalendar(selectedDate);

  // Get available slots from backend
  const { slots: availableSlots, isLoading } = useAvailableSlots({
    doctorId: doctorId ?? 0,
    date: dateString,
    enabled: !!doctorId && doctorId > 0,
  });

  // Filter appointments for selected date
  const appointmentsForDate = useMemo(() => {
    return appointments.filter((apt) => apt.date === dateString);
  }, [appointments, dateString]);

  // Build complete slots list (free + occupied)
  const allSlots = useMemo((): SlotInfo[] => {
    if (!doctorId) return [];

    // Create a map of occupied slots from appointments
    const occupiedMap = new Map<string, AppointmentFullResponseDto>();
    appointmentsForDate.forEach((apt) => {
      const hourKey = apt.hour.slice(0, 5); // "09:00:00" -> "09:00"
      occupiedMap.set(hourKey, apt);
    });

    // Get all hours (free + occupied)
    const allHours = new Set<string>();

    // Add available slots
    availableSlots.forEach((slot) => {
      allHours.add(slot.hour);
    });

    // Add occupied slots from appointments
    appointmentsForDate.forEach((apt) => {
      const hourKey = apt.hour.slice(0, 5);
      allHours.add(hourKey);
    });

    // Convert to sorted array
    const sortedHours = Array.from(allHours).sort();

    // Build SlotInfo array
    return sortedHours.map((hour): SlotInfo => {
      const appointment = occupiedMap.get(hour);
      if (appointment) {
        // Check if guest
        const isGuest = appointment.isGuest === 1 || appointment.isGuest === true;
        const patientName = isGuest
          ? `${appointment.guestFirstName || ''} ${appointment.guestLastName || ''}`.trim()
          : `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim();

        return {
          hour,
          available: false,
          appointment,
          patientName: patientName || 'Sin nombre',
        };
      }
      return { hour, available: true };
    });
  }, [doctorId, availableSlots, appointmentsForDate]);

  // Count stats
  const availableCount = allSlots.filter((s) => s.available).length;
  const occupiedCount = allSlots.filter((s) => !s.available).length;

  // No doctor selected
  if (!doctorId) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <User className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm text-center">
              Seleccione un médico para ver su disponibilidad
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Disponibilidad
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatDateWithWeekdayAR(selectedDate)}
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {availableCount} libres
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            {occupiedCount} ocupados
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : allSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm text-center">
              No hay horarios configurados para este día
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-3">
            <div className="space-y-1">
              {allSlots.map((slot) => (
                <div key={slot.hour}>
                  {slot.available ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto py-2 px-3 text-green-700 hover:bg-green-50 hover:text-green-800"
                      onClick={() => onSlotClick(slot.hour)}
                    >
                      <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-mono font-medium">{slot.hour}</span>
                      <span className="ml-2 text-green-600 text-sm">Disponible</span>
                      <Plus className="h-3 w-3 ml-auto opacity-50" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto py-2 px-3 text-gray-600 bg-gray-50 hover:bg-gray-100"
                      onClick={() => slot.appointment && onAppointmentClick?.(slot.appointment)}
                      disabled={!onAppointmentClick}
                    >
                      <X className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                      <span className="font-mono font-medium">{slot.hour}</span>
                      <span className="ml-2 text-sm truncate" title={slot.patientName}>
                        {slot.patientName}
                      </span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SlotAvailabilityPanel;
