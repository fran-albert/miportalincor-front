import { apiLaboral } from "@/services/axiosConfig";
import {
  LaborReportBrandingConfig,
  UpdateLaborReportBrandingConfigInput,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

export const updateCurrentLaborReportBrandingConfig = async (
  payload: UpdateLaborReportBrandingConfigInput
): Promise<LaborReportBrandingConfig> => {
  const { data } = await apiLaboral.patch<LaborReportBrandingConfig>(
    "labor-report-branding-config/current",
    payload
  );

  return data;
};
