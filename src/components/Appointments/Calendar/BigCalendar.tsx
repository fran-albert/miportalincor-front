import { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DoctorSelect } from "../Select/DoctorSelect";
import { useAppointments, useAppointmentMutations } from "@/hooks/Appointments";
import { useOverturns, useOverturnMutations } from "@/hooks/Overturns";
import { useMyDoctorProfile } from "@/hooks/Doctor/useMyDoctorProfile";
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentStatusColors
} from "@/types/Appointment/Appointment";
import { OverturnDetailedDto, OverturnStatus, OverturnStatusLabels } from "@/types/Overturn/Overturn";
import { formatDateForCalendar, formatTimeAR } from "@/common/helpers/timezone";
import { CalendarDays, Clock, User, Stethoscope, AlertCircle, X, PlayCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateAppointmentDialog } from "../Dialogs/CreateAppointmentDialog";

// Configure date-fns localizer for Spanish
const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Messages in Spanish
const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay turnos en este rango.",
  showMore: (total: number) => `+ ${total} más`,
};

// Event type for the calendar
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: "appointment" | "overturn";
    data: AppointmentFullResponseDto | OverturnDetailedDto;
    status: AppointmentStatus | OverturnStatus;
  };
}

interface BigCalendarProps {
  className?: string;
  /** Si es true, filtra automáticamente por el médico logueado y oculta el selector */
  autoFilterForDoctor?: boolean;
}

export const BigCalendar = ({ className, autoFilterForDoctor = false }: BigCalendarProps) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour?: string } | null>(null);

  // Si autoFilterForDoctor, obtener el perfil del médico logueado
  const { data: doctorProfile } = useMyDoctorProfile();

  // Auto-seleccionar el médico si autoFilterForDoctor está activo
  useEffect(() => {
    if (autoFilterForDoctor && doctorProfile?.userId) {
      setSelectedDoctorId(doctorProfile.userId);
    }
  }, [autoFilterForDoctor, doctorProfile?.userId]);

  // Calculate date range for queries
  const dateRange = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    // Add buffer for week view
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    return {
      dateFrom: formatDateForCalendar(start),
      dateTo: formatDateForCalendar(end),
    };
  }, [currentDate]);

  // Fetch appointments
  const { appointments, isLoading: isLoadingAppointments } = useAppointments({
    doctorId: selectedDoctorId,
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    limit: 500,
  });

  // Fetch overturns
  const { overturns, isLoading: isLoadingOverturns } = useOverturns({
    doctorId: selectedDoctorId,
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  const { changeStatus: changeAppointmentStatus } = useAppointmentMutations();
  const { changeStatus: changeOverturnStatus } = useOverturnMutations();

  // Convert appointments and overturns to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    const appointmentEvents: CalendarEvent[] = appointments.map((apt) => {
      const [hours, minutes] = apt.hour.split(":").map(Number);
      const start = new Date(apt.date + "T12:00:00");
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30); // Default 30 min duration

      return {
        id: apt.id,
        title: `${apt.patient?.firstName} ${apt.patient?.lastName}`,
        start,
        end,
        resource: {
          type: "appointment" as const,
          data: apt,
          status: apt.status,
        },
      };
    });

    const overturnEvents: CalendarEvent[] = overturns.map((ot) => {
      const [hours, minutes] = ot.hour.split(":").map(Number);
      const start = new Date(ot.date + "T12:00:00");
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30);

      return {
        id: ot.id + 100000, // Offset to avoid ID collision
        title: `⚡ ${ot.patient?.firstName} ${ot.patient?.lastName}`,
        start,
        end,
        resource: {
          type: "overturn" as const,
          data: ot,
          status: ot.status,
        },
      };
    });

    return [...appointmentEvents, ...overturnEvents];
  }, [appointments, overturns]);

  // Get color for event based on status
  const getEventStyle = useCallback((event: CalendarEvent) => {
    const status = event.resource.status;
    const isOverturn = event.resource.type === "overturn";

    let backgroundColor = "#3b82f6"; // default blue
    let borderColor = backgroundColor;

    if (isOverturn) {
      borderColor = "#f97316"; // orange border for overturns
    }

    // Color based on status
    switch (status) {
      case AppointmentStatus.PENDING:
      case AppointmentStatus.REQUESTED_BY_PATIENT:
      case AppointmentStatus.ASSIGNED_BY_SECRETARY:
        backgroundColor = "#eab308"; // yellow
        break;
      case AppointmentStatus.WAITING:
        backgroundColor = "#22c55e"; // green
        break;
      case AppointmentStatus.ATTENDING:
        backgroundColor = "#3b82f6"; // blue
        break;
      case AppointmentStatus.COMPLETED:
        backgroundColor = "#6b7280"; // gray
        break;
      case AppointmentStatus.CANCELLED_BY_PATIENT:
      case AppointmentStatus.CANCELLED_BY_SECRETARY:
        backgroundColor = "#ef4444"; // red
        break;
    }

    return {
      style: {
        backgroundColor,
        borderLeft: isOverturn ? `4px solid ${borderColor}` : undefined,
        borderRadius: "4px",
        opacity: status === AppointmentStatus.COMPLETED ||
          status === AppointmentStatus.CANCELLED_BY_PATIENT ||
          status === AppointmentStatus.CANCELLED_BY_SECRETARY ? 0.6 : 1,
        color: "white",
        fontSize: "12px",
      },
    };
  }, []);

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }, []);

  // Handle slot selection (click on empty space)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    const date = formatDateForCalendar(slotInfo.start);
    const hour = format(slotInfo.start, "HH:mm");
    setSelectedSlot({ date, hour });
    setIsCreateDialogOpen(true);
  }, []);

  // Handle status change
  const handleStatusChange = async (newStatus: AppointmentStatus | OverturnStatus) => {
    if (!selectedEvent) return;

    try {
      if (selectedEvent.resource.type === "appointment") {
        await changeAppointmentStatus.mutateAsync({
          id: selectedEvent.resource.data.id,
          status: newStatus as AppointmentStatus,
        });
      } else {
        await changeOverturnStatus.mutateAsync({
          id: selectedEvent.resource.data.id,
          status: newStatus as OverturnStatus,
        });
      }
      toast({
        title: "Estado actualizado",
        description: "El estado del turno se actualizó correctamente",
      });
      setIsEventDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
      });
    }
  };

  const isLoading = isLoadingAppointments || isLoadingOverturns;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {autoFilterForDoctor ? "Mi Calendario de Turnos" : "Calendario de Turnos"}
            </CardTitle>
            {!autoFilterForDoctor && (
              <div className="flex items-center gap-2">
                <div className="w-64">
                  <DoctorSelect
                    value={selectedDoctorId}
                    onValueChange={setSelectedDoctorId}
                    placeholder="Todos los médicos"
                  />
                </div>
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500">
              Pendiente
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500">
              En Espera
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-700 border-blue-500">
              Atendiendo
            </Badge>
            <Badge variant="outline" className="bg-gray-500/20 text-gray-700 border-gray-500">
              Completado
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500">
              Cancelado
            </Badge>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-700 border-orange-500">
              <AlertCircle className="h-3 w-3 mr-1" />
              Sobreturno
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ height: "700px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month", "week", "day", "agenda"]}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              messages={messages}
              culture="es"
              eventPropGetter={getEventStyle}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              popup
              step={30}
              timeslots={2}
              min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
              max={new Date(0, 0, 0, 21, 0, 0)} // End at 9 PM
              formats={{
                timeGutterFormat: (date: Date) => format(date, "HH:mm"),
                eventTimeRangeFormat: ({ start }: { start: Date }) => format(start, "HH:mm"),
                dayHeaderFormat: (date: Date) => format(date, "EEEE d 'de' MMMM", { locale: es }),
                dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                  `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM", { locale: es })}`,
              }}
            />
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.resource.type === "overturn" && (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              Detalles del Turno
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.resource.type === "overturn" ? "Sobreturno" : "Turno regular"}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="h-10 w-10 p-2 bg-primary/10 rounded-full text-primary" />
                <div>
                  <p className="font-medium">
                    {selectedEvent.resource.data.patient?.firstName}{" "}
                    {selectedEvent.resource.data.patient?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    DNI: {selectedEvent.resource.data.patient?.userName}
                  </p>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Médico</p>
                  <p className="font-medium">
                    Dr. {selectedEvent.resource.data.doctor?.firstName}{" "}
                    {selectedEvent.resource.data.doctor?.lastName}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                  <p className="font-medium">
                    {format(selectedEvent.start, "EEEE d 'de' MMMM, yyyy", { locale: es })} - {formatTimeAR(selectedEvent.resource.data.hour)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 flex items-center justify-center">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: AppointmentStatusColors[selectedEvent.resource.status as AppointmentStatus] || "#6b7280" }}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant="outline">
                    {selectedEvent.resource.type === "appointment"
                      ? AppointmentStatusLabels[selectedEvent.resource.status as AppointmentStatus]
                      : OverturnStatusLabels[selectedEvent.resource.status as OverturnStatus]}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {(selectedEvent.resource.status === AppointmentStatus.PENDING ||
                  selectedEvent.resource.status === AppointmentStatus.ASSIGNED_BY_SECRETARY) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleStatusChange(AppointmentStatus.WAITING)}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Marcar en Espera
                    </Button>
                  )}

                {selectedEvent.resource.status === AppointmentStatus.WAITING && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusChange(AppointmentStatus.ATTENDING)}
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Atender
                  </Button>
                )}

                {selectedEvent.resource.status === AppointmentStatus.ATTENDING && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completar
                  </Button>
                )}

                {(selectedEvent.resource.status === AppointmentStatus.PENDING ||
                  selectedEvent.resource.status === AppointmentStatus.WAITING) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange(AppointmentStatus.CANCELLED_BY_SECRETARY)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEventDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Appointment Dialog */}
      {isCreateDialogOpen && selectedSlot && (
        <CreateAppointmentDialog
          trigger={<span style={{ display: "none" }} />}
          defaultDoctorId={selectedDoctorId}
          defaultDate={selectedSlot.date}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
};

export default BigCalendar;
