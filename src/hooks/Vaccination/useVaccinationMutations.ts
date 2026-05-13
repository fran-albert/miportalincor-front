import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createVaccinationApplication,
  deleteVaccinationApplication,
  updateVaccinationApplication,
} from "@/api/Vaccination/vaccination.action";
import type {
  CreateVaccinationApplicationDto,
  UpdateVaccinationApplicationDto,
} from "@/types/Vaccination/Vaccination";

export const useVaccinationMutations = () => {
  const queryClient = useQueryClient();

  const invalidateVaccinationQueries = (patientUserId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["my-vaccination-card"] });
    if (patientUserId) {
      queryClient.invalidateQueries({
        queryKey: ["patient-vaccination-card", patientUserId],
      });
    } else {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "patient-vaccination-card",
      });
    }
  };

  const createApplicationMutation = useMutation({
    mutationFn: ({
      patientUserId,
      dto,
    }: {
      patientUserId: string;
      dto: CreateVaccinationApplicationDto;
    }) => createVaccinationApplication(patientUserId, dto),
    onSuccess: (_, variables) => {
      invalidateVaccinationQueries(variables.patientUserId);
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({
      applicationId,
      dto,
    }: {
      applicationId: string;
      dto: UpdateVaccinationApplicationDto;
    }) => updateVaccinationApplication(applicationId, dto),
    onSuccess: (application) => {
      invalidateVaccinationQueries(application.patientUserId);
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: ({ applicationId }: { applicationId: string }) =>
      deleteVaccinationApplication(applicationId),
    onSuccess: () => {
      invalidateVaccinationQueries();
    },
  });

  return {
    createApplicationMutation,
    updateApplicationMutation,
    deleteApplicationMutation,
  };
};
