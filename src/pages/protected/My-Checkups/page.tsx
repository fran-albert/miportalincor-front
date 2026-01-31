import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { format, isPast, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarClock,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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

const formatMonthYear = (nextDueDate: string) => {
  const dueDate = new Date(nextDueDate);
  const formatted = format(dueDate, "MMMM yyyy", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const MyCheckupsPage = () => {
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
        const statusOrder = { overdue: 0, upcoming: 1, ontrack: 2 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return a.daysUntilDue - b.daysUntilDue;
      });
  }, [schedules]);

  const urgentCount = schedulesWithStatus.filter(
    (s) => s.status === "overdue" || s.status === "upcoming"
  ).length;

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mis Chequeos" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Mis Chequeos Periódicos</title>
        <meta
          name="description"
          content="Consultá tus próximos chequeos periódicos y controles de salud"
        />
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Mis Chequeos Periódicos"
        description="Consultá tus próximos chequeos y controles de salud programados"
        icon={<CalendarClock className="h-6 w-6" />}
      />

      {/* Summary badges */}
      {!isLoading && schedulesWithStatus.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            {schedulesWithStatus.length} chequeo{schedulesWithStatus.length !== 1 ? "s" : ""} programado{schedulesWithStatus.length !== 1 ? "s" : ""}
          </Badge>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="text-sm py-1 px-3">
              {urgentCount} requiere{urgentCount !== 1 ? "n" : ""} atención
            </Badge>
          )}
        </div>
      )}

      {/* Checkups List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
              <p className="text-gray-500">Cargando tus chequeos...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">Error al cargar los chequeos</p>
              <p className="text-gray-500 text-sm">
                Intentá nuevamente más tarde o contactá con soporte.
              </p>
            </div>
          ) : schedulesWithStatus.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">
                No tenés chequeos periódicos asignados
              </p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Cuando tu médico te asigne chequeos periódicos de control, aparecerán aquí para que puedas llevar un seguimiento de tus controles de salud.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedulesWithStatus.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`flex items-start justify-between p-5 rounded-lg border transition-colors ${
                    schedule.status === "overdue"
                      ? "bg-red-50 border-red-200"
                      : schedule.status === "upcoming"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-gray-900 text-lg">
                        {schedule.checkupType?.name || "Chequeo"}
                      </span>
                      {getStatusBadge(schedule.status)}
                    </div>
                    {schedule.checkupType?.specialityName && (
                      <div className="mt-1.5 text-sm text-gray-600">
                        {schedule.checkupType.specialityName}
                      </div>
                    )}
                    <div className="mt-2 text-base text-gray-700">
                      <span className="font-medium">Próximo chequeo:</span>{" "}
                      {formatMonthYear(schedule.nextDueDate)}
                    </div>
                    {schedule.lastCompletedDate && (
                      <div className="mt-1 text-sm text-gray-500">
                        Último realizado: {formatMonthYear(schedule.lastCompletedDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {!isLoading && schedulesWithStatus.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">¿Cómo funcionan los chequeos?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>
                    <strong className="text-red-700">Vencido:</strong> El chequeo ya pasó su fecha programada
                  </li>
                  <li>
                    <strong className="text-yellow-700">Próximo:</strong> El chequeo es dentro de los próximos 30 días
                  </li>
                  <li>
                    <strong className="text-green-700">Al día:</strong> Tenés tiempo para realizarlo
                  </li>
                </ul>
                <p className="mt-2">
                  Contactá con tu médico o la secretaría para coordinar tus turnos de control.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyCheckupsPage;
