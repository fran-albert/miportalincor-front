import { useMemo } from "react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, AlertCircle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyCheckupSchedules } from "@/hooks/Periodic-Checkup/useMyCheckupSchedules";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";

type CheckupStatus = "overdue" | "upcoming" | "ontrack";

interface CheckupWithStatus extends PatientCheckupSchedule {
  status: CheckupStatus;
  daysUntilDue: number;
}

const getCheckupStatus = (nextDueDate: string): { status: CheckupStatus; daysUntilDue: number } => {
  const dueDate = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = differenceInDays(dueDate, today);

  if (isPast(dueDate) && daysUntilDue < 0) {
    return { status: "overdue", daysUntilDue };
  }
  if (daysUntilDue <= 30) {
    return { status: "upcoming", daysUntilDue };
  }
  return { status: "ontrack", daysUntilDue };
};

const getStatusBadge = (status: CheckupStatus) => {
  switch (status) {
    case "overdue":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      );
    case "upcoming":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Próximo
        </Badge>
      );
    case "ontrack":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Al día
        </Badge>
      );
  }
};

const formatDueDate = (nextDueDate: string, daysUntilDue: number) => {
  const dueDate = new Date(nextDueDate);
  const formattedDate = format(dueDate, "dd/MM/yyyy", { locale: es });
  const relativeTime = formatDistanceToNow(dueDate, { addSuffix: true, locale: es });

  return `${formattedDate} (${relativeTime})`;
};

const formatFrequency = (months: number) => {
  if (months === 1) return "Cada mes";
  if (months === 12) return "Cada año";
  return `Cada ${months} meses`;
};

export function UpcomingCheckupsCard() {
  const { schedules, isLoading, isError } = useMyCheckupSchedules();

  const schedulesWithStatus: CheckupWithStatus[] = useMemo(() => {
    if (!schedules.length) return [];

    return schedules
      .filter((s) => s.isActive)
      .map((schedule) => {
        const { status, daysUntilDue } = getCheckupStatus(schedule.nextDueDate);
        return { ...schedule, status, daysUntilDue };
      })
      .sort((a, b) => {
        // Sort by urgency: overdue first, then upcoming, then ontrack
        const statusOrder = { overdue: 0, upcoming: 1, ontrack: 2 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        // Within same status, sort by days until due
        return a.daysUntilDue - b.daysUntilDue;
      });
  }, [schedules]);

  const urgentCount = schedulesWithStatus.filter(
    (s) => s.status === "overdue" || s.status === "upcoming"
  ).length;

  // Don't render anything if loading shows no schedules and we're not in a loading state
  if (!isLoading && schedulesWithStatus.length === 0 && !isError) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            Próximos Chequeos
          </div>
          {urgentCount > 0 && (
            <Badge variant="destructive">{urgentCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-500 text-sm">Cargando chequeos...</p>
          </div>
        ) : isError ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              Error al cargar los chequeos. Intentá nuevamente más tarde.
            </p>
          </div>
        ) : schedulesWithStatus.length === 0 ? (
          <div className="py-6 text-center">
            <CalendarClock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              No tenés chequeos periódicos asignados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedulesWithStatus.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {schedule.checkupType?.name || "Chequeo"}
                    </span>
                    {getStatusBadge(schedule.status)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {schedule.checkupType?.specialityName && (
                      <span>{schedule.checkupType.specialityName}</span>
                    )}
                    {schedule.checkupType?.frequencyMonths && (
                      <span className="text-gray-400">
                        {schedule.checkupType?.specialityName ? " · " : ""}
                        {formatFrequency(schedule.checkupType.frequencyMonths)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Próximo: {formatDueDate(schedule.nextDueDate, schedule.daysUntilDue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
