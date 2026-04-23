import useUserRole from "@/hooks/useRoles";
import {
  hasLaboralCapabilities,
  LABORAL_CAPABILITIES,
  LaboralCapability,
  resolveLaboralCapabilities,
} from "@/common/constants/laboral-permissions";

export default function useLaboralPermissions() {
  const { session } = useUserRole();
  const userRoles = session?.role || [];
  const grantedCapabilities = resolveLaboralCapabilities(userRoles);

  return {
    userRoles,
    grantedCapabilities,
    canAccessLaboral: grantedCapabilities.has(LABORAL_CAPABILITIES.ACCESS),
    canReadLaboralReportConfig: grantedCapabilities.has(
      LABORAL_CAPABILITIES.REPORT_CONFIG_READ
    ),
    canWriteLaboralReportConfig: grantedCapabilities.has(
      LABORAL_CAPABILITIES.REPORT_CONFIG_WRITE
    ),
    canDeleteLaboralExam: grantedCapabilities.has(
      LABORAL_CAPABILITIES.EXAMS_DELETE
    ),
    canManageLaboralExam: grantedCapabilities.has(
      LABORAL_CAPABILITIES.EXAMS_WRITE
    ),
    hasLaboralCapabilities: (
      requiredCapabilities: LaboralCapability | LaboralCapability[]
    ) =>
      hasLaboralCapabilities(
        userRoles,
        Array.isArray(requiredCapabilities)
          ? requiredCapabilities
          : [requiredCapabilities]
      ),
  };
}
