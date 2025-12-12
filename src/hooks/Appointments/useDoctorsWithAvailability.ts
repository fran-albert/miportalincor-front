import { useQuery } from "@tanstack/react-query";
import { getDoctorsWithAvailability } from "@/api/Appointments";

export const useDoctorsWithAvailability = () => {
  const query = useQuery({
    queryKey: ["doctorsWithAvailability"],
    queryFn: getDoctorsWithAvailability,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    doctorIds: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
