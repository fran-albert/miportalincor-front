import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorsWithAvailability,
  useAvailableSlots,
  useRequestAppointment,
} from "@/hooks/Appointments";
import { getDoctorsPublicInfo, DoctorPublicInfo } from "@/api/Appointments";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, isWeekend, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Stethoscope,
} from "lucide-react";

interface RequestAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "doctor" | "date" | "time" | "confirm";

export function RequestAppointmentDialog({
  open,
  onOpenChange,
}: RequestAppointmentDialogProps) {
  const [step, setStep] = useState<Step>("doctor");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorPublicInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("doctor");
      setSelectedDoctor(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
    }
  }, [open]);

  // Fetch doctors with availability
  const { doctorIds, isLoading: loadingDoctorIds } = useDoctorsWithAvailability();

  // Fetch doctor details for each ID (solo info publica)
  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctorPublicDetails", doctorIds],
    queryFn: () => getDoctorsPublicInfo(doctorIds),
    enabled: doctorIds.length > 0,
  });

  // Fetch available slots when date is selected
  const dateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const { slots, isLoading: loadingSlots } = useAvailableSlots({
    doctorId: selectedDoctor?.userId ?? 0,
    date: dateString,
    enabled: !!selectedDoctor && !!selectedDate,
  });

  // Request appointment mutation
  const requestMutation = useRequestAppointment();

  const handleSelectDoctor = (doctor: DoctorPublicInfo) => {
    setSelectedDoctor(doctor);
    setStep("date");
  };

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (date) {
      setStep("time");
    }
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    try {
      await requestMutation.mutateAsync({
        doctorId: selectedDoctor.userId,
        date: format(selectedDate, "yyyy-MM-dd"),
        hour: selectedTime,
      });
      onOpenChange(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleBack = () => {
    switch (step) {
      case "date":
        setStep("doctor");
        setSelectedDoctor(null);
        break;
      case "time":
        setStep("date");
        setSelectedDate(undefined);
        break;
      case "confirm":
        setStep("time");
        setSelectedTime(null);
        break;
    }
  };

  const isLoadingDoctors = loadingDoctorIds || loadingDoctors;

  // Disable weekends and past dates
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    return isWeekend(date) || isBefore(date, today);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "doctor" && (
              <>
                <User className="h-5 w-5" />
                Selecciona un medico
              </>
            )}
            {step === "date" && (
              <>
                <CalendarIcon className="h-5 w-5" />
                Selecciona una fecha
              </>
            )}
            {step === "time" && (
              <>
                <Clock className="h-5 w-5" />
                Selecciona un horario
              </>
            )}
            {step === "confirm" && (
              <>
                <CheckCircle className="h-5 w-5" />
                Confirmar turno
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "doctor" && "Elige el medico con el que deseas atenderte"}
            {step === "date" && `Turnos con Dr. ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}`}
            {step === "time" && `Horarios disponibles para el ${selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : ""}`}
            {step === "confirm" && "Revisa los datos y confirma tu turno"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step: Select Doctor */}
          {step === "doctor" && (
            <ScrollArea className="h-[400px] pr-4">
              {isLoadingDoctors ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : doctors && doctors.length > 0 ? (
                <div className="space-y-3">
                  {doctors.map((doctor) => (
                    <Button
                      key={doctor.userId}
                      variant="outline"
                      className="w-full h-auto p-4 justify-start"
                      onClick={() => handleSelectDoctor(doctor)}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-greenPrimary" />
                          <span className="font-medium">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {doctor.specialities?.map((spec) => (
                            <Badge key={spec.id} variant="secondary" className="text-xs">
                              {spec.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay medicos con disponibilidad configurada
                </p>
              )}
            </ScrollArea>
          )}

          {/* Step: Select Date */}
          {step === "date" && (
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                disabled={isDateDisabled}
                locale={es}
                fromDate={new Date()}
                toDate={addDays(new Date(), 60)}
                className="rounded-md border"
              />
            </div>
          )}

          {/* Step: Select Time */}
          {step === "time" && (
            <ScrollArea className="h-[300px] pr-4">
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.hour}
                      variant={selectedTime === slot.hour ? "default" : "outline"}
                      className="h-10"
                      onClick={() => handleSelectTime(slot.hour)}
                    >
                      {slot.hour}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay horarios disponibles para esta fecha.
                  <br />
                  Por favor selecciona otra fecha.
                </p>
              )}
            </ScrollArea>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Medico:</span>
                  <span className="font-medium">
                    Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                  </span>
                </div>
                {selectedDoctor?.specialities && selectedDoctor.specialities.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedDoctor.specialities[0].name}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {selectedDate
                      ? format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
                      : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Hora:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Al confirmar, el turno quedara reservado automaticamente.
              </p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-2">
          {step !== "doctor" ? (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          ) : (
            <div />
          )}

          {step === "confirm" && (
            <Button
              onClick={handleConfirm}
              disabled={requestMutation.isPending}
              className="bg-greenPrimary hover:bg-greenPrimary/90"
            >
              {requestMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Confirmar turno
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
