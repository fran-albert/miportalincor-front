import { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View, SlotInfo, EventProps, type NavigateAction, type ViewProps, type ViewStatic } from "react-big-calendar";
import { addDays, addMonths, addWeeks, endOfDay, endOfMonth, endOfWeek, format, getDay, isAfter, isBefore, isToday, parse, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./BigCalendar.css";
import TimeGrid from "react-big-calendar/lib/TimeGrid";
import BaseMonthView from "react-big-calendar/lib/Month";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DoctorSelect } from "../Select/DoctorSelect";
import { useAppointmentMutations, useFirstAvailableDate } from "@/hooks/Appointments";
import { useOverturnMutations } from "@/hooks/Overturns";
import { useDoctorAbsenceMutations } from "@/hooks/DoctorAbsence/useDoctorAbsenceMutations";
import { BlockedSlotResponseDto, BlockReasonLabels } from "@/types/BlockedSlot/BlockedSlot";
import { useMyDoctorProfile } from "@/hooks/Doctor/useMyDoctorProfile";
import { useDoctorDashboard } from "@/hooks/Doctor/useDoctorDashboard";
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentOrigin,
  AppointmentOriginLabels,
} from "@/types/Appointment/Appointment";
import { OverturnDetailedDto, OverturnStatus, OverturnStatusLabels } from "@/types/Overturn/Overturn";
import { formatDateForCalendar, formatTimeAR } from "@/common/helpers/timezone";
import { formatDoctorName } from "@/common/helpers/helpers";
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle, Clock, CreditCard, MapPin, Monitor, Phone, PlayCircle, Printer, Shield, Stethoscope, User, UserPlus, XCircle, Zap, AlertCircle } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { CreateAppointmentDialog } from "../Dialogs/CreateAppointmentDialog";
import { BlockSlotDialog } from "../Dialogs/BlockSlotDialog";
import { SlotActionDialog } from "../Dialogs/SlotActionDialog";
import { RegisterGuestModal } from "../Modals/RegisterGuestModal";
import { CreateOverturnDialog } from "../Dialogs/CreateOverturnDialog";
import { CreateAbsenceDialog } from "../Dialogs/CreateAbsenceDialog";
import { RescheduleAppointmentDialog } from "../Dialogs/RescheduleAppointmentDialog";
import { PrintAgendaView } from "./PrintAgendaView";
import { AbsenceLabels, DoctorAbsenceResponseDto } from "@/types/Doctor-Absence/Doctor-Absence";
import { DoctorAvailabilityResponseDto, RecurrenceType, WeekDays } from "@/types/DoctorAvailability/DoctorAvailability";
import { Doctor } from "@/types/Doctor/Doctor";

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
  work_week: "Sem. Laboral",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay turnos en este rango.",
  showMore: (total: number) => `+ ${total} más`,
};
const MAX_AVAILABILITY_PREVIEW_HOURS = 6;
const normalizeHour = (hour: string) => hour.slice(0, 5);

// Event type for the calendar
interface CalendarEvent {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: {
    type: "appointment" | "overturn" | "available" | "blocked" | "absence";
    data?: AppointmentFullResponseDto | OverturnDetailedDto | BlockedSlotResponseDto | DoctorAbsenceResponseDto;
    status?: AppointmentStatus | OverturnStatus;
    isGuest?: boolean;
    slotDate?: string;
    slotHour?: string;
    // Extra info for day view
    patientDni?: string;
    healthInsurance?: string;
    affiliationNumber?: string;
    consultationType?: string;
  };
}

interface RescheduleCalendarTarget {
  type: "appointment" | "overturn";
  id: number;
  doctorId: number;
  date: string;
  hour: string;
  consultationTypeId?: number | null;
  doctor?: { firstName: string; lastName: string } | null;
  patient?: { firstName: string; lastName: string } | null;
}

const splitCalendarGhostLabel = (
  title: string,
  fallbackTime?: string,
): { time: string | null; label: string } => {
  const normalizedFallback = fallbackTime?.slice(0, 5) ?? null;

  if (normalizedFallback) {
    const trimmedTitle = title.replace(/^\d{2}:\d{2}\s*-\s*/, "").trim();
    return {
      time: normalizedFallback,
      label: trimmedTitle || title,
    };
  }

  const match = title.match(/^(\d{2}:\d{2})\s*-\s*(.+)$/);
  if (!match) {
    return { time: null, label: title };
  }

  return {
    time: match[1],
    label: match[2].trim(),
  };
};

interface BigCalendarProps {
  className?: string;
  /** ID del médico a mostrar (usado por DoctorTabs) */
  doctorId?: number;
  /** Nombre del médico para mostrar en el título */
  doctorName?: string;
  /** Si es true, filtra automáticamente por el médico logueado y oculta el selector */
  autoFilterForDoctor?: boolean;
  /** Si es true, solo permite ver turnos sin poder crearlos (modo solo lectura) */
  readOnly?: boolean;
  /** Si es true, solo permite bloquear/desbloquear slots, no crear turnos (para médicos) */
  blockOnly?: boolean;
  /** If provided, fixes the doctor in create dialogs (for doctor self-management) */
  fixedDoctorId?: number;
  /** Whether this tab is currently visible. When false, disables data fetching to save resources. */
  isActive?: boolean;
  /** Whether to allow creating guest appointments (for doctors with self-manage) */
  allowGuestCreation?: boolean;
}

const isRemoteConsultation = (consultationType?: string) => {
  if (!consultationType) return false;
  const normalized = consultationType.toLowerCase();
  return (
    normalized.includes("remot") ||
    normalized.includes("virtual") ||
    normalized.includes("tele")
  );
};

const getConsultationTypeBadgeLabel = (consultationType?: string) => {
  if (!consultationType) return null;
  const normalized = consultationType.trim().toLowerCase();
  if (
    normalized.includes("presencial") ||
    normalized.includes("remot") ||
    normalized.includes("virtual") ||
    normalized.includes("tele")
  ) {
    return null;
  }
  return consultationType;
};

const calendarViewOptions: Array<{ value: View; label: string }> = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "work_week", label: "Sem. laboral" },
  { value: "month", label: "Mes" },
];

const capitalizeCalendarLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const weekDayNumberToEnum: Record<number, WeekDays> = {
  0: WeekDays.SUNDAY,
  1: WeekDays.MONDAY,
  2: WeekDays.TUESDAY,
  3: WeekDays.WEDNESDAY,
  4: WeekDays.THURSDAY,
  5: WeekDays.FRIDAY,
  6: WeekDays.SATURDAY,
};

const buildWorkWeekRange = (date: Date, includeSaturday: boolean) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const totalDays = includeSaturday ? 6 : 5;
  return Array.from({ length: totalDays }, (_, index) => addDays(weekStart, index));
};

const isAvailabilityActiveOnDate = (
  availability: DoctorAvailabilityResponseDto,
  date: Date
) => {
  const normalizedDate = startOfDay(date);
  const normalizedDateString = formatDateForCalendar(normalizedDate);

  if (availability.validFrom) {
    const validFromDate = startOfDay(new Date(`${availability.validFrom}T12:00:00`));
    if (isBefore(normalizedDate, validFromDate)) {
      return false;
    }
  }

  if (availability.validUntil) {
    const validUntilDate = startOfDay(new Date(`${availability.validUntil}T12:00:00`));
    if (isAfter(normalizedDate, validUntilDate)) {
      return false;
    }
  }

  switch (availability.recurrenceType) {
    case RecurrenceType.NONE:
      return availability.specificDate === normalizedDateString;
    case RecurrenceType.DAILY:
      return true;
    case RecurrenceType.WEEKLY:
      return availability.daysOfWeek?.includes(weekDayNumberToEnum[normalizedDate.getDay()]) ?? false;
    case RecurrenceType.MONTHLY:
      return availability.dayOfMonth === normalizedDate.getDate();
    default:
      return false;
  }
};

const formatCalendarTitle = (view: View, currentDate: Date, includeSaturdayInWorkWeek = false) => {
  if (view === "day") {
    return capitalizeCalendarLabel(
      format(currentDate, "EEEE d 'de' MMMM", { locale: es })
    );
  }

  if (view === "week" || view === "work_week") {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end =
      view === "work_week"
        ? buildWorkWeekRange(currentDate, includeSaturdayInWorkWeek).at(-1) ?? addDays(start, 4)
        : endOfWeek(currentDate, { weekStartsOn: 1 });
    return `${capitalizeCalendarLabel(format(start, "d MMM", { locale: es }))} - ${format(end, "d MMM yyyy", { locale: es })}`;
  }

  return capitalizeCalendarLabel(format(currentDate, "MMMM yyyy", { locale: es }));
};

const navigateCalendarDate = (currentDate: Date, currentView: View, direction: "prev" | "next") => {
  if (currentView === "day") {
    return direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1);
  }

  if (currentView === "week" || currentView === "work_week") {
    return direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
  }

  return direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
};

class TwoRowMonthView extends BaseMonthView {
  override measureRowLimit = () => {
    this.setState({
      needLimitMeasure: false,
      rowLimit: 2,
    });
  };
}

export const BigCalendar = ({
  className,
  doctorId: propDoctorId,
  doctorName,
  autoFilterForDoctor = false,
  readOnly = false,
  blockOnly = false,
  fixedDoctorId,
  isActive = true,
  allowGuestCreation: allowGuestCreationProp,
}: BigCalendarProps) => {
  const { showSuccess, showError } = useToastContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(autoFilterForDoctor ? "day" : "month");
  const [internalDoctorId, setInternalDoctorId] = useState<number | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour?: string } | null>(null);
  const [isRegisterGuestModalOpen, setIsRegisterGuestModalOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [blockDialogMode, setBlockDialogMode] = useState<"block" | "unblock">("block");
  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState<BlockedSlotResponseDto | undefined>();
  const [isSlotActionDialogOpen, setIsSlotActionDialogOpen] = useState(false);
  const [isOverturnDialogOpen, setIsOverturnDialogOpen] = useState(false);
  const [isAbsenceDialogOpen, setIsAbsenceDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [rescheduleTargetAppointment, setRescheduleTargetAppointment] = useState<RescheduleCalendarTarget | null>(null);
  const [selectedAbsence, setSelectedAbsence] = useState<DoctorAbsenceResponseDto | null>(null);
  const [absenceDeleteDialogOpen, setAbsenceDeleteDialogOpen] = useState(false);
  const [monthOverflowDate, setMonthOverflowDate] = useState<Date | null>(null);
  const [monthOverflowEvents, setMonthOverflowEvents] = useState<CalendarEvent[]>([]);
  const [isMonthOverflowSheetOpen, setIsMonthOverflowSheetOpen] = useState(false);
  const [optimisticAppointments, setOptimisticAppointments] = useState<
    AppointmentFullResponseDto[]
  >([]);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState<Doctor | null>(null);

  // Dynamic height per view
  const calendarHeight = useMemo(() => {
    if (currentView === "day" || currentView === "week" || currentView === "work_week") {
      return "calc(100vh - 240px)";
    }
    if (currentView === "month") {
      return "820px";
    }
    return "760px";
  }, [currentView]);

  // Custom Event component - view-aware
  const CustomEvent = useMemo(() => {
    const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
      const { type, patientDni, healthInsurance, affiliationNumber, consultationType } = event.resource;
      const appointmentData = event.resource.data as AppointmentFullResponseDto | OverturnDetailedDto | undefined;
      const eventOrigin =
        type === "appointment" ? (appointmentData as AppointmentFullResponseDto | undefined)?.origin : undefined;
      const showRemoteMarker = isRemoteConsultation(consultationType);
      const showInPersonMarker = !!consultationType && !showRemoteMarker;
      const showNewMarker =
        event.resource.isGuest ||
        eventOrigin === AppointmentOrigin.WEB_GUEST;
      const showOverturnMarker = type === "overturn";

      if (type === "available" || type === "blocked" || type === "absence") {
        const ghostLabel = splitCalendarGhostLabel(
          event.title,
          event.resource.slotHour,
        );

        return (
          <span className="calendar-event-ghost">
            {ghostLabel.time && (
              <span className="calendar-event-time calendar-event-time-ghost">
                {ghostLabel.time}
              </span>
            )}
            <span className="calendar-event-ghost-label">{ghostLabel.label}</span>
          </span>
        );
      }

      if (currentView === "day") {
        const hourDay = format(event.start, "HH:mm");
        const endHourDay = format(event.end, "HH:mm");
        return (
          <div className="calendar-event-content">
            <p className="calendar-event-title">{event.title}</p>
            <p className="calendar-event-meta">
              <span className="calendar-event-time">{hourDay}</span>
              <span className="calendar-event-meta-separator">-</span>
              <span>{endHourDay}</span>
            </p>
            {(patientDni || healthInsurance || consultationType) && (
              <p className="calendar-event-extra">
                {[patientDni, affiliationNumber ? `${healthInsurance} ${affiliationNumber}` : healthInsurance, consultationType]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <div className="calendar-event-markers">
              {showNewMarker && <span className="calendar-event-marker-badge is-highlight">NEW</span>}
              {showOverturnMarker && (
                <span className="calendar-event-marker-icon is-highlight" title="Sobreturno">
                  <Zap className="h-3.5 w-3.5" />
                </span>
              )}
              {showRemoteMarker && (
                <span className="calendar-event-marker-icon" title="Remoto">
                  <Monitor className="h-3.5 w-3.5" />
                </span>
              )}
              {showInPersonMarker && (
                <span className="calendar-event-marker-icon" title="Presencial">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        );
      }

      if (currentView === "month") {
        const hourMonth = format(event.start, "HH:mm");
        return (
          <div className="calendar-event-content calendar-event-content-month">
            <p className="calendar-event-title calendar-event-title-month">
              <span className="calendar-event-time">{hourMonth}</span>
              <span className="calendar-event-meta-separator">·</span>
              <span>{event.title}</span>
            </p>
          </div>
        );
      }

      const hour = format(event.start, "HH:mm");
      const endHour = format(event.end, "HH:mm");
      return (
        <div className="calendar-event-content">
          <p className="calendar-event-title">{event.title}</p>
          <p className="calendar-event-meta">
            <span className="calendar-event-time">{hour}</span>
            <span className="calendar-event-meta-separator">-</span>
            <span>{endHour}</span>
          </p>
          <div className="calendar-event-markers">
            {showNewMarker && <span className="calendar-event-marker-badge is-highlight">NEW</span>}
            {showOverturnMarker && (
              <span className="calendar-event-marker-icon is-highlight" title="Sobreturno">
                <Zap className="h-3.5 w-3.5" />
              </span>
            )}
            {showRemoteMarker && (
              <span className="calendar-event-marker-icon" title="Remoto">
                <Monitor className="h-3.5 w-3.5" />
              </span>
            )}
            {showInPersonMarker && (
              <span className="calendar-event-marker-icon" title="Presencial">
                <MapPin className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      );
    };
    EventComponent.displayName = "CustomEvent";
    return EventComponent;
  }, [currentView]);

  const CalendarColumnHeader = ({ date }: { date: Date }) => {
    const isCurrentDay = isToday(date);

    return (
      <div className="google-calendar-column-header">
        <div className="google-calendar-column-header-main">
          <span className="google-calendar-column-weekday">
            {capitalizeCalendarLabel(format(date, "EEE", { locale: es }))}
          </span>
          <span
            className={`google-calendar-column-date ${isCurrentDay ? "is-today" : ""}`}
          >
            {format(date, "d")}
          </span>
        </div>
        {renderAvailabilityIndicator(date, "column")}
      </div>
    );
  };

  const CalendarMonthDateHeader = ({
    date,
    label,
    onDrillDown,
  }: {
    date: Date;
    label: string;
    onDrillDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <div className="google-calendar-month-date-stack">
      <button
        type="button"
        className={`google-calendar-month-date ${isToday(date) ? "is-today" : ""}`}
        onClick={onDrillDown}
      >
        {label}
      </button>
      {renderAvailabilityIndicator(date, "month")}
    </div>
  );

  const { data: doctorProfileIndividual } = useMyDoctorProfile({
    enabled: autoFilterForDoctor,
  });

  // Determinar el doctorId a usar: prop > auto-filter > internal
  const selectedDoctorId = propDoctorId ?? (autoFilterForDoctor ? doctorProfileIndividual?.userId : internalDoctorId);

  // Determinar si mostrar el selector de médico (solo si no hay doctorId en prop y no es auto-filter)
  const showDoctorSelector = !propDoctorId && !autoFilterForDoctor;

  // Auto-seleccionar el médico si autoFilterForDoctor está activo (para compatibilidad)
  useEffect(() => {
    if (autoFilterForDoctor && doctorProfileIndividual?.userId && !propDoctorId) {
      setInternalDoctorId(doctorProfileIndividual.userId);
    }
  }, [autoFilterForDoctor, doctorProfileIndividual?.userId, propDoctorId]);

  // Buscar el primer mes con disponibilidad para auto-navegar el calendario
  const { firstAvailableDate, isSearching: isSearchingFirstDate } = useFirstAvailableDate({
    doctorId: selectedDoctorId,
    maxMonthsAhead: 6,
    enabled: !!selectedDoctorId && isActive,
  });

  // Auto-navegar al primer mes con disponibilidad cuando se encuentra
  useEffect(() => {
    if (firstAvailableDate && selectedDoctorId) {
      setCurrentDate(firstAvailableDate);
    }
  }, [firstAvailableDate, selectedDoctorId]);

  // Calculate date range for queries (calendar range with buffer)
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

  // Calculate date range for available slots
  const slotsDateRange = useMemo(() => {
    if (currentView === "day") {
      return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    }
    if (currentView === "month") {
      return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
    if (currentView === "work_week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return { start: weekStart, end: addDays(weekStart, 5) };
    }
    // For week/agenda
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    };
  }, [currentView, currentDate]);

  const {
    appointments,
    overturns,
    availableSlots,
    blockedSlots,
    doctorAbsences,
    holidays,
    doctorAvailabilities,
    slotDuration,
    isLoading: isDoctorAgendaLoading,
  } = useDoctorDashboard({
    doctorId: selectedDoctorId,
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    selectedWeekStart: formatDateForCalendar(slotsDateRange.start),
    selectedWeekEnd: formatDateForCalendar(slotsDateRange.end),
    isOwnDashboard: autoFilterForDoctor,
    enabled: !!selectedDoctorId && isActive,
  });
  const isHydratingDoctorAgenda =
    !!selectedDoctorId && isDoctorAgendaLoading;

  const calendarAppointments = useMemo(() => {
    const persistedIds = new Set(appointments.map((appointment) => appointment.id));

    return [
      ...appointments,
      ...optimisticAppointments.filter((appointment) => {
        if (persistedIds.has(appointment.id)) return false;
        if (selectedDoctorId && appointment.doctorId !== selectedDoctorId) {
          return false;
        }
        return (
          appointment.date >= dateRange.dateFrom &&
          appointment.date <= dateRange.dateTo
        );
      }),
    ];
  }, [appointments, dateRange.dateFrom, dateRange.dateTo, optimisticAppointments, selectedDoctorId]);

  useEffect(() => {
    if (appointments.length === 0) return;
    const persistedIds = new Set(appointments.map((appointment) => appointment.id));
    setOptimisticAppointments((current) =>
      current.filter((appointment) => !persistedIds.has(appointment.id))
    );
  }, [appointments]);

  // Show slots in all views except agenda
  const showAvailableSlots = true;

  // Create a Set of holiday dates for quick lookup
  const holidayDatesSet = useMemo(() => {
    if (!holidays) return new Set<string>();
    return new Set(holidays.map((h) => h.date));
  }, [holidays]);

  // Create a Set of FULL-DAY absence dates (no startTime/endTime) for quick lookup
  // Partial absences (with times) only block specific hours, not the whole day
  const absenceDatesSet = useMemo(() => {
    const dates = new Set<string>();
    doctorAbsences.forEach((absence) => {
      if (absence.startTime || absence.endTime) return; // Skip partial absences
      const start = new Date(absence.startDate + "T12:00:00");
      const end = new Date(absence.endDate + "T12:00:00");
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.add(formatDateForCalendar(d));
      }
    });
    return dates;
  }, [doctorAbsences]);

  const includeSaturdayInWorkWeek = useMemo(() => {
    if (!selectedDoctorId) return false;

    const saturday = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 5);
    const saturdayDate = formatDateForCalendar(saturday);

    if (doctorAvailabilities.some((availability) => isAvailabilityActiveOnDate(availability, saturday))) {
      return true;
    }

    if (availableSlots.some((slot) => slot.date === saturdayDate)) {
      return true;
    }

    if (calendarAppointments.some((appointment) => appointment.date === saturdayDate)) {
      return true;
    }

    if (overturns.some((overturn) => overturn.date === saturdayDate)) {
      return true;
    }

    if (blockedSlots.some((blockedSlot) => blockedSlot.date === saturdayDate)) {
      return true;
    }

    return doctorAbsences.some(
      (absence) => absence.startDate <= saturdayDate && absence.endDate >= saturdayDate
    );
  }, [
    availableSlots,
    blockedSlots,
    calendarAppointments,
    currentDate,
    doctorAbsences,
    doctorAvailabilities,
    overturns,
    selectedDoctorId,
  ]);

  const SmartWorkWeekView = useMemo(() => {
    const rangeForDate = (date: Date) => buildWorkWeekRange(date, includeSaturdayInWorkWeek);

    const WorkWeekView = ((props: ViewProps<CalendarEvent>) => {
      const {
        date,
        localizer,
        min = localizer.startOf(new Date(), "day"),
        max = localizer.endOf(new Date(), "day"),
        scrollToTime = localizer.startOf(new Date(), "day"),
        enableAutoScroll = true,
        ...rest
      } = props;

      return (
        <TimeGrid
          {...rest}
          range={rangeForDate(new Date(date))}
          eventOffset={15}
          localizer={localizer}
          min={min}
          max={max}
          scrollToTime={scrollToTime}
          enableAutoScroll={enableAutoScroll}
        />
      );
    }) as React.ComponentType<ViewProps<CalendarEvent>> & ViewStatic & {
      range: (date: Date, options: { localizer: { format: (range: { start: Date; end: Date }, formatKey: string) => string } }) => Date[];
    };

    WorkWeekView.range = (date: Date) => rangeForDate(date);
    WorkWeekView.navigate = (date: Date, action: NavigateAction) => {
      switch (action) {
        case "PREV":
          return subWeeks(date, 1);
        case "NEXT":
          return addWeeks(date, 1);
        default:
          return date;
      }
    };
    WorkWeekView.title = (date: Date, { localizer }) => {
      const range = rangeForDate(date);
      return localizer.format(
        { start: range[0], end: range[range.length - 1] },
        "dayRangeHeaderFormat"
      );
    };

    return WorkWeekView;
  }, [includeSaturdayInWorkWeek]);

  const { changeStatus: changeAppointmentStatus, rescheduleAppointment: rescheduleAppointmentMutation, isRescheduling } = useAppointmentMutations();
  const { changeStatus: changeOverturnStatus, updateOverturn: updateOverturnMutation, isUpdating: isUpdatingOverturn } = useOverturnMutations();
  const { deleteAbsence, isDeleting: isDeletingAbsence } = useDoctorAbsenceMutations();

  const findFullDayAbsenceForDate = useCallback(
    (dateStr: string) =>
      doctorAbsences.find((absence) => {
        if (absence.startTime || absence.endTime) return false;
        return absence.startDate <= dateStr && absence.endDate >= dateStr;
      }),
    [doctorAbsences]
  );

  // Split event computation into independent memos for better performance.
  // A change in appointments won't recompute absence events, etc.

  const CANCELLED_STATUSES = useMemo(() => [
    AppointmentStatus.CANCELLED_BY_PATIENT,
    AppointmentStatus.CANCELLED_BY_SECRETARY,
  ], []);

  // Appointment events
  const appointmentEvents = useMemo<CalendarEvent[]>(() => {
    const activeAppointments = calendarAppointments.filter(
      (apt) => !CANCELLED_STATUSES.includes(apt.status)
    );

    return activeAppointments.map((apt) => {
      const [hours, minutes] = apt.hour.split(":").map(Number);
      const start = new Date(apt.date + "T12:00:00");
      start.setHours(hours, minutes, 0, 0);
      const duration = apt.durationMinutes ?? slotDuration;
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + duration);

      const isGuestAppointment = apt.isGuest === 1 || apt.isGuest === true;
      const patientName = isGuestAppointment
        ? `${apt.guestFirstName || ''} ${apt.guestLastName || ''}`
        : `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`;
      const patientDni = isGuestAppointment
        ? apt.guestDocumentNumber
        : apt.patient?.userName;
      const title = isGuestAppointment ? `🆕 ${patientName}` : patientName;

      return {
        id: apt.id,
        title,
        start,
        end,
        resource: {
          type: "appointment" as const,
          data: apt,
          status: apt.status,
          isGuest: isGuestAppointment,
          patientDni,
          healthInsurance: apt.patient?.healthInsuranceName,
          affiliationNumber: apt.patient?.affiliationNumber,
          consultationType: apt.consultationType?.name,
        },
      };
    });
  }, [calendarAppointments, slotDuration, CANCELLED_STATUSES]);

  // Overturn events
  const overturnEvents = useMemo<CalendarEvent[]>(() => {
    const activeOverturns = overturns.filter(
      (ot) => ot.status !== OverturnStatus.CANCELLED_BY_PATIENT && ot.status !== OverturnStatus.CANCELLED_BY_SECRETARY
    );
    return activeOverturns.map((ot) => {
      const [hours, minutes] = ot.hour.split(":").map(Number);
      const start = new Date(ot.date + "T12:00:00");
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + slotDuration);

      const isGuestOverturn = ot.isGuest === 1 || ot.isGuest === true;
      const patientName = isGuestOverturn
        ? `${ot.guestFirstName || ''} ${ot.guestLastName || ''}`
        : `${ot.patient?.firstName || ''} ${ot.patient?.lastName || ''}`;
      const patientDni = isGuestOverturn
        ? ot.guestDocumentNumber
        : ot.patient?.userName;

      return {
        id: ot.id + 100000,
        title: `⚡ ${patientName}`,
        start,
        end,
        resource: {
          type: "overturn" as const,
          data: ot,
          status: ot.status,
          isGuest: isGuestOverturn,
          patientDni,
          healthInsurance: ot.patient?.healthInsuranceName,
          affiliationNumber: ot.patient?.affiliationNumber,
        },
      };
    });
  }, [overturns, slotDuration]);

  // Set of occupied slot keys (for filtering available slots)
  const occupiedSlotsSet = useMemo(() => {
    const set = new Set<string>();
    calendarAppointments
      .filter((apt) => !CANCELLED_STATUSES.includes(apt.status))
      .forEach((apt) => {
        const baseHour = apt.hour.slice(0, 5);
        set.add(`${apt.date}-${baseHour}`);
        if (apt.durationMinutes && apt.durationMinutes > slotDuration) {
          const extraSlots = Math.ceil(apt.durationMinutes / slotDuration) - 1;
          const [h, m] = baseHour.split(":").map(Number);
          const baseMinutes = h * 60 + m;
          for (let i = 1; i <= extraSlots; i++) {
            const next = baseMinutes + i * slotDuration;
            const hh = String(Math.floor(next / 60)).padStart(2, "0");
            const mm = String(next % 60).padStart(2, "0");
            set.add(`${apt.date}-${hh}:${mm}`);
          }
        }
      });
    overturns
      .filter((ot) => ot.status !== OverturnStatus.CANCELLED_BY_PATIENT && ot.status !== OverturnStatus.CANCELLED_BY_SECRETARY)
      .forEach((ot) => {
        set.add(`${ot.date}-${ot.hour.slice(0, 5)}`);
      });
    blockedSlots.forEach((blocked) => {
      set.add(`${blocked.date}-${blocked.hour.slice(0, 5)}`);
    });
    return set;
  }, [calendarAppointments, overturns, blockedSlots, CANCELLED_STATUSES, slotDuration]);

  const availableHoursByDate = useMemo(() => {
    const uniqueSlots = new Map<string, (typeof availableSlots)[number]>();

    availableSlots.forEach((slot) => {
      const normalizedSlotHour = normalizeHour(slot.hour);
      const uniqueKey = `${slot.date}-${normalizedSlotHour}`;
      if (!uniqueSlots.has(uniqueKey)) {
        uniqueSlots.set(uniqueKey, {
          ...slot,
          hour: normalizedSlotHour,
        });
      }
    });

    const groupedByDate = new Map<string, string[]>();

    Array.from(uniqueSlots.values())
      .filter((slot) => {
        const key = `${slot.date}-${slot.hour}`;
        if (occupiedSlotsSet.has(key) || holidayDatesSet.has(slot.date)) return false;
        if (absenceDatesSet.has(slot.date)) return false;
        const isBlockedByPartialAbsence = doctorAbsences.some((absence) => {
          if (!absence.startTime || !absence.endTime) return false;
          if (slot.date < absence.startDate || slot.date > absence.endDate) return false;
          return (
            slot.hour >= normalizeHour(absence.startTime) &&
            slot.hour < normalizeHour(absence.endTime)
          );
        });
        return !isBlockedByPartialAbsence;
      })
      .sort((left, right) =>
        `${left.date}-${left.hour}`.localeCompare(`${right.date}-${right.hour}`)
      )
      .forEach((slot) => {
        const current = groupedByDate.get(slot.date) ?? [];
        current.push(slot.hour);
        groupedByDate.set(slot.date, current);
      });

    return groupedByDate;
  }, [availableSlots, occupiedSlotsSet, holidayDatesSet, absenceDatesSet, doctorAbsences]);

  // Available slot events (filtered by occupied, holidays, absences)
  const availableSlotEvents = useMemo<CalendarEvent[]>(() => {
    return Array.from(availableHoursByDate.entries()).flatMap(([date, hours]) =>
      hours.map((hour) => {
        const [hoursNumber, minutes] = hour.split(":").map(Number);
        const start = new Date(date + "T12:00:00");
        start.setHours(hoursNumber, minutes, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + slotDuration);

        return {
          id: `available-${date}-${hour}`,
          title: `${hour} - Disponible`,
          start,
          end,
          resource: {
            type: "available" as const,
            slotDate: date,
            slotHour: hour,
          },
        };
      })
    );
  }, [availableHoursByDate, slotDuration]);

  function openAvailabilityDay(date: Date) {
    setCurrentDate(date);
    setCurrentView("day");
    setIsEventDialogOpen(false);
  }

  function openAvailabilitySlot(date: string, hour: string) {
    setCurrentDate(new Date(`${date}T12:00:00`));
    if (readOnly) {
      setCurrentView("day");
      setIsEventDialogOpen(false);
      return;
    }

    setSelectedSlot({ date, hour });
    if (blockOnly) {
      setBlockDialogMode("block");
      setIsBlockDialogOpen(true);
      return;
    }

    setIsSlotActionDialogOpen(true);
  }

  function renderAvailabilityIndicator(
    date: Date,
    variant: "month" | "column",
  ) {
    if (!selectedDoctorId || currentView === "day") {
      return null;
    }

    const dateStr = formatDateForCalendar(date);
    const hours = availableHoursByDate.get(dateStr);

    if (!hours || hours.length === 0) {
      return null;
    }

    const previewHours = hours.slice(0, MAX_AVAILABILITY_PREVIEW_HOURS);
    const hiddenHoursCount = Math.max(0, hours.length - previewHours.length);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`google-calendar-availability-pill is-${variant}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {hours.length} libre{hours.length === 1 ? "" : "s"}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={variant === "month" ? "start" : "center"}
          className="google-calendar-availability-popover"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="space-y-3">
            <div>
              <p className="google-calendar-availability-kicker">
                Turnos libres
              </p>
              <p className="google-calendar-availability-date">
                {format(date, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>

            <div className="google-calendar-availability-hours">
              {previewHours.map((hour) => (
                <button
                  key={`${dateStr}-${hour}`}
                  type="button"
                  className="google-calendar-availability-hour"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openAvailabilitySlot(dateStr, hour);
                  }}
                >
                  {formatTimeAR(hour.length === 5 ? `${hour}:00` : hour)}
                </button>
              ))}
            </div>

            {hiddenHoursCount > 0 && (
              <p className="google-calendar-availability-more">
                +{hiddenHoursCount} horario
                {hiddenHoursCount === 1 ? "" : "s"} disponible
                {hiddenHoursCount === 1 ? "" : "s"} en el día
              </p>
            )}

            <div className="google-calendar-availability-actions">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openAvailabilityDay(date);
                }}
              >
                Ver día completo
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Blocked slot events
  const blockedSlotEvents = useMemo<CalendarEvent[]>(() => {
    return blockedSlots.map((blocked) => {
      const [hours, minutes] = blocked.hour.split(":").map(Number);
      const start = new Date(blocked.date + "T12:00:00");
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + slotDuration);

      const reasonLabel = BlockReasonLabels[blocked.reason] || blocked.reason;
      return {
        id: `blocked-${blocked.id}`,
        title: `🔒 ${reasonLabel}`,
        start,
        end,
        resource: {
          type: "blocked" as const,
          data: blocked,
          slotDate: blocked.date,
          slotHour: blocked.hour.slice(0, 5),
        },
      };
    });
  }, [blockedSlots, slotDuration]);

  // Absence events
  const absenceEvents = useMemo<CalendarEvent[]>(() => {
    return doctorAbsences
      .filter((absence) => {
        return absence.startDate <= dateRange.dateTo && absence.endDate >= dateRange.dateFrom;
      })
      .flatMap((absence) => {
        const evts: CalendarEvent[] = [];
        const isPartial = !!absence.startTime && !!absence.endTime;
        const rangeStart = new Date(absence.startDate + "T12:00:00");
        const rangeEnd = new Date(absence.endDate + "T12:00:00");

        for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
          const dateStr = formatDateForCalendar(d);
          const label = AbsenceLabels[absence.type] || absence.type;

          if (isPartial) {
            const [sh, sm] = absence.startTime!.split(":").map(Number);
            const [eh, em] = absence.endTime!.split(":").map(Number);
            const evStart = new Date(d);
            evStart.setHours(sh, sm, 0, 0);
            const evEnd = new Date(d);
            evEnd.setHours(eh, em, 0, 0);
            const timeLabel = `${absence.startTime!.slice(0, 5)} - ${absence.endTime!.slice(0, 5)}`;
            evts.push({
              id: `absence-${absence.id}-${dateStr}`,
              title: `Ausencia: ${label} (${timeLabel})`,
              start: evStart,
              end: evEnd,
              resource: { type: "absence" as const, data: absence },
            });
          } else {
            evts.push({
              id: `absence-${absence.id}-${dateStr}`,
              title: `Ausencia: ${label}`,
              start: new Date(d),
              end: new Date(d),
              allDay: true,
              resource: { type: "absence" as const, data: absence },
            });
          }
        }
        return evts;
      });
  }, [doctorAbsences, dateRange]);

  // Combine all event types
  const events = useMemo<CalendarEvent[]>(() => {
    if (isHydratingDoctorAgenda) {
      return [];
    }
    if (showAvailableSlots) {
      return [...absenceEvents, ...appointmentEvents, ...overturnEvents, ...availableSlotEvents, ...blockedSlotEvents];
    }
    return [...absenceEvents, ...appointmentEvents, ...overturnEvents, ...blockedSlotEvents];
  }, [showAvailableSlots, absenceEvents, appointmentEvents, overturnEvents, availableSlotEvents, blockedSlotEvents, isHydratingDoctorAgenda]);

  // Get color for event based on status
  const getEventStyle = useCallback((event: CalendarEvent) => {
    const isInteractive = !readOnly || blockOnly;

    if (event.resource.type === "absence") {
      return {
        className: "absence-event",
        style: {
          backgroundColor: "#fde7d8",
          color: "#9a3412",
          borderRadius: "12px",
          border: "1px solid #fdba74",
        },
      };
    }

    if (event.resource.type === "available") {
      return {
        className: "available-slot-event",
        style: {
          backgroundColor: isInteractive ? "#ffffff" : "#f8fafc",
          color: isInteractive ? "#0f172a" : "#9ca3af",
          cursor: isInteractive ? "pointer" : "default",
          fontWeight: "500",
          opacity: isInteractive ? 1 : 0.6,
          borderRadius: "12px",
        },
      };
    }

    if (event.resource.type === "blocked") {
      return {
        className: "blocked-slot-event",
        style: {
          backgroundColor: "#fff1f2",
          color: "#be123c",
          cursor: isInteractive ? "pointer" : "default",
          fontWeight: "600",
          border: "1px dashed #fb7185",
          borderRadius: "12px",
        },
      };
    }

    const status = event.resource.status;
    const isOverturn = event.resource.type === "overturn";

    let backgroundColor = "#fef3c7";
    let textColor = "#92400e";
    let borderColor = "#facc15";

    if (isOverturn) {
      backgroundColor = "#feefc3";
      textColor = "#9a3412";
      borderColor = "#f59e0b";
    } else {
      switch (status) {
        case AppointmentStatus.PENDING:
        case AppointmentStatus.REQUESTED_BY_PATIENT:
        case AppointmentStatus.ASSIGNED_BY_SECRETARY:
          backgroundColor = "#fef3c7";
          textColor = "#92400e";
          borderColor = "#facc15";
          break;
        case AppointmentStatus.WAITING:
          backgroundColor = "#d9f2e3";
          textColor = "#166534";
          borderColor = "#34a853";
          break;
        case AppointmentStatus.ATTENDING:
          backgroundColor = "#dbeafe";
          textColor = "#1d4ed8";
          borderColor = "#4285f4";
          break;
        case AppointmentStatus.COMPLETED:
          backgroundColor = "#eceff1";
          textColor = "#475569";
          borderColor = "#94a3b8";
          break;
        case AppointmentStatus.CANCELLED_BY_PATIENT:
        case AppointmentStatus.CANCELLED_BY_SECRETARY:
          backgroundColor = "#fee2e2";
          textColor = "#b91c1c";
          borderColor = "#f87171";
          break;
      }
    }

    return {
      className: "google-calendar-event",
      style: {
        backgroundColor,
        borderLeft: `5px solid ${borderColor}`,
        borderRadius: "14px",
        opacity: status === AppointmentStatus.COMPLETED ||
          status === AppointmentStatus.CANCELLED_BY_PATIENT ||
          status === AppointmentStatus.CANCELLED_BY_SECRETARY ? 0.6 : 1,
        color: textColor,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
      },
    };
  }, [readOnly, blockOnly]);

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.resource.type === "absence") {
      if (readOnly) return;
      setSelectedAbsence(event.resource.data as DoctorAbsenceResponseDto);
      setAbsenceDeleteDialogOpen(true);
      return;
    }

    // If it's an available slot, show action dialog (unless readOnly)
    if (event.resource.type === "available") {
      if (readOnly) return; // Don't allow any action in readOnly mode
      setSelectedSlot({
        date: event.resource.slotDate!,
        hour: event.resource.slotHour,
      });
      // In blockOnly mode, directly open block dialog (skip action dialog)
      if (blockOnly) {
        setBlockDialogMode("block");
        setIsBlockDialogOpen(true);
      } else {
        setIsSlotActionDialogOpen(true);
      }
      return;
    }

    // If it's a blocked slot, open unblock dialog (unless readOnly)
    if (event.resource.type === "blocked") {
      if (readOnly) return; // Don't allow unblocking in readOnly mode
      setSelectedSlot({
        date: event.resource.slotDate!,
        hour: event.resource.slotHour,
      });
      setSelectedBlockedSlot(event.resource.data as BlockedSlotResponseDto);
      setBlockDialogMode("unblock");
      setIsBlockDialogOpen(true);
      return;
    }

    // If it's a cancelled appointment, treat it as an available slot (allow creating new appointment)
    const CANCELLED_STATUSES = [
      AppointmentStatus.CANCELLED_BY_PATIENT,
      AppointmentStatus.CANCELLED_BY_SECRETARY,
    ];
    if (event.resource.type === "appointment" && CANCELLED_STATUSES.includes(event.resource.status as AppointmentStatus)) {
      if (readOnly) return;
      const appointmentData = event.resource.data as AppointmentFullResponseDto;
      setSelectedSlot({
        date: appointmentData.date,
        hour: appointmentData.hour.slice(0, 5),
      });
      if (blockOnly) {
        setBlockDialogMode("block");
        setIsBlockDialogOpen(true);
      } else {
        setIsSlotActionDialogOpen(true);
      }
      return;
    }

    // For appointments/overturns, open right-side details panel
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }, [readOnly, blockOnly]);

  // Handle slot selection (click on empty space)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    // Don't allow creating in readOnly or blockOnly mode
    if (readOnly || blockOnly) return;

    // In month view, do nothing (slots are shown in day/week views)
    if (currentView === "month") {
      return;
    }

    // In week/day view, open create dialog with selected date and hour
    const date = formatDateForCalendar(slotInfo.start);
    const hour = format(slotInfo.start, "HH:mm");
    const fullDayAbsence = findFullDayAbsenceForDate(date);
    if (fullDayAbsence) {
      setSelectedAbsence(fullDayAbsence);
      setAbsenceDeleteDialogOpen(true);
      return;
    }
    setSelectedSlot({ date, hour });
    setIsCreateDialogOpen(true);
  }, [currentView, readOnly, blockOnly, findFullDayAbsenceForDate]);

  // Update current date when navigating calendar
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
    setIsEventDialogOpen(false);
  }, []);

  // Handle drill down (click on day number in month view)
  const handleDrillDown = useCallback((date: Date, view: View) => {
    setCurrentView(view);
    setCurrentDate(date);
    setIsEventDialogOpen(false);
  }, []);

  const handleShowMore = useCallback((eventsForDay: CalendarEvent[], date: Date) => {
    const relevantEvents = eventsForDay
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    setMonthOverflowDate(date);
    setMonthOverflowEvents(relevantEvents);
    setIsMonthOverflowSheetOpen(true);
  }, []);

  // Handle status change
  const handleStatusChange = async (newStatus: AppointmentStatus | OverturnStatus) => {
    if (!selectedEvent || !selectedEvent.resource.data) return;

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

      // Mensajes específicos por estado
      const messages: Record<string, { title: string; description: string }> = {
        [AppointmentStatus.WAITING]: {
          title: "Paciente en espera",
          description: "El paciente fue marcado en sala de espera"
        },
        [AppointmentStatus.ATTENDING]: {
          title: "Atendiendo paciente",
          description: "Se inició la atención del paciente"
        },
        [AppointmentStatus.COMPLETED]: {
          title: "Turno completado",
          description: "La consulta ha sido finalizada"
        },
        [AppointmentStatus.CANCELLED_BY_SECRETARY]: {
          title: "Turno cancelado",
          description: "El turno fue cancelado correctamente"
        },
      };

      const msg = messages[newStatus] || { title: "Estado actualizado", description: "El estado del turno se actualizó correctamente" };
      showSuccess(msg.title, msg.description);

      setIsEventDialogOpen(false);
      setCancelConfirmOpen(false);
    } catch {
      showError("Error", "No se pudo actualizar el estado");
    }
  };

  // Day prop getter - highlight holidays, weekends and absences
  const getDayPropGetter = useCallback(
    (date: Date) => {
      const dateStr = formatDateForCalendar(date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayDatesSet.has(dateStr);
      const isAbsence = absenceDatesSet.has(dateStr);

      if (isHoliday) {
        return {
          className: "holiday-day",
          style: {
            backgroundColor: "#fef2f2", // light red
          },
        };
      }

      if (isAbsence) {
        return {
          className: "absence-day",
          style: {
            backgroundColor: "#fff7ed", // light orange
          },
        };
      }

      if (isWeekend) {
        return {
          className: "weekend-day",
          style: {
            backgroundColor: "#f3f4f6", // light gray
          },
        };
      }

      return {};
    },
    [holidayDatesSet, absenceDatesSet]
  );

  const isLoading = isDoctorAgendaLoading || isSearchingFirstDate;
  const calendarTitle = useMemo(
    () => formatCalendarTitle(currentView, currentDate, includeSaturdayInWorkWeek),
    [currentDate, currentView, includeSaturdayInWorkWeek]
  );
  const closeEventPanel = () => {
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  };
  const closeMonthOverflowSheet = () => {
    setIsMonthOverflowSheetOpen(false);
    setMonthOverflowDate(null);
    setMonthOverflowEvents([]);
  };
  const handleDeleteAbsence = async () => {
    if (!selectedAbsence) return;
    try {
      await deleteAbsence.mutateAsync({
        id: selectedAbsence.id,
        doctorId: selectedAbsence.doctorId,
      });
      showSuccess("Ausencia eliminada", "La ausencia se quitó correctamente");
      setAbsenceDeleteDialogOpen(false);
      setSelectedAbsence(null);
    } catch {
      showError("Error", "No se pudo quitar la ausencia");
    }
  };

  const selectedEventData = selectedEvent?.resource.data as AppointmentFullResponseDto | OverturnDetailedDto | undefined;
  const selectedAppointmentData = selectedEventData as AppointmentFullResponseDto | undefined;
  const selectedIsGuest = !!selectedEvent?.resource.isGuest;
  const selectedPatientName = selectedEventData
    ? selectedIsGuest
      ? `${selectedAppointmentData?.guestFirstName || ""} ${selectedAppointmentData?.guestLastName || ""}`.trim()
      : `${selectedEventData.patient?.firstName || ""} ${selectedEventData.patient?.lastName || ""}`.trim()
    : "";
  const selectedPatientPhone = selectedIsGuest
    ? selectedAppointmentData?.guestPhone
    : selectedEventData?.patient?.phoneNumber;
  const selectedPatientDocument = selectedIsGuest
    ? selectedAppointmentData?.guestDocumentNumber
    : selectedEventData?.patient?.userName;
  const selectedHealthInsurance = selectedEventData?.patient?.healthInsuranceName;
  const selectedAffiliationNumber = selectedEventData?.patient?.affiliationNumber;
  const selectedConsultationTypeBadge = getConsultationTypeBadgeLabel(selectedEvent?.resource.consultationType);
  const selectedOrigin = selectedEvent?.resource.type === "overturn"
    ? "Sobreturno"
    : selectedAppointmentData?.origin
      ? AppointmentOriginLabels[selectedAppointmentData.origin as AppointmentOrigin]
      : "Secretaría";
  const selectedStatusLabel = selectedEvent
    ? selectedEvent.resource.type === "appointment"
      ? AppointmentStatusLabels[selectedEvent.resource.status as AppointmentStatus]
      : OverturnStatusLabels[selectedEvent.resource.status as OverturnStatus]
    : "";
  const selectedStatusClassName = (() => {
    if (!selectedEvent) return "";
    if (selectedEvent.resource.type === "overturn") {
      return "google-calendar-status-pill google-calendar-status-pill-overturn";
    }

    switch (selectedEvent.resource.status as AppointmentStatus) {
      case AppointmentStatus.WAITING:
        return "google-calendar-status-pill google-calendar-status-pill-waiting";
      case AppointmentStatus.ATTENDING:
        return "google-calendar-status-pill google-calendar-status-pill-attending";
      case AppointmentStatus.COMPLETED:
        return "google-calendar-status-pill google-calendar-status-pill-completed";
      case AppointmentStatus.CANCELLED_BY_PATIENT:
      case AppointmentStatus.CANCELLED_BY_SECRETARY:
        return "google-calendar-status-pill google-calendar-status-pill-cancelled";
      default:
        return "google-calendar-status-pill google-calendar-status-pill-pending";
    }
  })();

  return (
    <div className={className}>
      <div className="google-calendar-shell">
        <div className="google-calendar-main">
          <div className="google-calendar-toolbar">
            <div className="google-calendar-toolbar-left">
              <div className="google-calendar-brand">
                <div className="google-calendar-brand-icon">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="google-calendar-brand-title">
                    {doctorName
                      ? doctorName
                      : autoFilterForDoctor
                      ? "Mis turnos"
                      : "Turnos"}
                  </p>
                </div>
              </div>

              <div className="google-calendar-navigation">
                <Button
                  variant="outline"
                  size="sm"
                  className="google-calendar-today"
                  onClick={() => handleNavigate(new Date())}
                >
                  Hoy
                </Button>
                <div className="google-calendar-nav-buttons">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="google-calendar-nav-button"
                    onClick={() =>
                      handleNavigate(navigateCalendarDate(currentDate, currentView, "prev"))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="google-calendar-nav-button"
                    onClick={() =>
                      handleNavigate(navigateCalendarDate(currentDate, currentView, "next"))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="google-calendar-title">{calendarTitle}</h2>
              </div>
            </div>

            <div className="google-calendar-toolbar-right">
              {showDoctorSelector && (
                <div className="google-calendar-doctor-filter">
                  <p className="google-calendar-doctor-filter-label">Médico</p>
                  <DoctorSelect
                    value={internalDoctorId}
                    onValueChange={setInternalDoctorId}
                    onDoctorSelect={setSelectedDoctorDetails}
                    placeholder="Todos los médicos"
                    className="google-calendar-doctor-select-trigger"
                  />
                  <p className="google-calendar-doctor-filter-caption">
                    {selectedDoctorDetails
                      ? selectedDoctorDetails.specialities?.length
                        ? selectedDoctorDetails.specialities.map((speciality) => speciality.name).join(", ")
                        : "Agenda individual seleccionada"
                      : "Seleccioná un profesional para enfocar la agenda"}
                  </p>
                </div>
              )}

              <div className="google-calendar-view-switcher">
                {calendarViewOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className={`google-calendar-view-button ${currentView === option.value ? "is-active" : ""}`}
                    onClick={() => {
                      setCurrentView(option.value);
                      setIsEventDialogOpen(false);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {selectedDoctorId && (currentView === "day" || currentView === "week" || currentView === "work_week") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPrintDialogOpen(true)}
                >
                  <Printer className="mr-1.5 h-4 w-4" />
                  Imprimir
                </Button>
              )}
            </div>
          </div>

          <div className="google-calendar-body">
            <div className={`google-calendar-scroll-shell is-${currentView}`}>
              <Card className="google-calendar-surface">
                <CardContent className="p-0">
                  <div className="relative google-calendar-board" style={{ height: calendarHeight, minHeight: "500px" }}>
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    toolbar={false}
                    views={{
                      month: TwoRowMonthView,
                      week: true,
                      work_week: SmartWorkWeekView,
                      day: true,
                    }}
                    view={currentView}
                    onView={(nextView) => {
                      setCurrentView(nextView);
                      setIsEventDialogOpen(false);
                    }}
                    date={currentDate}
                    onNavigate={handleNavigate}
                    onDrillDown={handleDrillDown}
                    messages={messages}
                    culture="es"
                    eventPropGetter={getEventStyle}
                    dayPropGetter={getDayPropGetter}
                    onSelectEvent={handleSelectEvent}
                    onShowMore={handleShowMore}
                    onSelectSlot={handleSelectSlot}
                    selectable={!readOnly && !blockOnly}
                    popup={false}
                    doShowMoreDrillDown={false}
                    dayLayoutAlgorithm="no-overlap"
                    step={slotDuration}
                    timeslots={1}
                    min={new Date(0, 0, 0, 7, 0, 0)}
                    max={new Date(0, 0, 0, 21, 0, 0)}
                    formats={{
                      timeGutterFormat: (date: Date) => format(date, "HH:mm"),
                      eventTimeRangeFormat: ({ start }: { start: Date }) => format(start, "HH:mm"),
                      weekdayFormat: (date: Date) => capitalizeCalendarLabel(format(date, "EEE", { locale: es })),
                    }}
                    components={{
                      event: CustomEvent,
                      week: {
                        header: CalendarColumnHeader,
                      },
                      work_week: {
                        header: CalendarColumnHeader,
                      },
                      day: {
                        header: CalendarColumnHeader,
                      },
                      month: {
                        dateHeader: CalendarMonthDateHeader,
                      },
                    }}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  )}
                  </div>

                  {currentView === "day" && !readOnly && selectedDoctorId && (
                    <div className="border-t border-slate-200 p-4">
                      <Button
                        className="h-12 w-full rounded-2xl bg-orange-500 text-base text-white hover:bg-orange-600"
                        onClick={() => setIsOverturnDialogOpen(true)}
                      >
                        <AlertCircle className="mr-2 h-5 w-5" />
                        Crear sobreturno
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="google-calendar-legend-groups">
            <div className="google-calendar-legend-group">
              <p className="google-calendar-legend-heading">Estados y origen</p>
              <div className="google-calendar-legend-grid">
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip pending" />
                  <span>Pendiente</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip web" />
                  <span>Paciente web</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip waiting" />
                  <span>En espera</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip attending" />
                  <span>Atendiendo</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip completed" />
                  <span>Completado</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip cancelled" />
                  <span>Cancelado</span>
                </div>
              </div>
            </div>

            <div className="google-calendar-legend-group">
              <p className="google-calendar-legend-heading">Marcas especiales</p>
              <div className="google-calendar-legend-grid">
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip overturn" />
                  <span>Sobreturno</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip blocked" />
                  <span>Bloqueado</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip holiday" />
                  <span>Feriado</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-chip absence" />
                  <span>Ausencia</span>
                </div>
              </div>
            </div>

            <div className="google-calendar-legend-group">
              <p className="google-calendar-legend-heading">Marcadores del turno</p>
              <div className="google-calendar-legend-grid">
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-marker-badge is-highlight">NEW</span>
                  <span>Paciente nuevo o invitado</span>
                </div>
                <div className="google-calendar-legend-item">
                  <span className="google-calendar-legend-marker-icon is-highlight">
                    <Zap className="h-3.5 w-3.5" />
                  </span>
                  <span>Sobreturno</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sheet
        open={!!selectedEvent && isEventDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeEventPanel();
          }
        }}
      >
        {selectedEvent?.resource.data && (
          <SheetContent side="right" className="google-calendar-event-sheet w-[min(100vw,420px)] sm:max-w-[420px]">
            <SheetHeader className="google-calendar-side-panel-header">
              <div>
                <p className="google-calendar-side-panel-kicker">
                  {selectedEvent.resource.type === "overturn" ? "Sobreturno" : "Turno"}
                </p>
                <SheetTitle className="google-calendar-side-panel-title">
                  {selectedPatientName}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Detalle del turno seleccionado
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="google-calendar-side-panel-section">
              <p className="google-calendar-section-title">Resumen</p>
              <div className="google-calendar-summary-card">
                <div className="google-calendar-summary-main">
                  <div className="google-calendar-summary-date">
                    <CalendarDays className="h-4 w-4" />
                    <span>{format(selectedEvent.start, "EEEE d 'de' MMMM", { locale: es })}</span>
                  </div>
                  <p className="google-calendar-summary-time">
                    {formatTimeAR((selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).hour)}
                  </p>
                </div>
                <div className="google-calendar-summary-meta">
                  <Badge variant="outline" className={selectedStatusClassName}>
                    {selectedStatusLabel}
                  </Badge>
                  <Badge variant="outline" className="google-calendar-origin-pill">
                    {selectedOrigin}
                  </Badge>
                  {selectedConsultationTypeBadge && (
                    <Badge variant="outline" className="google-calendar-origin-pill consultation-type">
                      {selectedConsultationTypeBadge}
                    </Badge>
                  )}
                  {selectedEvent.resource.isGuest && (
                    <Badge variant="outline" className="google-calendar-origin-pill guest">Invitado</Badge>
                  )}
                </div>
              </div>

              <div className="google-calendar-detail-row">
                <Stethoscope className="h-4 w-4" />
                <div>
                  <p className="google-calendar-detail-primary">
                    {selectedEventData?.doctor &&
                      formatDoctorName(selectedEventData.doctor)}
                  </p>
                  <p className="google-calendar-detail-secondary">Profesional asignado</p>
                </div>
              </div>

              <div className="google-calendar-detail-row">
                <User className="h-4 w-4" />
                <div>
                  <p className="google-calendar-detail-primary">Paciente</p>
                  <p className="google-calendar-detail-secondary">
                    {selectedPatientDocument ? `DNI ${selectedPatientDocument}` : "Sin documento visible"}
                  </p>
                </div>
              </div>
            </div>

            <div className="google-calendar-side-panel-section">
              <p className="google-calendar-section-title">Paciente</p>

              <div className="google-calendar-info-card">
                <div className="google-calendar-info-row">
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="google-calendar-info-label">Teléfono</p>
                    <p className="google-calendar-info-value">{selectedPatientPhone || "Sin teléfono cargado"}</p>
                  </div>
                </div>
                <div className="google-calendar-info-row">
                  <Shield className="h-4 w-4" />
                  <div>
                    <p className="google-calendar-info-label">Obra social</p>
                    <p className="google-calendar-info-value">{selectedHealthInsurance || "Particular / sin obra social"}</p>
                  </div>
                </div>
                <div className="google-calendar-info-row">
                  <CreditCard className="h-4 w-4" />
                  <div>
                    <p className="google-calendar-info-label">N.° de afiliado</p>
                    <p className="google-calendar-info-value">{selectedAffiliationNumber || "Sin número de afiliado"}</p>
                  </div>
                </div>
              </div>

              {selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment" && (
                <div className="google-calendar-warning">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Este turno pertenece a un invitado sin registrar. Para cambiar el estado, primero registralo como paciente.
                  </span>
                </div>
              )}
            </div>

            <div className="google-calendar-side-panel-actions">
              <p className="google-calendar-section-title">Acciones</p>
              {(selectedEvent.resource.status === AppointmentStatus.PENDING ||
                selectedEvent.resource.status === AppointmentStatus.ASSIGNED_BY_SECRETARY) && (() => {
                  const appointmentDate = (selectedEvent.resource.data as AppointmentFullResponseDto).date;
                  const today = formatDateForCalendar(new Date());
                  const isToday = appointmentDate === today;
                  const isGuestAppointment = !!selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment";
                  const disabledWaiting = !isToday || isGuestAppointment;
                  const waitingTitle = isGuestAppointment
                    ? "Debe registrar al invitado como paciente antes de cambiar el estado"
                    : !isToday
                      ? "Solo se puede poner en espera un turno del día de hoy"
                      : undefined;
                  return (
                    <Button
                      className="google-calendar-action-button justify-start bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => handleStatusChange(AppointmentStatus.WAITING)}
                      disabled={disabledWaiting}
                      title={waitingTitle}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Marcar en espera
                    </Button>
                  );
                })()}

              {selectedEvent.resource.status === AppointmentStatus.WAITING && (
                <Button
                  className="google-calendar-action-button justify-start bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleStatusChange(AppointmentStatus.ATTENDING)}
                  disabled={!!selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment"}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Atender
                </Button>
              )}

              {selectedEvent.resource.status === AppointmentStatus.ATTENDING && (
                <Button
                  className="google-calendar-action-button justify-start bg-slate-700 text-white hover:bg-slate-800"
                  onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}
                  disabled={!!selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment"}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completar
                </Button>
              )}

              {(selectedEvent.resource.status === AppointmentStatus.PENDING ||
                selectedEvent.resource.status === AppointmentStatus.WAITING) &&
                !readOnly && (
                  <Button
                    variant="outline"
                    className="google-calendar-action-button justify-start border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                    onClick={() => {
                      if (selectedEvent.resource.type === "appointment") {
                        const appt = selectedEvent.resource.data as AppointmentFullResponseDto;
                        setRescheduleTargetAppointment({
                          type: "appointment",
                          id: appt.id,
                          doctorId: appt.doctorId,
                          date: appt.date,
                          hour: appt.hour,
                          consultationTypeId: appt.consultationTypeId,
                          doctor: appt.doctor ?? null,
                          patient: appt.patient ?? null,
                        });
                      } else {
                        const overturn = selectedEvent.resource.data as OverturnDetailedDto;
                        setRescheduleTargetAppointment({
                          type: "overturn",
                          id: overturn.id,
                          doctorId: overturn.doctorId,
                          date: overturn.date,
                          hour: overturn.hour,
                          doctor: overturn.doctor ?? null,
                          patient: overturn.patient ?? null,
                        });
                      }
                      setIsEventDialogOpen(false);
                      setIsRescheduleDialogOpen(true);
                    }}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Reprogramar
                  </Button>
                )}

              {(selectedEvent.resource.status === AppointmentStatus.PENDING ||
                selectedEvent.resource.status === AppointmentStatus.WAITING) && (
                <Button
                  variant="outline"
                  className="google-calendar-action-button justify-start border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                  onClick={() => setCancelConfirmOpen(true)}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}

              {selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment" && (
                <Button
                  variant="outline"
                  className="google-calendar-action-button justify-start border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  onClick={() => {
                    setIsEventDialogOpen(false);
                    setIsRegisterGuestModalOpen(true);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar paciente
                </Button>
              )}
            </div>
          </SheetContent>
        )}
      </Sheet>

      <Sheet
        open={isMonthOverflowSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeMonthOverflowSheet();
          }
        }}
      >
        <SheetContent side="right" className="google-calendar-event-sheet w-[min(100vw,380px)] sm:max-w-[380px]">
          <SheetHeader className="google-calendar-side-panel-header">
            <div>
              <p className="google-calendar-side-panel-kicker">Agenda del día</p>
              <SheetTitle className="google-calendar-side-panel-title">
                {monthOverflowDate
                  ? format(monthOverflowDate, "EEEE d 'de' MMMM", { locale: es })
                  : "Eventos"}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Lista de eventos del día seleccionado en la vista mes
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="google-calendar-side-panel-section">
            <p className="google-calendar-section-title">Eventos</p>
            <div className="google-calendar-month-overflow-list">
              {monthOverflowEvents.length === 0 ? (
                <div className="google-calendar-month-overflow-empty">
                  No hay eventos para mostrar en este día.
                </div>
              ) : (
                monthOverflowEvents.map((event) => (
                  <button
                    key={String(event.id)}
                    type="button"
                    className="google-calendar-month-overflow-item"
                    onClick={() => {
                      closeMonthOverflowSheet();
                      handleSelectEvent(event);
                    }}
                  >
                    <div
                      className={`google-calendar-month-overflow-accent is-${
                        event.resource.type === "available"
                          ? "available"
                          : event.resource.type === "overturn"
                          ? "overturn"
                          : event.resource.status === AppointmentStatus.WAITING
                            ? "waiting"
                            : event.resource.status === AppointmentStatus.ATTENDING
                              ? "attending"
                              : event.resource.status === AppointmentStatus.COMPLETED
                                ? "completed"
                                : event.resource.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
                                    event.resource.status === AppointmentStatus.CANCELLED_BY_SECRETARY
                                  ? "cancelled"
                                  : "pending"
                      }`}
                    />
                    <div className="google-calendar-month-overflow-content">
                      <p className="google-calendar-month-overflow-time">
                        {format(event.start, "HH:mm")}
                      </p>
                      <p className="google-calendar-month-overflow-title">{event.title}</p>
                      <div className="google-calendar-month-overflow-meta">
                        {event.resource.type === "available" ? (
                          <Badge variant="outline" className="google-calendar-origin-pill available">
                            Disponible
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              variant="outline"
                              className={
                                event.resource.type === "overturn"
                                  ? "google-calendar-status-pill google-calendar-status-pill-overturn"
                                  : event.resource.status === AppointmentStatus.WAITING
                                    ? "google-calendar-status-pill google-calendar-status-pill-waiting"
                                    : event.resource.status === AppointmentStatus.ATTENDING
                                      ? "google-calendar-status-pill google-calendar-status-pill-attending"
                                      : event.resource.status === AppointmentStatus.COMPLETED
                                        ? "google-calendar-status-pill google-calendar-status-pill-completed"
                                        : event.resource.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
                                            event.resource.status === AppointmentStatus.CANCELLED_BY_SECRETARY
                                          ? "google-calendar-status-pill google-calendar-status-pill-cancelled"
                                          : "google-calendar-status-pill google-calendar-status-pill-pending"
                              }
                            >
                              {event.resource.type === "overturn"
                                ? OverturnStatusLabels[event.resource.status as OverturnStatus]
                                : AppointmentStatusLabels[event.resource.status as AppointmentStatus]}
                            </Badge>
                            {event.resource.type === "overturn" && (
                              <Badge variant="outline" className="google-calendar-origin-pill overturn">
                                Sobreturno
                              </Badge>
                            )}
                            {getConsultationTypeBadgeLabel(event.resource.consultationType) && (
                              <Badge variant="outline" className="google-calendar-origin-pill consultation-type">
                                {getConsultationTypeBadgeLabel(event.resource.consultationType)}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Slot Action Dialog - Choose between create appointment or block */}
      {selectedSlot && (
        <SlotActionDialog
          open={isSlotActionDialogOpen}
          onOpenChange={(open) => {
            setIsSlotActionDialogOpen(open);
            if (!open) setSelectedSlot(null);
          }}
          date={selectedSlot.date}
          hour={selectedSlot.hour || ""}
          onCreateAppointment={() => {
            setIsSlotActionDialogOpen(false);
            setIsCreateDialogOpen(true);
          }}
          onBlockSlot={() => {
            setIsSlotActionDialogOpen(false);
            setBlockDialogMode("block");
            setIsBlockDialogOpen(true);
          }}
          onBlockFullDay={selectedDoctorId ? () => {
            setIsSlotActionDialogOpen(false);
            setIsAbsenceDialogOpen(true);
          } : undefined}
        />
      )}

      <AlertDialog open={absenceDeleteDialogOpen} onOpenChange={setAbsenceDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar esta ausencia?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAbsence?.startTime || selectedAbsence?.endTime
                ? "El médico volverá a quedar disponible en ese tramo horario."
                : "El día volverá a quedar disponible para agendar turnos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAbsence(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAbsence}
              disabled={isDeletingAbsence}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingAbsence ? "Quitando..." : "Quitar ausencia"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Appointment Dialog */}
      <CreateAppointmentDialog
        open={isCreateDialogOpen && !!selectedSlot}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setSelectedSlot(null);
        }}
        defaultDoctorId={selectedDoctorId}
        defaultDate={selectedSlot?.date}
        defaultHour={selectedSlot?.hour}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          setSelectedSlot(null);
        }}
        onAppointmentCreated={(appointment) => {
          setOptimisticAppointments((current) => {
            const alreadyExists = current.some((item) => item.id === appointment.id);
            if (alreadyExists) return current;
            return [...current, appointment];
          });
        }}
        fixedDoctorId={fixedDoctorId}
        allowGuestCreation={allowGuestCreationProp ?? !fixedDoctorId}
      />

      {/* Register Guest Modal - only render if still a guest */}
      {selectedEvent?.resource.isGuest && selectedEvent?.resource.type === "appointment" && (
        <RegisterGuestModal
          key={(selectedEvent.resource.data as AppointmentFullResponseDto).id}
          open={isRegisterGuestModalOpen}
          onOpenChange={setIsRegisterGuestModalOpen}
          appointment={selectedEvent.resource.data as AppointmentFullResponseDto}
          onSuccess={() => {
            setIsRegisterGuestModalOpen(false);
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {selectedEvent && selectedEvent.resource.data && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Paciente:</strong> {selectedEvent.resource.isGuest
                      ? `${(selectedEvent.resource.data as AppointmentFullResponseDto).guestFirstName} ${(selectedEvent.resource.data as AppointmentFullResponseDto).guestLastName}`
                      : `${(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.firstName} ${(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.lastName}`
                    }</p>
                    <p><strong>Fecha:</strong> {format(selectedEvent.start, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
                    <p><strong>Hora:</strong> {formatTimeAR((selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).hour)}</p>
                  </div>
                )}
                <p className="text-amber-600 font-medium">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleStatusChange(AppointmentStatus.CANCELLED_BY_SECRETARY)}
            >
              Sí, cancelar turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block/Unblock Slot Dialog */}
      {selectedSlot && selectedDoctorId && (
        <BlockSlotDialog
          open={isBlockDialogOpen}
          onOpenChange={(open) => {
            setIsBlockDialogOpen(open);
            if (!open) {
              setSelectedSlot(null);
              setSelectedBlockedSlot(undefined);
            }
          }}
          mode={blockDialogMode}
          doctorId={selectedDoctorId}
          date={selectedSlot.date}
          hour={selectedSlot.hour || ""}
          blockedSlot={selectedBlockedSlot}
          onSuccess={() => {
            setIsBlockDialogOpen(false);
            setSelectedSlot(null);
            setSelectedBlockedSlot(undefined);
          }}
        />
      )}

      {/* Create Absence Dialog - Block full day */}
      {selectedSlot && selectedDoctorId && (
        <CreateAbsenceDialog
          open={isAbsenceDialogOpen}
          onOpenChange={(open) => {
            setIsAbsenceDialogOpen(open);
            if (!open) setSelectedSlot(null);
          }}
          doctorId={selectedDoctorId}
          date={selectedSlot.date}
          onSuccess={() => {
            setIsAbsenceDialogOpen(false);
            setSelectedSlot(null);
          }}
        />
      )}

      {/* Create Overturn Dialog - Only in day view */}
      {selectedDoctorId && (
        <CreateOverturnDialog
          open={isOverturnDialogOpen}
          onOpenChange={setIsOverturnDialogOpen}
          defaultDoctorId={selectedDoctorId}
          defaultDate={formatDateForCalendar(currentDate)}
          onSuccess={() => {
            setIsOverturnDialogOpen(false);
          }}
          fixedDoctorId={fixedDoctorId}
          allowGuestCreation={allowGuestCreationProp ?? !fixedDoctorId}
        />
      )}

      {/* Reschedule Appointment Dialog */}
      <RescheduleAppointmentDialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        appointment={rescheduleTargetAppointment}
        onReschedule={async (id, dto) => {
          if (rescheduleTargetAppointment?.type === "overturn") {
            await updateOverturnMutation.mutateAsync({ id, dto });
            showSuccess("Sobreturno reprogramado exitosamente");
          } else {
            await rescheduleAppointmentMutation.mutateAsync({ id, dto });
            showSuccess("Turno reprogramado exitosamente");
          }
          setRescheduleTargetAppointment(null);
        }}
        isRescheduling={isRescheduling || isUpdatingOverturn}
      />

      {/* Print Agenda Dialog */}
      <PrintAgendaView
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        appointments={appointments}
        overturns={overturns}
        currentDate={currentDate}
        currentView={currentView}
        doctorName={doctorName ?? (autoFilterForDoctor && doctorProfileIndividual ? `Dr/a. ${doctorProfileIndividual.firstName} ${doctorProfileIndividual.lastName}` : undefined)}
      />
    </div>
  );
};

export default BigCalendar;
