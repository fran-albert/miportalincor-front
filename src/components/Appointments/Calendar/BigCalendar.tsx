import { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View, SlotInfo, EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./BigCalendar.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { DoctorSelect } from "../Select/DoctorSelect";
import { useAppointments, useAppointmentMutations, useAvailableSlotsRange, useFirstAvailableDate } from "@/hooks/Appointments";
import { useOverturns, useOverturnMutations } from "@/hooks/Overturns";
import { useBlockedSlots } from "@/hooks/BlockedSlots";
import { useHolidays } from "@/hooks/Holiday";
import { BlockedSlotResponseDto, BlockReasonLabels } from "@/types/BlockedSlot/BlockedSlot";
import { useMyDoctorProfile } from "@/hooks/Doctor/useMyDoctorProfile";
import { useDoctorDashboard } from "@/hooks/Doctor/useDoctorDashboard";
import { useDoctorAvailabilities } from "@/hooks/DoctorAvailability/useDoctorAvailabilities";
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentStatusColors,
  AppointmentOrigin,
  AppointmentOriginLabels,
} from "@/types/Appointment/Appointment";
import { OverturnDetailedDto, OverturnStatus, OverturnStatusLabels } from "@/types/Overturn/Overturn";
import { formatDateForCalendar, formatTimeAR } from "@/common/helpers/timezone";
import { formatDoctorName } from "@/common/helpers/helpers";
import { CalendarDays, CalendarOff, Clock, User, Stethoscope, AlertCircle, X, PlayCircle, CheckCircle, XCircle, UserPlus, Globe, Building, Lock, ChevronDown, ChevronRight, Printer } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { CreateAppointmentDialog } from "../Dialogs/CreateAppointmentDialog";
import { BlockSlotDialog } from "../Dialogs/BlockSlotDialog";
import { SlotActionDialog } from "../Dialogs/SlotActionDialog";
import { RegisterGuestModal } from "../Modals/RegisterGuestModal";
import { CreateOverturnDialog } from "../Dialogs/CreateOverturnDialog";
import { CreateAbsenceDialog } from "../Dialogs/CreateAbsenceDialog";
import { RescheduleAppointmentDialog } from "../Dialogs/RescheduleAppointmentDialog";
import { PrintAgendaView } from "./PrintAgendaView";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDoctorAbsences } from "@/hooks/DoctorAbsence";
import { AbsenceLabels, DoctorAbsenceResponseDto } from "@/types/Doctor-Absence/Doctor-Absence";

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
  const [rescheduleTargetAppointment, setRescheduleTargetAppointment] = useState<AppointmentFullResponseDto | null>(null);
  const [legendsOpen, setLegendsOpen] = useState(!autoFilterForDoctor);
  const [optimisticAppointments, setOptimisticAppointments] = useState<
    AppointmentFullResponseDto[]
  >([]);

  // Dynamic height per view
  const calendarHeight = useMemo(() => {
    if (currentView === "day" || currentView === "week" || currentView === "work_week") {
      return "calc(100vh - 260px)";
    }
    if (currentView === "month") {
      return "850px";
    }
    return "700px"; // agenda
  }, [currentView]);

  // Custom Event component - view-aware
  const CustomEvent = useMemo(() => {
    const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
      const { type, patientDni, healthInsurance, affiliationNumber, consultationType } = event.resource;

      // For available, blocked, or absence events, just show the title
      if (type === "available" || type === "blocked" || type === "absence") {
        return <span>{event.title}</span>;
      }

      // Day view: single-line with dashes (same format, bigger font)
      if (currentView === "day") {
        const hourDay = format(event.start, "HH:mm");
        const endHourDay = format(event.end, "HH:mm");
        const partsDay = [`${hourDay}-${endHourDay}`, event.title];
        if (patientDni) partsDay.push(patientDni);
        if (healthInsurance) {
          partsDay.push(affiliationNumber ? `${healthInsurance} ${affiliationNumber}` : healthInsurance);
        }
        if (consultationType) partsDay.push(consultationType);
        return (
          <div className="font-semibold truncate" style={{ fontSize: "13px" }}>
            {partsDay.join(' - ')}
          </div>
        );
      }

      // Week/work_week/month/other views: single-line compact with dashes
      const hour = format(event.start, "HH:mm");
      const endHour = format(event.end, "HH:mm");
      const parts = [`${hour}-${endHour}`, event.title];
      if (patientDni) parts.push(patientDni);
      if (healthInsurance) {
        parts.push(affiliationNumber ? `${healthInsurance} ${affiliationNumber}` : healthInsurance);
      }
      if (consultationType) parts.push(consultationType);

      return (
        <div className="font-medium truncate" style={{ fontSize: "12px", lineHeight: "18px" }}>
          {parts.join(' - ')}
        </div>
      );
    };
    EventComponent.displayName = "CustomEvent";
    return EventComponent;
  }, [currentView]);

  // Si autoFilterForDoctor, obtener el perfil del médico logueado
  // (solo se usa cuando NO se usa dashboard, pero se llama siempre para mantener hooks estables)
  const { data: doctorProfileIndividual } = useMyDoctorProfile();

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
    // For week/agenda
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    };
  }, [currentView, currentDate]);

  // Whether to use the aggregated dashboard endpoint (doctor view only)
  const useDashboard = autoFilterForDoctor;

  // ─── DASHBOARD MODE (1 request): for doctors viewing their own calendar ───
  const {
    appointments: dashAppointments,
    overturns: dashOverturns,
    availableSlots: dashAvailableSlots,
    blockedSlots: dashBlockedSlots,
    doctorAbsences: dashAbsences,
    holidays: dashHolidays,
    slotDuration: dashSlotDuration,
    isLoading: isDashboardLoading,
  } = useDoctorDashboard({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    selectedWeekStart: formatDateForCalendar(slotsDateRange.start),
    selectedWeekEnd: formatDateForCalendar(slotsDateRange.end),
    enabled: useDashboard && !!selectedDoctorId && isActive,
  });

  // ─── INDIVIDUAL HOOKS MODE (N requests): for secretary/tabs view ───
  const { availabilities: indivAvailabilities } = useDoctorAvailabilities({
    doctorId: selectedDoctorId ?? 0,
    enabled: !useDashboard && !!selectedDoctorId,
  });

  const indivSlotDuration = useMemo(() => {
    if (indivAvailabilities.length === 0) return 30;
    const durations = indivAvailabilities.map((a) => a.slotDuration).filter((d) => d > 0);
    return durations.length > 0 ? Math.min(...durations) : 30;
  }, [indivAvailabilities]);

  const { appointments: indivAppointments, isLoading: isLoadingAppointments } = useAppointments({
    params: { doctorId: selectedDoctorId, dateFrom: dateRange.dateFrom, dateTo: dateRange.dateTo, limit: 500 },
    enabled: !useDashboard,
  });

  const { overturns: indivOverturns, isLoading: isLoadingOverturns } = useOverturns({
    params: { doctorId: selectedDoctorId, dateFrom: dateRange.dateFrom, dateTo: dateRange.dateTo },
    enabled: !useDashboard,
  });

  const { slots: indivAvailableSlots } = useAvailableSlotsRange({
    doctorId: selectedDoctorId ?? 0,
    startDate: slotsDateRange.start,
    endDate: slotsDateRange.end,
    enabled: !useDashboard && !!selectedDoctorId && isActive,
  });

  const { blockedSlots: indivBlockedSlots } = useBlockedSlots({
    doctorId: selectedDoctorId ?? 0,
    startDate: formatDateForCalendar(slotsDateRange.start),
    endDate: formatDateForCalendar(slotsDateRange.end),
    enabled: !useDashboard && !!selectedDoctorId && isActive,
  });

  const { absences: indivAbsences } = useDoctorAbsences({
    doctorId: selectedDoctorId ?? 0,
    enabled: !useDashboard && !!selectedDoctorId && isActive,
  });

  const { data: indivHolidays } = useHolidays();

  // ─── UNIFIED DATA: pick from dashboard or individual hooks ───
  const appointments = useDashboard ? dashAppointments : indivAppointments;
  const overturns = useDashboard ? dashOverturns : indivOverturns;
  const availableSlots = useDashboard ? dashAvailableSlots : indivAvailableSlots;
  const blockedSlots = useDashboard ? dashBlockedSlots : indivBlockedSlots;
  const doctorAbsences = useDashboard ? dashAbsences : indivAbsences;
  const holidays = useDashboard ? dashHolidays : indivHolidays;
  const slotDuration = useDashboard ? dashSlotDuration : indivSlotDuration;
  const isHydratingDoctorAgenda =
    !useDashboard &&
    !!selectedDoctorId &&
    (isLoadingAppointments || isLoadingOverturns);

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

  const { changeStatus: changeAppointmentStatus, rescheduleAppointment: rescheduleAppointmentMutation, isRescheduling } = useAppointmentMutations();
  const { changeStatus: changeOverturnStatus } = useOverturnMutations();

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

  // Available slot events (filtered by occupied, holidays, absences)
  const availableSlotEvents = useMemo<CalendarEvent[]>(() => {
    const filtered = availableSlots.filter((slot) => {
      const key = `${slot.date}-${slot.hour}`;
      if (occupiedSlotsSet.has(key) || holidayDatesSet.has(slot.date)) return false;
      if (absenceDatesSet.has(slot.date)) return false;
      const isBlockedByPartialAbsence = doctorAbsences.some((absence) => {
        if (!absence.startTime || !absence.endTime) return false;
        if (slot.date < absence.startDate || slot.date > absence.endDate) return false;
        return slot.hour >= absence.startTime!.slice(0, 5) && slot.hour < absence.endTime!.slice(0, 5);
      });
      return !isBlockedByPartialAbsence;
    });

    return filtered.map((slot, index) => {
      const [hours, minutes] = slot.hour.split(":").map(Number);
      const start = new Date(slot.date + "T12:00:00");
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + slotDuration);

      return {
        id: `available-${slot.date}-${slot.hour}-${index}`,
        title: `${slot.hour} - Disponible`,
        start,
        end,
        resource: {
          type: "available" as const,
          slotDate: slot.date,
          slotHour: slot.hour,
        },
      };
    });
  }, [availableSlots, occupiedSlotsSet, holidayDatesSet, absenceDatesSet, doctorAbsences, slotDuration]);

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
    // In blockOnly mode, slots should be interactive (like normal mode)
    const isInteractive = !readOnly || blockOnly;

    // View-aware font sizes — compact in week, normal in day
    const availableFontSize = currentView === "day" ? "13px" : "12px";
    const appointmentFontSize = currentView === "day" ? "13px" : "12px";

    // Style for absence events - orange background
    if (event.resource.type === "absence") {
      return {
        className: "absence-event",
        style: {
          backgroundColor: "#f97316",
          color: "white",
          fontSize: "12px",
          fontWeight: "600",
          borderRadius: "4px",
          opacity: 0.9,
        },
      };
    }

    // Available slots - white background
    if (event.resource.type === "available") {
      return {
        className: "available-slot-event",
        style: {
          backgroundColor: isInteractive ? "#ffffff" : "#f3f4f6",
          color: isInteractive ? "#000000" : "#9ca3af",
          fontSize: availableFontSize,
          cursor: isInteractive ? "pointer" : "default",
          fontWeight: "600",
          opacity: isInteractive ? 1 : 0.6,
        },
      };
    }

    // Style for blocked slots - red dashed border
    if (event.resource.type === "blocked") {
      return {
        className: "blocked-slot-event",
        style: {
          backgroundColor: "#fef2f2",
          color: "#dc2626",
          fontSize: availableFontSize,
          cursor: isInteractive ? "pointer" : "default",
          fontWeight: "600",
          border: "2px dashed #dc2626",
          borderRadius: "4px",
        },
      };
    }

    const status = event.resource.status;
    const isOverturn = event.resource.type === "overturn";

    // Use the origin field from the appointment data
    const appointmentData = event.resource.data as AppointmentFullResponseDto;
    const origin = appointmentData.origin;

    let backgroundColor = "#3b82f6"; // default blue
    let borderColor = "";
    let borderStyle = "";

    // Priority for borders based on origin field
    if (isOverturn) {
      borderColor = "#f97316"; // orange border for overturns
    } else if (origin === AppointmentOrigin.WEB_GUEST) {
      borderColor = "#8b5cf6"; // purple border for guests
    } else if (origin === AppointmentOrigin.WEB_PATIENT) {
      borderColor = "#22c55e"; // green border for web/patient origin
    } else if (origin === AppointmentOrigin.SECRETARY) {
      borderColor = "#3b82f6"; // blue border for secretary origin
    }

    if (borderColor) {
      borderStyle = `4px solid ${borderColor}`;
    }

    // Overturns always have orange background (same as SOBRETURNO button)
    if (isOverturn) {
      backgroundColor = "#f97316"; // orange-500
    } else {
      // Color based on status for regular appointments
      switch (status) {
        case AppointmentStatus.PENDING:
        case AppointmentStatus.REQUESTED_BY_PATIENT:
        case AppointmentStatus.ASSIGNED_BY_SECRETARY:
          // Cyan for web patient origin, yellow for others
          backgroundColor = origin === AppointmentOrigin.WEB_PATIENT ? "#0891b2" : "#eab308";
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
    }

    return {
      style: {
        backgroundColor,
        borderLeft: borderStyle || undefined,
        borderRadius: currentView === "day" ? "4px" : "2px",
        opacity: status === AppointmentStatus.COMPLETED ||
          status === AppointmentStatus.CANCELLED_BY_PATIENT ||
          status === AppointmentStatus.CANCELLED_BY_SECRETARY ? 0.6 : 1,
        color: "white",
        fontSize: appointmentFontSize,
      },
    };
  }, [readOnly, blockOnly, currentView]);

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    // Absence events are informational only, no action on click
    if (event.resource.type === "absence") {
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

    // For appointments/overturns, show details dialog
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
    setSelectedSlot({ date, hour });
    setIsCreateDialogOpen(true);
  }, [currentView, readOnly, blockOnly]);

  // Update current date when navigating calendar
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Handle drill down (click on day number in month view)
  const handleDrillDown = useCallback((date: Date, view: View) => {
    // Change to the appropriate view and date
    setCurrentView(view);
    setCurrentDate(date);
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

  const isLoading = useDashboard
    ? isDashboardLoading || isSearchingFirstDate
    : isLoadingAppointments || isLoadingOverturns || isSearchingFirstDate;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {doctorName
                ? `Calendario - ${doctorName}`
                : autoFilterForDoctor
                ? "Mi Calendario de Turnos"
                : "Calendario de Turnos"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {showDoctorSelector && (
                <div className="w-64">
                  <DoctorSelect
                    value={internalDoctorId}
                    onValueChange={setInternalDoctorId}
                    placeholder="Todos los médicos"
                  />
                </div>
              )}
              {selectedDoctorId && (currentView === "day" || currentView === "week" || currentView === "work_week") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPrintDialogOpen(true)}
                  title="Imprimir agenda"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Imprimir
                </Button>
              )}
            </div>
          </div>
          {/* Collapsible Legend */}
          <Collapsible open={legendsOpen} onOpenChange={setLegendsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-2 gap-1 text-muted-foreground hover:text-foreground px-2 h-7">
                {legendsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {legendsOpen ? "Ocultar leyenda" : "Mostrar leyenda"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {/* Legend - Estados */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-muted-foreground mr-1">Estados:</span>
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500">
                  Pendiente
                </Badge>
                <Badge variant="outline" className="bg-cyan-600/20 text-cyan-700 border-cyan-600">
                  Pendiente (Web)
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
              </div>
              {/* Legend - Orígenes */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-muted-foreground mr-1">Origen:</span>
                <Badge variant="outline" className="border-l-4 border-l-green-500 bg-green-50 text-green-700">
                  <Globe className="h-3 w-3 mr-1" />
                  Web (Paciente)
                </Badge>
                <Badge variant="outline" className="border-l-4 border-l-blue-500 bg-blue-50 text-blue-700">
                  <Building className="h-3 w-3 mr-1" />
                  Secretaría
                </Badge>
                <Badge variant="outline" className="border-l-4 border-l-purple-500 bg-purple-50 text-purple-700">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Invitado
                </Badge>
                <Badge variant="outline" className="border-l-4 border-l-orange-500 bg-orange-50 text-orange-700">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Sobreturno
                </Badge>
                <Badge variant="outline" className="border-2 border-dashed border-red-500 bg-red-50 text-red-700">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              </div>
              {/* Legend - Días especiales */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-muted-foreground mr-1">Dias:</span>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  Feriado
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                  Fin de semana
                </Badge>
                <Badge variant="outline" className="bg-orange-500/20 text-orange-700 border-orange-500">
                  <CalendarOff className="h-3 w-3 mr-1" />
                  Ausencia
                </Badge>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
        <CardContent>
          <div className="relative" style={{ height: calendarHeight, minHeight: "500px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month", "work_week", "day", "agenda"]}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={handleNavigate}
              onDrillDown={handleDrillDown}
              messages={messages}
              culture="es"
              eventPropGetter={getEventStyle}
              dayPropGetter={getDayPropGetter}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable={!readOnly && !blockOnly}
              popup
              step={slotDuration}
              timeslots={1}
              min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
              max={new Date(0, 0, 0, 21, 0, 0)} // End at 9 PM
              formats={{
                timeGutterFormat: (date: Date) => format(date, "HH:mm"),
                eventTimeRangeFormat: ({ start }: { start: Date }) => format(start, "HH:mm"),
                dayHeaderFormat: (date: Date) => format(date, "EEEE d 'de' MMMM", { locale: es }),
                dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                  `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM", { locale: es })}`,
              }}
              components={{
                event: CustomEvent,
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Botón Sobreturno - Solo en vista DÍA */}
          {currentView === 'day' && !readOnly && selectedDoctorId && (
            <div className="pt-4 border-t mt-4">
              <Button
                className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setIsOverturnDialogOpen(true)}
              >
                <AlertCircle className="mr-2 h-6 w-6" />
                SOBRETURNO
              </Button>
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
              {(selectedEvent?.resource.data as AppointmentFullResponseDto)?.origin === AppointmentOrigin.WEB_GUEST && (
                <UserPlus className="h-5 w-5 text-purple-500" />
              )}
              Detalles del Turno
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {selectedEvent?.resource.type === "overturn" ? "Sobreturno" : "Turno regular"}
              {(selectedEvent?.resource.data as AppointmentFullResponseDto)?.origin === AppointmentOrigin.WEB_GUEST && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  INVITADO
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && selectedEvent.resource.data && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="h-10 w-10 p-2 bg-primary/10 rounded-full text-primary" />
                <div className="flex-1">
                  <p className="font-medium">
                    {selectedEvent.resource.isGuest
                      ? `${(selectedEvent.resource.data as AppointmentFullResponseDto).guestFirstName} ${(selectedEvent.resource.data as AppointmentFullResponseDto).guestLastName}`
                      : `${(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.firstName} ${(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.lastName}`
                    }
                  </p>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>
                      DNI: {selectedEvent.resource.isGuest
                        ? (selectedEvent.resource.data as AppointmentFullResponseDto).guestDocumentNumber
                        : (selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.userName
                      }
                    </p>
                    {/* Phone */}
                    {!selectedEvent.resource.isGuest && (selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.phoneNumber && (
                      <p>Tel: {(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.phoneNumber}</p>
                    )}
                    {selectedEvent.resource.isGuest && (selectedEvent.resource.data as AppointmentFullResponseDto).guestPhone && (
                      <p>Tel: {(selectedEvent.resource.data as AppointmentFullResponseDto).guestPhone}</p>
                    )}
                    {/* Health Insurance */}
                    {!selectedEvent.resource.isGuest && (selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.healthInsuranceName && (
                      <p>
                        OS: {(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.healthInsuranceName}
                        {(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.affiliationNumber && (
                          <span> - Nro: {(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).patient?.affiliationNumber}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Médico</p>
                  <p className="font-medium">
                    {(selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).doctor && formatDoctorName((selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).doctor!)}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                  <p className="font-medium">
                    {format(selectedEvent.start, "EEEE d 'de' MMMM, yyyy", { locale: es })} - {formatTimeAR((selectedEvent.resource.data as AppointmentFullResponseDto | OverturnDetailedDto).hour)}
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

              {/* Origin */}
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 flex items-center justify-center">
                  {selectedEvent.resource.type === "overturn" ? (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  ) : (selectedEvent.resource.data as AppointmentFullResponseDto).origin === AppointmentOrigin.WEB_GUEST ? (
                    <UserPlus className="h-4 w-4 text-purple-500" />
                  ) : (selectedEvent.resource.data as AppointmentFullResponseDto).origin === AppointmentOrigin.WEB_PATIENT ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Building className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Origen</p>
                  <Badge variant="outline" className={
                    selectedEvent.resource.type === "overturn"
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : (selectedEvent.resource.data as AppointmentFullResponseDto).origin === AppointmentOrigin.WEB_GUEST
                        ? "bg-purple-100 text-purple-800 border-purple-300"
                        : (selectedEvent.resource.data as AppointmentFullResponseDto).origin === AppointmentOrigin.WEB_PATIENT
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                  }>
                    {selectedEvent.resource.type === "overturn"
                      ? "Sobreturno"
                      : (selectedEvent.resource.data as AppointmentFullResponseDto).origin
                        ? AppointmentOriginLabels[(selectedEvent.resource.data as AppointmentFullResponseDto).origin as AppointmentOrigin]
                        : "Secretaría"
                    }
                  </Badge>
                  {/* Tracking: show if guest was converted to patient */}
                  {selectedEvent.resource.type === "appointment" &&
                    (selectedEvent.resource.data as AppointmentFullResponseDto).origin === AppointmentOrigin.WEB_GUEST &&
                    !selectedEvent.resource.isGuest && (
                      <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-800 border-emerald-300">
                        ✓ Registrado
                      </Badge>
                    )}
                </div>
              </div>

              {/* Guest warning banner */}
              {selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Este turno pertenece a un <strong>invitado sin registrar</strong>. Para cambiar el estado del turno, primero registralo como paciente usando el botón <strong>"Registrar Paciente"</strong>.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
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
                        ? "Solo se puede poner en espera un turno del dia de hoy"
                        : undefined;
                    return (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleStatusChange(AppointmentStatus.WAITING)}
                        disabled={disabledWaiting}
                        title={waitingTitle}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Marcar en Espera
                      </Button>
                    );
                  })()}

                {selectedEvent.resource.status === AppointmentStatus.WAITING && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusChange(AppointmentStatus.ATTENDING)}
                    disabled={!!selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment"}
                    title={selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment" ? "Debe registrar al invitado como paciente antes de cambiar el estado" : undefined}
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
                    disabled={!!selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment"}
                    title={selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment" ? "Debe registrar al invitado como paciente antes de cambiar el estado" : undefined}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completar
                  </Button>
                )}

                {selectedEvent.resource.status === AppointmentStatus.PENDING &&
                  selectedEvent.resource.type === "appointment" &&
                  !readOnly && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        const appt = selectedEvent.resource.data as AppointmentFullResponseDto;
                        setRescheduleTargetAppointment(appt);
                        setIsEventDialogOpen(false);
                        setIsRescheduleDialogOpen(true);
                      }}
                    >
                      <CalendarDays className="h-4 w-4 mr-1" />
                      Reprogramar
                    </Button>
                  )}

                {(selectedEvent.resource.status === AppointmentStatus.PENDING ||
                  selectedEvent.resource.status === AppointmentStatus.WAITING) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => setCancelConfirmOpen(true)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}

                {/* Register guest as patient button - only show if still a guest */}
                {selectedEvent.resource.isGuest && selectedEvent.resource.type === "appointment" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                    onClick={() => {
                      setIsEventDialogOpen(false); // Close details dialog first
                      setIsRegisterGuestModalOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Registrar Paciente
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
          await rescheduleAppointmentMutation.mutateAsync({ id, dto });
          showSuccess("Turno reprogramado exitosamente");
          setRescheduleTargetAppointment(null);
        }}
        isRescheduling={isRescheduling}
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
