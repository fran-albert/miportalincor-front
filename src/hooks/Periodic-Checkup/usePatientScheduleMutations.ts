import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignCheckupToPatient,
  updatePatientSchedule,
  deletePatientSchedule,
  completeCheckup,
} from "@/api/Periodic-Checkup";
import {
  CreatePatientScheduleDto,
  UpdatePatientScheduleDto,
  CompleteCheckupDto,
} from "@/types/Periodic-Checkup/PeriodicCheckup";

export const useAssignCheckupToPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePatientScheduleDto) => assignCheckupToPatient(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['patient-checkup-schedules', variables.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['patient-checkup-schedules'],
      });
    },
  });
};

export const useUpdatePatientSchedule = (patientId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePatientScheduleDto }) =>
      updatePatientSchedule(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-checkup-schedules'],
      });
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: ['patient-checkup-schedules', patientId],
        });
      }
    },
  });
};

export const useDeletePatientSchedule = (patientId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePatientSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-checkup-schedules'],
      });
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: ['patient-checkup-schedules', patientId],
        });
      }
    },
  });
};

export const useCompleteCheckup = (patientId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CompleteCheckupDto }) =>
      completeCheckup(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['patient-checkup-schedules'],
      });
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: ['patient-checkup-schedules', patientId],
        });
      }
    },
  });
};
