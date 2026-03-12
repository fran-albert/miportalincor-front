import { useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Loader2,
  Search,
  Stethoscope,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorSelect } from "@/components/Appointments/Select/DoctorSelect";
import {
  AppointmentCreatePreviewMeta,
  CreateAppointmentForm,
  GuestAppointmentData,
} from "@/components/Appointments/Forms/CreateAppointmentForm";
import {
  useAppointmentMutations,
  useAvailableSlotsRange,
  useCreateGuestAppointment,
} from "@/hooks/Appointments";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { formatDoctorName } from "@/common/helpers/helpers";
import {
  formatDateAR,
  formatDateWithWeekdayAR,
  formatTimeAR,
  getTodayDateAR,
} from "@/common/helpers/timezone";
import { CreateAppointmentFormData } from "@/validators/Appointment/appointment.schema";

const INITIAL_RANGE_DAYS = 14;
const RANGE_STEP_DAYS = 14;

interface SelectedSlot {
  date: string;
  hour: string;
}

interface QuickBookAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedDoctorId?: number;
  allowGuestCreation?: boolean;
}

const toDateAtNoon = (date: string) => new Date(`${date}T12:00:00`);

export const QuickBookAppointmentSheet = ({
  open,
  onOpenChange,
  fixedDoctorId,
  allowGuestCreation = true,
}: QuickBookAppointmentSheetProps) => {
  const { showError, showSuccess } = useToastContext();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(fixedDoctorId);
  const [rangeDays, setRangeDays] = useState(INITIAL_RANGE_DAYS);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const { createAppointment, isCreating } = useAppointmentMutations();
  const { createGuestAppointment, isCreating: isCreatingGuest } = useCreateGuestAppointment();
  const { doctors } = useDoctors({ auth: true, fetchDoctors: open || !!fixedDoctorId });

  const startDate = useMemo(() => toDateAtNoon(getTodayDateAR()), []);
  const endDate = useMemo(
    () => addDays(startDate, rangeDays - 1),
    [rangeDays, startDate]
  );

  const { slots, isLoading, isFetching } = useAvailableSlotsRange({
    doctorId: selectedDoctorId ?? 0,
    startDate,
    endDate,
    enabled: open && !!selectedDoctorId,
  });

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => Number(doctor.userId) === selectedDoctorId),
    [doctors, selectedDoctorId]
  );

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, string[]>();
    const sorted = [...slots].sort((a, b) =>
      `${a.date}-${a.hour}`.localeCompare(`${b.date}-${b.hour}`)
    );

    sorted.forEach((slot) => {
      const normalizedHour = slot.hour.length === 5 ? `${slot.hour}:00` : slot.hour;
      const current = groups.get(slot.date) ?? [];
      current.push(normalizedHour);
      groups.set(slot.date, current);
    });

    return Array.from(groups.entries()).map(([date, hours]) => ({ date, hours }));
  }, [slots]);

  useEffect(() => {
    if (!open) {
      setRangeDays(INITIAL_RANGE_DAYS);
      setSelectedSlot(null);
      setSelectedDoctorId(fixedDoctorId);
    }
  }, [fixedDoctorId, open]);

  const handleDoctorChange = (doctorId: number) => {
    setSelectedDoctorId(doctorId);
    setRangeDays(INITIAL_RANGE_DAYS);
    setSelectedSlot(null);
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const handleRegisteredSubmit = async (
    data: CreateAppointmentFormData,
    previewMeta: AppointmentCreatePreviewMeta
  ) => {
    try {
      await createAppointment.mutateAsync({
        doctorId: data.doctorId,
        patientId: data.patientId,
        date: data.date,
        hour: data.hour,
        consultationTypeId: data.consultationTypeId,
      });

      showSuccess(
        "Turno creado",
        previewMeta.patient
          ? `Se asignó el turno a ${previewMeta.patient.firstName} ${previewMeta.patient.lastName}.`
          : "El turno se creó correctamente."
      );
      handleClose(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosError.response?.data?.message || "No se pudo crear el turno";
      showError("Error", errorMessage);
    }
  };

  const handleGuestSubmit = async (
    data: GuestAppointmentData,
    previewMeta: AppointmentCreatePreviewMeta
  ) => {
    try {
      await createGuestAppointment.mutateAsync(data);
      showSuccess(
        "Turno invitado creado",
        previewMeta.guestFirstName
          ? `Se asignó el turno a ${previewMeta.guestFirstName} ${previewMeta.guestLastName ?? ""}`.trim()
          : "El turno invitado se creó correctamente."
      );
      handleClose(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosError.response?.data?.message ||
        "No se pudo crear el turno invitado";
      showError("Error", errorMessage);
      setSelectedSlot(null);
    }
  };

  const isSearching = isLoading || isFetching;
  const isSubmitting = isCreating || isCreatingGuest;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-[min(100vw,560px)] sm:max-w-[560px]">
        <SheetHeader className="pr-8">
          <SheetTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-greenPrimary" />
            Buscar turno libre
          </SheetTitle>
          <SheetDescription>
            Buscá huecos por médico en un rango inicial de 14 días y completá el alta sin salir de `/turnos`.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex h-[calc(100vh-8rem)] flex-col">
          {selectedSlot ? (
            <>
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-fit px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
                  onClick={() => setSelectedSlot(null)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a huecos disponibles
                </Button>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-emerald-600">Slot elegido</Badge>
                    {selectedDoctor && (
                      <Badge variant="outline" className="border-emerald-200 bg-white text-emerald-800">
                        {formatDoctorName(selectedDoctor)}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Fecha
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDateWithWeekdayAR(selectedSlot.date)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Hora
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatTimeAR(selectedSlot.hour)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="mt-6 flex-1 pr-4">
                <CreateAppointmentForm
                  onSubmit={handleRegisteredSubmit}
                  onGuestSubmit={allowGuestCreation ? handleGuestSubmit : undefined}
                  isLoading={isSubmitting}
                  fixedDoctorId={selectedDoctorId}
                  fixedDate={selectedSlot.date}
                  fixedHour={selectedSlot.hour}
                  allowGuestCreation={allowGuestCreation}
                />
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {fixedDoctorId ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Médico
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Stethoscope className="h-4 w-4 text-greenPrimary" />
                      {selectedDoctor ? formatDoctorName(selectedDoctor) : "Cargando médico..."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">Médico</p>
                    <DoctorSelect
                      value={selectedDoctorId}
                      onValueChange={handleDoctorChange}
                      placeholder="Seleccionar médico"
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                      Búsqueda inicial: 14 días
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                      Ampliable por +14 días
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {selectedDoctorId
                      ? `Buscando desde ${formatDateAR(startDate)} hasta ${formatDateAR(endDate)}.`
                      : "Elegí un médico para listar sus próximos huecos disponibles."}
                  </p>
                </div>
              </div>

              <Separator className="my-5" />

              <ScrollArea className="flex-1 pr-4">
                {!selectedDoctorId ? (
                  <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                    <Search className="h-10 w-10 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-700">
                      Seleccioná un médico para empezar
                    </p>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      El listado te mostrará los próximos horarios libres sin necesidad de navegar el calendario.
                    </p>
                  </div>
                ) : isSearching ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="space-y-2 rounded-2xl border border-slate-200 p-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : groupedSlots.length === 0 ? (
                  <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                    <div className="flex items-center gap-2 text-amber-900">
                      <CalendarDays className="h-5 w-5" />
                      <p className="font-semibold">No hay huecos disponibles en este rango</p>
                    </div>
                    <p className="text-sm text-amber-800">
                      Probá ampliar la búsqueda otros 14 días para encontrar disponibilidad más lejana.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedSlots.map((group) => (
                      <div
                        key={group.date}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatDateWithWeekdayAR(group.date)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {group.hours.length} {group.hours.length === 1 ? "hueco" : "huecos"} disponibles
                            </p>
                          </div>
                          <Badge variant="secondary">{formatDateAR(group.date)}</Badge>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {group.hours.map((hour) => (
                            <Button
                              key={`${group.date}-${hour}`}
                              type="button"
                              variant="outline"
                              className="h-auto justify-between rounded-xl border-slate-200 px-4 py-3 text-left"
                              onClick={() => setSelectedSlot({ date: group.date, hour })}
                            >
                              <span className="font-medium text-slate-900">
                                {formatTimeAR(hour)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                Reservar
                                <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  {selectedDoctorId
                    ? `Rango actual: ${rangeDays} días`
                    : "La ampliación se habilita al elegir un médico."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRangeDays((current) => current + RANGE_STEP_DAYS)}
                  disabled={!selectedDoctorId || isSearching}
                >
                  {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ampliar +14 días
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickBookAppointmentSheet;
