import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarClock, FileText, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorQueueWidget } from "@/components/DoctorWaitingRoom";
import { DoctorAgendaToday } from "./DoctorAgendaToday";
import { useDoctorDayAgenda } from "@/hooks/Doctor/useDoctorDayAgenda";
import { useDoctorWaitingQueue } from "@/hooks/Doctor/useDoctorWaitingQueue";
import { useDoctorWorkingToday } from "@/hooks/Doctor/useDoctorWorkingToday";
import { useMyGreenCardServiceEnabled } from "@/hooks/Doctor-Services/useDoctorServices";
import { usePrescriptionNotifications } from "@/hooks/Prescription-Request/usePrescriptionNotifications";

interface DoctorHomePageProps {
  name: string;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
};

const formatTime = (time: string): string => time.slice(0, 5);

interface DayMetricCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  warnWhenPositive?: boolean;
  onClick?: () => void;
}

const DayMetricCard = ({
  label,
  value,
  icon: Icon,
  isLoading = false,
  warnWhenPositive = false,
  onClick,
}: DayMetricCardProps) => {
  const valueClassName =
    warnWhenPositive && value > 0 ? "text-amber-600" : "text-gray-900";

  return (
    <Card
      onClick={onClick}
      className={`border-0 shadow-md transition-shadow duration-200 hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-14" />
          ) : (
            <p className={`text-3xl font-bold tabular-nums ${valueClassName}`}>
              {value}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-greenPrimary/10 p-3">
          <Icon className="h-6 w-6 text-greenPrimary" />
        </div>
      </CardContent>
    </Card>
  );
};

export const DoctorHomePage = ({ name }: DoctorHomePageProps) => {
  const navigate = useNavigate();
  const {
    availabilities,
    isWorkingToday,
    isLoading: isScheduleLoading,
  } = useDoctorWorkingToday();
  const { agenda, stats, isLoading: isAgendaLoading } = useDoctorDayAgenda();
  const { waitingQueue, isLoading: isQueueLoading } = useDoctorWaitingQueue({
    refetchInterval: 15000,
  });
  const { isServiceEnabled: hasGreenCardService } = useMyGreenCardServiceEnabled();
  const { pendingCount } = usePrescriptionNotifications({
    enabled: hasGreenCardService,
    showToasts: false, // Toasts are handled in DashboardLayout
  });

  const scheduleText = (() => {
    if (isScheduleLoading || isAgendaLoading) return "Cargando tu agenda…";
    if (!isWorkingToday) return "Hoy no tenés agenda de atención";
    const ranges = [...availabilities]
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((slot) => `${formatTime(slot.startTime)}–${formatTime(slot.endTime)}`)
      .join(" y ");
    const turnosLabel = stats.total === 1 ? "1 turno" : `${stats.total} turnos`;
    return `Hoy atendés ${ranges} · ${turnosLabel}`;
  })();

  const remainingCount = stats.pending + stats.waiting + stats.attending;

  return (
    <div className="space-y-6 p-6">
      {/* Banda de marca con el resumen del día */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-greenSecondary via-greenPrimary to-teal-500 px-6 py-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/85">{getGreeting()}</p>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="mt-1 text-sm text-white/85">{scheduleText}</p>
        </div>
        <Button
          onClick={() => navigate("/mi-sala-de-espera")}
          className="relative z-10 w-fit bg-white font-semibold text-greenPrimary hover:bg-white/90"
        >
          Ir a la sala de espera
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </motion.div>

      {/* Métricas personales del día */}
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          hasGreenCardService ? "lg:grid-cols-3" : ""
        }`}
      >
        <DayMetricCard
          label="En espera"
          value={waitingQueue.length}
          icon={Users}
          isLoading={isQueueLoading}
          warnWhenPositive
        />
        <DayMetricCard
          label="Turnos restantes"
          value={remainingCount}
          icon={CalendarClock}
          isLoading={isAgendaLoading}
        />
        {hasGreenCardService && (
          <DayMetricCard
            label="Recetas pendientes"
            value={pendingCount}
            icon={FileText}
            onClick={() => navigate("/solicitudes-recetas")}
          />
        )}
      </div>

      {/* Sala de espera + agenda del día */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DoctorQueueWidget />
        <DoctorAgendaToday agenda={agenda} isLoading={isAgendaLoading} />
      </div>
    </div>
  );
};
