import { useQuery } from "@tanstack/react-query";
import {
  getPublicAppointmentSpecialities,
  getPublicAvailableSlotsBySpeciality,
  getPublicDoctorsBySpeciality,
} from "@/api/Appointments";

interface EnabledQueryOptions {
  enabled?: boolean;
}

interface SpecialityQueryOptions extends EnabledQueryOptions {
  specialityId?: number | null;
}

export const usePublicAppointmentSpecialities = ({ enabled = true }: EnabledQueryOptions = {}) => {
  const query = useQuery({
    queryKey: ["publicAppointmentSpecialities"],
    queryFn: getPublicAppointmentSpecialities,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  return {
    specialities: query.data ?? [],
    ...query,
  };
};

export const usePublicDoctorsBySpeciality = ({
  specialityId,
  enabled = true,
}: SpecialityQueryOptions) => {
  const query = useQuery({
    queryKey: ["publicDoctorsBySpeciality", specialityId],
    queryFn: () => getPublicDoctorsBySpeciality(specialityId!),
    enabled: enabled && !!specialityId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    doctors: query.data ?? [],
    ...query,
  };
};

export const usePublicAvailableSlotsBySpeciality = ({
  specialityId,
  enabled = true,
}: SpecialityQueryOptions) => {
  const query = useQuery({
    queryKey: ["publicAvailableSlotsBySpeciality", specialityId],
    queryFn: () => getPublicAvailableSlotsBySpeciality(specialityId!),
    enabled: enabled && !!specialityId,
    staleTime: 1000 * 60,
  });

  return {
    slots: query.data ?? [],
    ...query,
  };
};
