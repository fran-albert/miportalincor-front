import { apiLaboral } from "@/services/axiosConfig";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

export const getCurrentLaborReportBrandingConfig =
  async (): Promise<LaborReportBrandingConfig> => {
    const { data } = await apiLaboral.get<LaborReportBrandingConfig>(
      "labor-report-branding-config/current"
    );

    return data;
  };
