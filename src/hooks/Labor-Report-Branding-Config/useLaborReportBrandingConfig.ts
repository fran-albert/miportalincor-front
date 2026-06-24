import { useQuery } from "@tanstack/react-query";
import { getCurrentLaborReportBrandingConfig } from "@/api/Labor-Report-Branding-Config/get-current.action";
import {
  DEFAULT_LABOR_REPORT_BRANDING_CONFIG,
  resolveLaborReportBrandingConfig,
} from "@/components/Pre-Occupational/Preview/signature-policy";

interface Params {
  enabled?: boolean;
  fallbackOnError?: boolean;
}

export const laborReportBrandingConfigKeys = {
  all: ["labor-report-branding-config"] as const,
  current: () => ["labor-report-branding-config", "current"] as const,
};

export const useLaborReportBrandingConfig = ({
  enabled = true,
  fallbackOnError = true,
}: Params = {}) => {
  const query = useQuery({
    queryKey: laborReportBrandingConfigKeys.current(),
    queryFn: async () => {
      try {
        const response = await getCurrentLaborReportBrandingConfig();
        return resolveLaborReportBrandingConfig(response);
      } catch (error) {
        if (!fallbackOnError) {
          throw error;
        }
        return DEFAULT_LABOR_REPORT_BRANDING_CONFIG;
      }
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: fallbackOnError
      ? query.data ?? DEFAULT_LABOR_REPORT_BRANDING_CONFIG
      : query.data,
  };
};
