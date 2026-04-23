import { getMyAuthProfile } from "@/api/Auth/get-my-profile.action";
import { updateMyTwoFactorPreference } from "@/api/Auth/update-my-two-factor-preference.action";
import type {
  AuthProfile,
  UpdateTwoFactorPreferenceDto,
} from "@/types/Auth/Profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const authProfileKeys = {
  all: ["authProfile"] as const,
  me: () => [...authProfileKeys.all, "me"] as const,
};

export const useMyAuthProfile = (enabled: boolean = true) => {
  const query = useQuery({
    queryKey: authProfileKeys.me(),
    queryFn: getMyAuthProfile,
    enabled,
    staleTime: 1000 * 60,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useUpdateMyTwoFactorPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateTwoFactorPreferenceDto) =>
      updateMyTwoFactorPreference(dto),
    onSuccess: (profile: AuthProfile) => {
      queryClient.setQueryData(authProfileKeys.me(), profile);
    },
  });
};
