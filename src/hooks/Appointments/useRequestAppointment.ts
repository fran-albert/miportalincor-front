import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestAppointment, RequestAppointmentDto } from "@/api/Appointments";
import { useToast } from "@/hooks/use-toast";

export const useRequestAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: RequestAppointmentDto) => requestAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      toast({
        title: "Turno reservado",
        description: "Tu turno ha sido reservado exitosamente",
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "No se pudo reservar el turno";
      toast({
        title: "Error",
        description: message,
      });
    },
  });
};
