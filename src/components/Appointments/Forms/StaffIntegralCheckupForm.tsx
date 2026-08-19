import { useMemo, useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useStaffIntegralAvailableDays } from "@/hooks/Appointments";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { formatDoctorName } from "@/common/helpers/helpers";
import { integralStaffMomentsInOrder } from "@/common/helpers/integral-checkup-moments";
import type { IntegralCheckupSlot } from "@/types/Appointment/Appointment";
import { IntegralCheckupDayPicker } from "../IntegralCheckupDayPicker";
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
        <IntegralCheckupDayPicker
          days={days}
          isLoading={loadingDays}
          isError={isError}
          selectedDate={selectedDate}
          onSelect={(day) => setSelectedDate(day.date)}
        />
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
