import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  usePublicAppointmentSpecialities,
  usePublicAvailableSlotsBySpeciality,
  usePublicDoctorsBySpeciality,
  useRequestAppointment,
} from "@/hooks/Appointments";
import { getAppointmentRequestErrorMessage } from "./requestAppointmentError";
import type { PublicAppointmentDoctor, PublicAppointmentSlot } from "@/api/Appointments";
import { addDays, format, isAfter, isBefore, isValid, parse, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "selection" | "schedule" | "confirm";

const steps: Array<{ id: Step; label: string }> = [
  { id: "selection", label: "Especialidad" },
  { id: "schedule", label: "Fecha y hora" },
  { id: "confirm", label: "Confirmar" },
];

const parseSlotDate = (date: string): Date | null => {
  const parsedDate = parse(date, "dd-MM-yyyy", new Date());
  return isValid(parsedDate) ? parsedDate : null;
};

const normalizeAppointmentHour = (time: string): string => {
  const trimmedTime = time.trim();
  return /^\d{2}:\d{2}$/.test(trimmedTime) ? `${trimmedTime}:00` : trimmedTime;
};

const getDoctorLabel = (
  doctor: PublicAppointmentDoctor | null | undefined,
  fallbackName?: string,
): string => {
  if (!doctor) return "Profesional";

  const fullName = [doctor.firstName, doctor.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    doctor.name?.trim() ||
    fullName ||
    doctor.providerName?.trim() ||
    fallbackName?.trim() ||
    `Profesional ${doctor.id}`
  );
};

export function RequestAppointmentDialog({
  open,
  onOpenChange,
}: RequestAppointmentDialogProps) {
  const [step, setStep] = useState<Step>("selection");
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const requestMutation = useRequestAppointment();

  const minDate = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addDays(minDate, 90), [minDate]);

  const {
    specialities,
    isLoading: loadingSpecialities,
    isError: specialitiesError,
  } = usePublicAppointmentSpecialities({ enabled: open });

  const {
    doctors,
    isLoading: loadingDoctors,
    isError: doctorsError,
  } = usePublicDoctorsBySpeciality({
    specialityId: selectedSpecialityId,
    enabled: open,
  });

  const {
    slots,
    isLoading: loadingSlots,
    isError: slotsError,
  } = usePublicAvailableSlotsBySpeciality({
    specialityId: selectedSpecialityId,
    enabled: open,
  });

  const selectedSpeciality = useMemo(
    () => specialities.find((speciality) => speciality.id === selectedSpecialityId) ?? null,
    [selectedSpecialityId, specialities],
  );

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [selectedDoctorId, doctors],
  );

  const doctorSlots = useMemo(
    () => slots.filter((slot) => slot.providerId === selectedDoctorId),
    [selectedDoctorId, slots],
  );

  const providerNameById = useMemo(() => {
    const names = new Map<number, string>();

    slots.forEach((slot) => {
      if (slot.providerName?.trim() && !names.has(slot.providerId)) {
        names.set(slot.providerId, slot.providerName.trim());
      }
    });

    return names;
  }, [slots]);

  const selectedDoctorLabel = useMemo(
    () => getDoctorLabel(
      selectedDoctor,
      selectedDoctorId ? providerNameById.get(selectedDoctorId) : undefined,
    ),
    [providerNameById, selectedDoctor, selectedDoctorId],
  );

  const availableDateSet = useMemo(() => {
    const availableDates = new Set<string>();

    doctorSlots.forEach((slot) => {
      if (slot.date && parseSlotDate(slot.date)) {
        availableDates.add(slot.date);
      }
    });

    return availableDates;
  }, [doctorSlots]);

  const formattedSelectedDate = selectedDate ? format(selectedDate, "dd-MM-yyyy") : "";

  const slotsForSelectedDate = useMemo(() => {
    const uniqueSlots = new Map<string, PublicAppointmentSlot>();

    doctorSlots
      .filter((slot) => slot.date === formattedSelectedDate && slot.time?.trim())
      .forEach((slot) => {
        const time = slot.time.trim();
        if (!uniqueSlots.has(time)) {
          uniqueSlots.set(time, { ...slot, time });
        }
      });

    return Array.from(uniqueSlots.values()).sort((a, b) => a.time.localeCompare(b.time));
  }, [doctorSlots, formattedSelectedDate]);

  const canContinue =
    (step === "selection" && !!selectedSpecialityId && !!selectedDoctorId) ||
    (step === "schedule" && !!selectedDate && !!selectedTime);

  useEffect(() => {
    if (!open) {
      setStep("selection");
      setSelectedSpecialityId(null);
      setSelectedDoctorId(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
      setBookingError(null);
      setDatePickerOpen(false);
    }
  }, [open]);

  useEffect(() => {
    setBookingError(null);
  }, [step, selectedSpecialityId, selectedDoctorId, selectedDate, selectedTime]);

  const handleSpecialityChange = (value: string) => {
    setSelectedSpecialityId(Number(value));
    setSelectedDoctorId(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setDatePickerOpen(false);
  };

  const handleDoctorChange = (value: string) => {
    setSelectedDoctorId(Number(value));
    setSelectedDate(undefined);
    setSelectedTime(null);
    setDatePickerOpen(false);
  };

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setDatePickerOpen(false);
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("schedule");
      return;
    }

    if (step === "schedule") {
      setStep("selection");
    }
  };

  const handleNext = () => {
    if (step === "selection" && canContinue) {
      setStep("schedule");
      return;
    }

    if (step === "schedule" && canContinue) {
      setStep("confirm");
    }
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    try {
      setBookingError(null);
      await requestMutation.mutateAsync({
        doctorId: selectedDoctor.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        hour: normalizeAppointmentHour(selectedTime),
      });
      onOpenChange(false);
    } catch (error) {
      setBookingError(getAppointmentRequestErrorMessage(error));
    }
  };

  const isDateDisabled = (date: Date) => {
    const day = startOfDay(date);

    if (isBefore(day, minDate) || isAfter(day, maxDate)) {
      return true;
    }

    if (loadingSlots || !availableDateSet.size) {
      return true;
    }

    return !availableDateSet.has(format(date, "dd-MM-yyyy"));
  };

  const renderStepIndicator = () => (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((item, index) => {
        const currentIndex = steps.findIndex((currentStep) => currentStep.id === step);
        const isActive = item.id === step;
        const isComplete = index < currentIndex;

        return (
          <div key={item.id} className="space-y-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full bg-muted transition-colors",
                (isActive || isComplete) && "bg-greenPrimary",
              )}
            />
            <p
              className={cn(
                "text-xs font-medium text-muted-foreground",
                isActive && "text-greenPrimary",
                isComplete && "text-foreground",
              )}
            >
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {step === "selection" && (
              <>
                <Stethoscope className="h-5 w-5 text-greenPrimary" />
                Sacar turno
              </>
            )}
            {step === "schedule" && (
              <>
                <CalendarIcon className="h-5 w-5 text-greenPrimary" />
                Elegir fecha y horario
              </>
            )}
            {step === "confirm" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-greenPrimary" />
                Confirmar turno
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "selection" && "Seleccioná especialidad y profesional para ver disponibilidad."}
            {step === "schedule" &&
              selectedDoctor &&
              `Turnos disponibles con ${selectedDoctorLabel}.`}
            {step === "confirm" && "Revisá los datos antes de reservar el turno."}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <ScrollArea className="max-h-[58vh] pr-4">
          <div className="py-5">
            {step === "selection" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="speciality">Especialidad</Label>
                  {loadingSpecialities ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={selectedSpecialityId ? String(selectedSpecialityId) : ""}
                      onValueChange={handleSpecialityChange}
                      disabled={specialitiesError || !specialities.length}
                    >
                      <SelectTrigger id="speciality">
                        <SelectValue placeholder="Seleccionar especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialities.map((speciality) => (
                          <SelectItem key={speciality.id} value={String(speciality.id)}>
                            {speciality.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor">Profesional</Label>
                  {loadingDoctors ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={selectedDoctorId ? String(selectedDoctorId) : ""}
                      onValueChange={handleDoctorChange}
                      disabled={!selectedSpecialityId || doctorsError || !doctors.length}
                    >
                      <SelectTrigger id="doctor">
                        <SelectValue
                          placeholder={
                            selectedSpecialityId
                              ? "Seleccionar profesional"
                              : "Primero seleccioná una especialidad"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={String(doctor.id)}>
                            {getDoctorLabel(doctor, providerNameById.get(doctor.id))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {specialitiesError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No pudimos cargar las especialidades</AlertTitle>
                    <AlertDescription>Intentá nuevamente en unos minutos.</AlertDescription>
                  </Alert>
                )}

                {selectedSpecialityId && !loadingDoctors && !doctorsError && !doctors.length && (
                  <Alert>
                    <Stethoscope className="h-4 w-4" />
                    <AlertTitle>Sin profesionales disponibles</AlertTitle>
                    <AlertDescription>
                      La especialidad seleccionada no tiene turnos publicados por ahora.
                    </AlertDescription>
                  </Alert>
                )}

                {doctorsError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No pudimos cargar los profesionales</AlertTitle>
                    <AlertDescription>Probá con otra especialidad o intentá nuevamente.</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {step === "schedule" && (
              <div className="space-y-5">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium text-foreground">{selectedDoctorLabel}</p>
                  {selectedSpeciality && (
                    <Badge variant="secondary" className="mt-2">
                      {selectedSpeciality.name}
                    </Badge>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
                    <Skeleton className="h-[320px] w-full" />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <Skeleton key={item} className="h-10 w-full" />
                      ))}
                    </div>
                  </div>
                ) : slotsError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No pudimos cargar la disponibilidad</AlertTitle>
                    <AlertDescription>Volvé a intentar o elegí otro profesional.</AlertDescription>
                  </Alert>
                ) : !availableDateSet.size ? (
                  <Alert>
                    <CalendarIcon className="h-4 w-4" />
                    <AlertTitle>Sin turnos disponibles</AlertTitle>
                    <AlertDescription>
                      No hay fechas publicadas para este profesional en los próximos 90 días.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "h-11 w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate
                              ? format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
                              : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleSelectDate}
                            disabled={isDateDisabled}
                            locale={es}
                            fromDate={minDate}
                            toDate={maxDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground">
                        Sólo vas a poder elegir días con horarios disponibles.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Horario</Label>
                      {selectedDate ? (
                        slotsForSelectedDate.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {slotsForSelectedDate.map((slot) => (
                              <Button
                                key={`${slot.id}-${slot.time}`}
                                type="button"
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                className={cn(
                                  "h-10",
                                  selectedTime === slot.time &&
                                    "bg-greenPrimary hover:bg-greenPrimary/90",
                                )}
                                onClick={() => setSelectedTime(slot.time)}
                              >
                                {slot.time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                            No hay horarios libres para la fecha seleccionada.
                          </p>
                        )
                      ) : (
                        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                          Seleccioná una fecha marcada como disponible.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === "confirm" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <dl className="grid gap-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground">Especialidad</dt>
                      <dd className="text-right font-medium">{selectedSpeciality?.name}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground">Profesional</dt>
                      <dd className="text-right font-medium">{selectedDoctorLabel}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground">Fecha</dt>
                      <dd className="text-right font-medium">
                        {selectedDate
                          ? format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
                          : "-"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground">Hora</dt>
                      <dd className="text-right font-medium">{selectedTime} hs</dd>
                    </div>
                  </dl>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  El turno quedará asociado a tu cuenta del portal.
                </p>

                {bookingError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No pudimos reservar el turno</AlertTitle>
                    <AlertDescription>{bookingError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between gap-3 border-t pt-4">
          {step !== "selection" ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          ) : (
            <div />
          )}

          {step === "confirm" ? (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={requestMutation.isPending}
              className="bg-greenPrimary hover:bg-greenPrimary/90"
            >
              {requestMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirmar turno
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="bg-greenPrimary hover:bg-greenPrimary/90"
            >
              Siguiente
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
