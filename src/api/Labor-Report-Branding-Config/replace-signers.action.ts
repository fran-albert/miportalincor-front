import { apiLaboral } from "@/services/axiosConfig";
import {
  LaborReportBrandingConfig,
  ReplaceLaborReportSignersInput,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

export const replaceLaborReportSigners = async (
  payload: ReplaceLaborReportSignersInput
): Promise<LaborReportBrandingConfig> => {
  const { data } = await apiLaboral.put<LaborReportBrandingConfig>(
    "labor-report-branding-config/current/signers",
    payload
  );

  return data;
};
