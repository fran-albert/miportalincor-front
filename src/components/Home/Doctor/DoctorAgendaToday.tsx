import { CalendarCheck2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgendaItem, AgendaItemStatus } from "@/hooks/Doctor/useDoctorDayAgenda";
import {
  isAttending,
  isCancelled,
  isCompleted,
  isWaiting,
} from "@/hooks/Doctor/useDoctorDayAgenda";

interface DoctorAgendaTodayProps {
  agenda: AgendaItem[];
  isLoading?: boolean;
}

interface StatusBadge {
  label: string;
  className: string;
}

const getStatusBadge = (status: AgendaItemStatus): StatusBadge => {
  if (isAttending(status)) {
    return { label: "Atendiendo", className: "border-sky-200 bg-sky-50 text-sky-700" };
  }
  if (isWaiting(status)) {
    return { label: "En espera", className: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  if (isCompleted(status)) {
    return { label: "Atendido", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (isCancelled(status)) {
    return { label: "Cancelado", className: "border-gray-200 bg-gray-50 text-gray-500" };
  }
  return { label: "Pendiente", className: "border-blue-200 bg-blue-50 text-blue-700" };
};

const getPatientName = (item: AgendaItem): string => {
  if (item.patient) {
    return `${item.patient.firstName} ${item.patient.lastName}`.trim();
  }
  return "Paciente invitado";
};

const formatHour = (hour: string): string => hour.slice(0, 5);

export const DoctorAgendaToday = ({ agenda, isLoading = false }: DoctorAgendaTodayProps) => {
  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarCheck2 className="h-5 w-5 text-teal-600" />
          Mi agenda de hoy
        </CardTitle>
        <CardDescription className="text-sm">
          Turnos y sobreturnos del día, ordenados por hora.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[420px] space-y-2 overflow-y-auto">
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && agenda.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
            No tenés turnos para hoy.
          </div>
        )}

        {!isLoading &&
          agenda.map((item) => {
            const badge = getStatusBadge(item.status);

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5"
              >
                <div className="flex w-16 shrink-0 items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {formatHour(item.hour)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {getPatientName(item)}
                  </p>
                  {item.type === "overturn" && (
                    <p className="text-xs text-violet-600">Sobreturno</p>
                  )}
                </div>
                <Badge variant="outline" className={badge.className}>
                  {badge.label}
                </Badge>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
};
