import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentLaborReportBrandingConfig } from "@/api/Labor-Report-Branding-Config/update-current.action";
import { replaceLaborReportSigners } from "@/api/Labor-Report-Branding-Config/replace-signers.action";
import { replaceLaborReportSignaturePolicies } from "@/api/Labor-Report-Branding-Config/replace-policies.action";
import { laborReportBrandingConfigKeys } from "./useLaborReportBrandingConfig";

export const useLaborReportBrandingConfigMutations = () => {
  const queryClient = useQueryClient();

  const invalidateBrandingConfig = () =>
    queryClient.invalidateQueries({
      queryKey: laborReportBrandingConfigKeys.all,
    });

  const updateConfigMutation = useMutation({
    mutationFn: updateCurrentLaborReportBrandingConfig,
    onSuccess: invalidateBrandingConfig,
  });

  const replaceSignersMutation = useMutation({
    mutationFn: replaceLaborReportSigners,
    onSuccess: invalidateBrandingConfig,
  });

  const replacePoliciesMutation = useMutation({
    mutationFn: replaceLaborReportSignaturePolicies,
    onSuccess: invalidateBrandingConfig,
  });

  return {
    updateConfigMutation,
    replaceSignersMutation,
    replacePoliciesMutation,
  };
};
