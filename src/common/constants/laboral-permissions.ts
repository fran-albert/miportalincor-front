import { Role } from "@/common/enums/role.enum";

export const LABORAL_ROLE_NAME = "Laboral";

export const LABORAL_CAPABILITIES = {
  ACCESS: "laboral.access",
  COMPANIES_READ: "laboral.companies.read",
  COMPANIES_WRITE: "laboral.companies.write",
  COLLABORATORS_READ: "laboral.collaborators.read",
  COLLABORATORS_WRITE: "laboral.collaborators.write",
  EXAMS_READ: "laboral.exams.read",
  EXAMS_WRITE: "laboral.exams.write",
  EXAMS_DELETE: "laboral.exams.delete",
  REPORTS_READ: "laboral.reports.read",
  REPORTS_GENERATE: "laboral.reports.generate",
  REPORT_CONFIG_READ: "laboral.report_config.read",
  REPORT_CONFIG_WRITE: "laboral.report_config.write",
} as const;

export type LaboralCapability =
  (typeof LABORAL_CAPABILITIES)[keyof typeof LABORAL_CAPABILITIES];

const ALL_LABORAL_CAPABILITIES = Object.values(
  LABORAL_CAPABILITIES
) as LaboralCapability[];

const SECRETARY_LABORAL_CAPABILITIES: LaboralCapability[] = [
  LABORAL_CAPABILITIES.ACCESS,
  LABORAL_CAPABILITIES.COMPANIES_READ,
  LABORAL_CAPABILITIES.COMPANIES_WRITE,
  LABORAL_CAPABILITIES.COLLABORATORS_READ,
  LABORAL_CAPABILITIES.COLLABORATORS_WRITE,
  LABORAL_CAPABILITIES.EXAMS_READ,
  LABORAL_CAPABILITIES.EXAMS_WRITE,
  LABORAL_CAPABILITIES.EXAMS_DELETE,
  LABORAL_CAPABILITIES.REPORTS_READ,
  LABORAL_CAPABILITIES.REPORTS_GENERATE,
];

const DOCTOR_LABORAL_CAPABILITIES: LaboralCapability[] = [
  LABORAL_CAPABILITIES.ACCESS,
  LABORAL_CAPABILITIES.COMPANIES_READ,
  LABORAL_CAPABILITIES.COLLABORATORS_READ,
  LABORAL_CAPABILITIES.EXAMS_READ,
  LABORAL_CAPABILITIES.EXAMS_WRITE,
  LABORAL_CAPABILITIES.REPORTS_READ,
  LABORAL_CAPABILITIES.REPORTS_GENERATE,
];

export const resolveLaboralCapabilities = (
  userRoles: string[]
): Set<LaboralCapability> => {
  const normalizedRoles = userRoles.map((role) => role.toLowerCase());

  if (normalizedRoles.includes(Role.ADMINISTRADOR.toLowerCase())) {
    return new Set(ALL_LABORAL_CAPABILITIES);
  }

  const hasLaboralRole = normalizedRoles.includes(
    LABORAL_ROLE_NAME.toLowerCase()
  );
  if (!hasLaboralRole) {
    return new Set();
  }

  const capabilities = new Set<LaboralCapability>();

  if (normalizedRoles.includes(Role.SECRETARIA.toLowerCase())) {
    SECRETARY_LABORAL_CAPABILITIES.forEach((capability) =>
      capabilities.add(capability)
    );
  }

  if (normalizedRoles.includes(Role.MEDICO.toLowerCase())) {
    DOCTOR_LABORAL_CAPABILITIES.forEach((capability) =>
      capabilities.add(capability)
    );
  }

  return capabilities;
};

export const hasLaboralCapabilities = (
  userRoles: string[],
  requiredCapabilities: LaboralCapability[]
): boolean => {
  if (!requiredCapabilities.length) return true;

  const grantedCapabilities = resolveLaboralCapabilities(userRoles);
  return requiredCapabilities.every((capability) =>
    grantedCapabilities.has(capability)
  );
};
