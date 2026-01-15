import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Plus, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { usePatientSchedules } from "@/hooks/Periodic-Checkup";
import { PatientCheckupSchedule } from "@/types/Periodic-Checkup/PeriodicCheckup";
import { AssignCheckupDialog } from "./AssignCheckupDialog";
import { CompleteCheckupDialog } from "./CompleteCheckupDialog";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface PeriodicCheckupsCardProps {
  patientId: number;
  patientName?: string;
}

export function PeriodicCheckupsCard({ patientId, patientName }: PeriodicCheckupsCardProps) {
  const { schedules, isLoading } = usePatientSchedules(patientId);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PatientCheckupSchedule | null>(null);

  const getStatusBadge = (schedule: PatientCheckupSchedule) => {
    const today = new Date();
    const dueDate = parseISO(schedule.nextDueDate);
    const daysUntilDue = differenceInDays(dueDate, today);

    if (daysUntilDue < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Vencido ({Math.abs(daysUntilDue)} días)
        </Badge>
      );
    }
    if (daysUntilDue <= 30) {
      return (
        <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          Próximo ({daysUntilDue} días)
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3" />
        Al día
      </Badge>
    );
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Sin registro";
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Chequeos Periódicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Chequeos Periódicos
          </CardTitle>
          <Button size="sm" onClick={() => setShowAssignDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CalendarClock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay chequeos periódicos asignados</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowAssignDialog(true)}
              >
                Agregar primer chequeo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">
                          {schedule.checkupType?.name || "Chequeo"}
                        </h4>
                        {getStatusBadge(schedule)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {schedule.checkupType?.specialityName && (
                          <span className="mr-2">{schedule.checkupType.specialityName}</span>
                        )}
                        • Cada {schedule.checkupType?.frequencyMonths || 12} meses
                      </p>
                      <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500">Último:</span>{" "}
                          <span className="font-medium">{formatDate(schedule.lastCheckupDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Próximo:</span>{" "}
                          <span className="font-medium">{formatDate(schedule.nextDueDate)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSchedule(schedule)}
                    >
                      Completar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignCheckupDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        patientId={patientId}
        existingSchedules={schedules}
      />

      {selectedSchedule && (
        <CompleteCheckupDialog
          open={!!selectedSchedule}
          onOpenChange={(open) => !open && setSelectedSchedule(null)}
          schedule={selectedSchedule}
          patientId={patientId}
          patientName={patientName}
        />
      )}
    </>
  );
}
