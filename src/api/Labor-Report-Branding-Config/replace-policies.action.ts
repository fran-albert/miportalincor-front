import { apiLaboral } from "@/services/axiosConfig";
import {
  LaborReportBrandingConfig,
  ReplaceLaborReportSignaturePoliciesInput,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

export const replaceLaborReportSignaturePolicies = async (
  payload: ReplaceLaborReportSignaturePoliciesInput
): Promise<LaborReportBrandingConfig> => {
  const { data } = await apiLaboral.put<LaborReportBrandingConfig>(
    "labor-report-branding-config/current/policies",
    payload
  );

  return data;
};
