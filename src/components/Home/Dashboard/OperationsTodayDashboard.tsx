import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  CalendarClock,
  Clock,
  Loader2,
  RefreshCw,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOperationsTodayDashboard } from "@/hooks/Operations/useOperationsTodayDashboard";
import type { OperationsTodayDashboard as OperationsTodayDashboardType } from "@/types/Operations/TodayDashboard";
import {
  formatOperationsDate,
  getOperationsStatusClass,
  getOperationsStatusLabel,
  getVisibleOperationsDoctors,
} from "./operationsTodayDashboard.utils";

interface OperationsTodayDashboardProps {
  enabled: boolean;
}

export function OperationsTodayDashboard({
  enabled,
}: OperationsTodayDashboardProps) {
  const { data, isLoading, isError, isFetching, refetch } =
    useOperationsTodayDashboard(enabled);

  if (!enabled) return null;

  return (
    <OperationsTodayDashboardContent
      dashboard={data}
      isLoading={isLoading}
      isError={isError}
      isFetching={isFetching}
      onRefresh={() => refetch()}
    />
  );
}

interface OperationsTodayDashboardContentProps {
  dashboard?: OperationsTodayDashboardType;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
}

export function OperationsTodayDashboardContent({
  dashboard,
  isLoading = false,
  isError = false,
  isFetching = false,
  onRefresh,
}: OperationsTodayDashboardContentProps) {
  const visibleDoctors = dashboard
    ? getVisibleOperationsDoctors(dashboard.doctors)
    : [];

  return (
    <section className="space-y-4" aria-labelledby="operations-dashboard-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="operations-dashboard-title"
            className="text-xl font-bold text-gray-900"
          >
            Operación de hoy
          </h2>
          <p className="text-sm text-gray-500">
            {dashboard ? formatOperationsDate(dashboard.date) : "Cargando día"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/turnos">
              <CalendarClock className="mr-2 h-4 w-4" />
              Turnos
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualizar
          </Button>
        </div>
      </div>

      {isError ? (
        <Card className="rounded-lg border-red-200 bg-red-50 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 flex-none" />
            No se pudo cargar el panel operativo.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard
          label="Turnos"
          value={dashboard?.summary.appointments}
          icon={CalendarClock}
          isLoading={isLoading}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <MetricCard
          label="Sobreturnos"
          value={dashboard?.summary.overturns}
          icon={Activity}
          isLoading={isLoading}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <MetricCard
          label="En espera"
          value={dashboard?.summary.waiting}
          icon={Users}
          isLoading={isLoading}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
        />
        <MetricCard
          label="Atendiendo"
          value={dashboard?.summary.attending}
          icon={UserCheck}
          isLoading={isLoading}
          gradient="bg-gradient-to-br from-sky-500 to-blue-600"
        />
        <MetricCard
          label="Médicos hoy"
          value={dashboard?.summary.workingDoctors}
          icon={Stethoscope}
          isLoading={isLoading}
          gradient="bg-gradient-to-br from-greenPrimary to-teal-600"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-gray-900">
              Próximos turnos
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Ordenados por hora, incluyendo sobreturnos.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-2 overflow-y-auto pr-3">
            {isLoading ? <EventSkeleton /> : null}
            {!isLoading && dashboard?.nextEvents.length === 0 ? (
              <EmptyState message="No quedan turnos próximos para hoy." />
            ) : null}
            {dashboard?.nextEvents.map((event) => (
              <div
                key={`${event.type}-${event.id}`}
                className="grid gap-3 rounded-lg border border-gray-100 px-3 py-3 sm:grid-cols-[72px_minmax(0,1fr)_auto]"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {event.hour}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {event.patientName}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {event.doctorName}
                    {event.consultationTypeNames?.length
                      ? ` · ${event.consultationTypeNames.join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge
                    variant="outline"
                    className={getOperationsStatusClass(event.status)}
                  >
                    {getOperationsStatusLabel(event.status)}
                  </Badge>
                  {event.type === "overturn" ? (
                    <Badge
                      variant="outline"
                      className="border-violet-200 text-violet-700"
                    >
                      Sobreturno
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-gray-900">
              Médicos que atienden
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Agenda efectiva del día y actividad en cola.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[420px] space-y-2 overflow-y-auto pr-3">
            {isLoading ? <DoctorSkeleton /> : null}
            {!isLoading && visibleDoctors.length === 0 ? (
              <EmptyState message="No hay médicos con atención configurada para hoy." />
            ) : null}
            {visibleDoctors.map((doctor) => {
              const hasRemainingWorkingHours =
                doctor.hasRemainingWorkingHours ?? doctor.isWorkingToday;

              return (
                <div
                  key={doctor.doctorId}
                  className="rounded-lg border border-gray-100 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {doctor.doctorName}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {doctor.specialities?.join(", ") || "Sin especialidad"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        hasRemainingWorkingHours
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {hasRemainingWorkingHours
                        ? "Con horario"
                        : "Con actividad"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <DoctorDatum
                      label="Horario"
                      value={
                        doctor.startTime && doctor.endTime
                          ? `${doctor.startTime}-${doctor.endTime}`
                          : "-"
                      }
                    />
                    <DoctorDatum
                      label="Turnos"
                      value={String(doctor.appointments + doctor.overturns)}
                    />
                    <DoctorDatum
                      label="Espera"
                      value={String(doctor.waiting + doctor.called)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  isLoading,
  gradient,
}: {
  label: string;
  value?: number;
  icon: LucideIcon;
  isLoading?: boolean;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {(value ?? 0).toLocaleString()}
                </p>
              )}
            </div>
            <div className={`rounded-xl p-3 ${gradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DoctorDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-50 px-2 py-1.5">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="truncate font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function DoctorSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
