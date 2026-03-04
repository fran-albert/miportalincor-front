import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reschedulePatientAppointment } from "@/api/Appointments";
import { RescheduleAppointmentDto } from "@/types/Appointment/Appointment";

export const useReschedulePatientAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: RescheduleAppointmentDto }) =>
      reschedulePatientAppointment(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      queryClient.invalidateQueries({
        queryKey: ["patientAppointmentsByUserId"],
      });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    },
  });
};
