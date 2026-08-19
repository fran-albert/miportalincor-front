import { useMemo, useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useStaffIntegralAvailableDays } from "@/hooks/Appointments";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { formatDoctorName } from "@/common/helpers/helpers";
import {
  integralDaySummary,
  integralStaffMomentsInOrder,
} from "@/common/helpers/integral-checkup-moments";
import { INTEGRAL_CHECKUP_LABEL } from "@/common/constants/integral-checkup";
import type { IntegralCheckupSlot } from "@/types/Appointment/Appointment";
import { PatientSelectWithGuestOption } from "../Select/PatientSelectWithGuestOption";

/**
 * El alta del **control ginecológico integral** por secretaría.
 *
 * Es el mismo alta que usa la paciente en su portal —el backend tiene un solo
 * camino para crear el control— con un solo agregado: de qué paciente es. Lo
 * que la secretaria elige es **paciente y día**; las horas no se eligen.
 *
 * 🔴 Las dos horas y las dos profesionales las manda el backend, ya resueltas
 * al circuito activo. Acá no se calcula ninguna: si el front las cableara,
 * mentiría el día que la clínica invierta el orden del control (y ya lo
 * invirtió una vez). Lo único que hace esta pantalla es ordenarlas por hora y
 * mostrarlas antes de confirmar.
 */

export interface StaffIntegralCheckupFormProps {
  onSubmit: (data: { patientId: number; date: string }) => Promise<void>;
  isLoading?: boolean;
  defaultPatient?: {
    userId: number;
    firstName: string;
    lastName: string;
    userName?: string;
  };
}

/** `2027-03-10` → `martes 10 de marzo de 2027`. */
const formatLongDate = (date: string): string => {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const StaffIntegralCheckupForm = ({
  onSubmit,
  isLoading = false,
  defaultPatient,
}: StaffIntegralCheckupFormProps) => {
  const [patientId, setPatientId] = useState<number | undefined>(
    defaultPatient?.userId,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { days, isLoading: loadingDays, isError } =
    useStaffIntegralAvailableDays();
  const { doctors } = useDoctors({ auth: true, fetchDoctors: true });

  const selectedDay: IntegralCheckupSlot | null = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? null,
    [days, selectedDate],
  );

  /** El nombre de una médica sale del padrón de médicos, por su id. */
  const doctorLabel = (doctorId?: number): string => {
    if (!doctorId) return "";
    const doctor = doctors.find(
      (candidate) => Number(candidate.userId) === doctorId,
    );
    return doctor ? formatDoctorName(doctor) : "";
  };

  const moments = selectedDay
    ? integralStaffMomentsInOrder(selectedDay, {
        consultationDoctorLabel: doctorLabel(selectedDay.consultationDoctorId),
        ultrasoundDoctorLabel: doctorLabel(selectedDay.ultrasoundDoctorId),
      })
    : [];

  const canSubmit = Boolean(patientId) && Boolean(selectedDay) && !isLoading;

  const handleSubmit = async () => {
    if (!patientId || !selectedDay) return;
    // Solo paciente y día: las horas las pone el backend con la grilla del
    // modo activo, igual que cuando reserva la paciente.
    await onSubmit({ patientId, date: selectedDay.date });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Paciente *</Label>
        <PatientSelectWithGuestOption
          value={patientId}
          onValueChange={setPatientId}
          onCreateGuestClick={() => {}}
          placeholder="Buscar paciente por DNI..."
          defaultPatient={defaultPatient}
          disabled={!!defaultPatient}
          // El control es para una paciente del padrón: no hay invitados. Si
          // no está registrada, se la da de alta primero, como con cualquier
          // otro turno.
          allowGuestCreation={false}
        />
      </div>

      <div className="space-y-2">
        <Label>Día *</Label>
        {loadingDays ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudieron cargar los días</AlertTitle>
            <AlertDescription>
              Volvé a intentar en unos segundos.
            </AlertDescription>
          </Alert>
        ) : days.length === 0 ? (
          <Alert>
            <AlertTitle>Sin días disponibles</AlertTitle>
            <AlertDescription>
              Por ahora no hay fechas libres para el {INTEGRAL_CHECKUP_LABEL.toLowerCase()}.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                aria-pressed={selectedDate === day.date}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-colors",
                  selectedDate === day.date
                    ? "border-pink-500 bg-pink-50"
                    : "hover:bg-muted/50",
                )}
              >
                <span className="block font-medium capitalize">
                  {formatLongDate(day.date)}
                </span>
                {/* 🔴 Las dos horas, en la fecha misma: la secretaria las ve
                    sin tener que elegir el día para enterarse. Salen del
                    backend y se ordenan por reloj — la separación entre la
                    consulta y la eco no es un número fijo (el miércoles la
                    consulta dura 20 minutos y el jueves 30). */}
                <span className="block text-xs text-muted-foreground">
                  {integralDaySummary(day)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Las dos patas resueltas, antes de confirmar. */}
      {selectedDay && (
        <div className="space-y-2 rounded-lg border border-pink-200 bg-pink-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-pink-900">
            <HeartPulse className="h-4 w-4 text-pink-600" />
            Así queda el control
          </p>
          <ol
            aria-label="Así queda el control"
            className="space-y-1 text-sm text-pink-900"
          >
            {moments.map((moment) => (
              <li key={moment.kind}>
                <span className="font-semibold">{moment.hour}</span>{" "}
                {moment.label}
                {moment.doctorLabel ? ` — ${moment.doctorLabel}` : ""}
              </li>
            ))}
          </ol>
          <p className="text-xs text-pink-800">
            Se crean los dos turnos juntos. Si después se cancela o se
            reprograma uno, se mueven los dos.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Dar el control
        </Button>
      </div>
    </div>
  );
};

export default StaffIntegralCheckupForm;
