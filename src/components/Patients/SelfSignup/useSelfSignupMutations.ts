import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deactivateSelfSignupPatient,
  verifySelfSignupPatient,
} from "@/api/Patient/verify-self-signup.action";

export const useSelfSignupMutations = () => {
  const queryClient = useQueryClient();
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["patient"] });
    await queryClient.invalidateQueries({ queryKey: ["patients-search"] });
  };

  const verifyMutation = useMutation({
    mutationFn: (userId: string | number) => verifySelfSignupPatient(userId),
    onSuccess: refresh,
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string | number; reason: string }) =>
      deactivateSelfSignupPatient(userId, reason),
    onSuccess: refresh,
  });

  return { verifyMutation, deactivateMutation };
};
