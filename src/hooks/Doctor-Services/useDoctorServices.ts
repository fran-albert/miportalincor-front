import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  checkDoctorService,
  getDoctorsWithService,
  getAllDoctorServicesSummary,
  getDoctorServices,
  updateDoctorService,
} from "@/api/Doctor-Services/doctor-services.actions";
import { ServiceType, UpdateDoctorServiceDto } from "@/types/Doctor-Services/DoctorServices";
import useUserRole from "@/hooks/useRoles";

export const doctorServicesKeys = {
  all: ["doctor-services"] as const,
  summary: () => [...doctorServicesKeys.all, "summary"] as const,
  doctorsWithService: (type: ServiceType) =>
    [...doctorServicesKeys.all, "with", type] as const,
  check: (doctorId: string, type: ServiceType) =>
    [...doctorServicesKeys.all, "check", doctorId, type] as const,
  doctor: (doctorId: string) =>
    [...doctorServicesKeys.all, "doctor", doctorId] as const,
};

interface UseDoctorServicesSummaryProps {
  enabled?: boolean;
}

export const useDoctorServicesSummary = ({
  enabled = true,
}: UseDoctorServicesSummaryProps = {}) => {
  const {
    isLoading,
    isError,
    error,
    data: servicesSummary = [],
    isFetching,
  } = useQuery({
    queryKey: doctorServicesKeys.summary(),
    queryFn: getAllDoctorServicesSummary,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isLoading, isError, error, servicesSummary, isFetching };
};

interface UseDoctorsWithServiceProps {
  serviceType: ServiceType;
  enabled?: boolean;
}

export const useDoctorsWithService = ({
  serviceType,
  enabled = true,
}: UseDoctorsWithServiceProps) => {
  const {
    isLoading,
    isError,
    error,
    data: doctorsWithService = [],
    isFetching,
  } = useQuery({
    queryKey: doctorServicesKeys.doctorsWithService(serviceType),
    queryFn: () => getDoctorsWithService(serviceType),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isLoading, isError, error, doctorsWithService, isFetching };
};

export const useDoctorsWithGreenCard = (enabled = true) => {
  return useDoctorsWithService({
    serviceType: ServiceType.GREEN_CARD,
    enabled,
  });
};

interface UseCheckDoctorServiceProps {
  doctorUserId: string | undefined;
  serviceType: ServiceType;
  enabled?: boolean;
}

export const useCheckDoctorService = ({
  doctorUserId,
  serviceType,
  enabled = true,
}: UseCheckDoctorServiceProps) => {
  const {
    isLoading,
    isError,
    error,
    data: isServiceEnabled = false,
    isFetching,
  } = useQuery({
    queryKey: doctorServicesKeys.check(doctorUserId ?? "", serviceType),
    queryFn: () => checkDoctorService(doctorUserId!, serviceType),
    enabled: enabled && !!doctorUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isLoading, isError, error, isServiceEnabled, isFetching };
};

export const useMyGreenCardServiceEnabled = () => {
  const { session, isDoctor } = useUserRole();

  return useCheckDoctorService({
    doctorUserId: session?.id,
    serviceType: ServiceType.GREEN_CARD,
    enabled: isDoctor && !!session?.id,
  });
};

interface UseDoctorServicesProps {
  doctorUserId: string;
  enabled?: boolean;
}

export const useDoctorServicesForDoctor = ({
  doctorUserId,
  enabled = true,
}: UseDoctorServicesProps) => {
  const {
    isLoading,
    isError,
    error,
    data: services = [],
    isFetching,
  } = useQuery({
    queryKey: doctorServicesKeys.doctor(doctorUserId),
    queryFn: () => getDoctorServices(doctorUserId),
    enabled: enabled && !!doctorUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isLoading, isError, error, services, isFetching };
};

interface UpdateDoctorServiceParams {
  doctorUserId: string;
  serviceType: ServiceType;
  dto: UpdateDoctorServiceDto;
}

export const useUpdateDoctorService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorUserId, serviceType, dto }: UpdateDoctorServiceParams) =>
      updateDoctorService(doctorUserId, serviceType, dto),
    onSuccess: (_data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: doctorServicesKeys.all });
      queryClient.invalidateQueries({
        queryKey: doctorServicesKeys.check(
          variables.doctorUserId,
          variables.serviceType
        ),
      });
    },
  });
};
