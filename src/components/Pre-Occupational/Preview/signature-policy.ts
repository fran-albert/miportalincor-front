import {
  LaborReportBrandingConfig,
  LaborReportSigner,
  LaborReportSignerDisplay,
  LaborReportSignaturePresentationMode,
  LaborReportSignaturePolicy,
  LaborReportSignatureSection,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

export type ReportSignatureSection =
  | LaborReportSignatureSection
  | "study";

const DEFAULT_INSTITUTIONAL_SIGNER: LaborReportSigner = {
  id: 0,
  signerKey: "default_institutional_signer",
  name: "BONIFACIO Ma. CECILIA",
  license: "M.P. 96533 - M.L. 7299",
  specialty: "Especialista en Medicina del Trabajo",
  signatureUrl:
    "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png",
  sealUrl: null,
  stampText:
    "BONIFACIO Ma. CECILIA\nEspecialista en Medicina del Trabajo\nM.P. 96533 - M.L. 7299",
  hcDoctorUserId: null,
  signerType: "institutional",
  active: true,
};

const DEFAULT_LOGO_URL =
  "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743117056/dpwo5yinodpy9ibpjtum.png";

const DEFAULT_POLICIES: LaborReportSignaturePolicy[] = [
  {
    id: 0,
    reportType: "PREOCUPACIONAL",
    section: "cover",
    mode: "institutional_signer",
    presentationMode: "signature_seal_and_text",
    signer: DEFAULT_INSTITUTIONAL_SIGNER,
  },
  {
    id: 0,
    reportType: "PREOCUPACIONAL",
    section: "clinical",
    mode: "exam_doctor",
    presentationMode: "signature_and_text",
    signer: null,
  },
  {
    id: 0,
    reportType: "PREOCUPACIONAL",
    section: "studies",
    mode: "institutional_signer",
    presentationMode: "signature_seal_and_text",
    signer: DEFAULT_INSTITUTIONAL_SIGNER,
  },
];

export const DEFAULT_LABOR_REPORT_BRANDING_CONFIG: LaborReportBrandingConfig = {
  id: 0,
  institutionName: "Incor Centro Medico",
  logoUrl: DEFAULT_LOGO_URL,
  headerAddress: null,
  footerLegalText: null,
  active: true,
  signers: [DEFAULT_INSTITUTIONAL_SIGNER],
  policies: DEFAULT_POLICIES,
};

const normalizeReportType = (reportType?: string) =>
  (reportType ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

const normalizeSection = (
  section: ReportSignatureSection
): LaborReportSignatureSection => {
  return section === "study" ? "studies" : section;
};

const sanitizeText = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const resolveLaborReportBrandingConfig = (
  config?: LaborReportBrandingConfig | null
): LaborReportBrandingConfig => {
  if (!config) {
    return DEFAULT_LABOR_REPORT_BRANDING_CONFIG;
  }

  return {
    ...DEFAULT_LABOR_REPORT_BRANDING_CONFIG,
    ...config,
    institutionName:
      config.institutionName ||
      DEFAULT_LABOR_REPORT_BRANDING_CONFIG.institutionName,
    logoUrl:
      config.logoUrl ?? DEFAULT_LABOR_REPORT_BRANDING_CONFIG.logoUrl ?? null,
    headerAddress:
      config.headerAddress ??
      DEFAULT_LABOR_REPORT_BRANDING_CONFIG.headerAddress ??
      null,
    footerLegalText:
      config.footerLegalText ??
      DEFAULT_LABOR_REPORT_BRANDING_CONFIG.footerLegalText ??
      null,
    signers:
      config.signers?.length > 0
        ? config.signers
        : DEFAULT_LABOR_REPORT_BRANDING_CONFIG.signers,
    policies:
      config.policies?.length > 0
        ? config.policies
        : DEFAULT_LABOR_REPORT_BRANDING_CONFIG.policies,
  };
};

const getPolicyForSection = (
  section: ReportSignatureSection,
  config?: LaborReportBrandingConfig | null,
  reportType?: string
): LaborReportSignaturePolicy => {
  const resolvedConfig = resolveLaborReportBrandingConfig(config);
  const normalizedSection = normalizeSection(section);
  const normalizedReportType = normalizeReportType(reportType);

  const exactPolicy = resolvedConfig.policies.find(
    (policy) =>
      normalizeReportType(policy.reportType) === normalizedReportType &&
      policy.section === normalizedSection
  );

  if (exactPolicy) {
    return exactPolicy;
  }

  const firstPolicyForSection = resolvedConfig.policies.find(
    (policy) => policy.section === normalizedSection
  );

  if (firstPolicyForSection) {
    return firstPolicyForSection;
  }

  return DEFAULT_POLICIES.find(
    (policy) => policy.section === normalizedSection
  )!;
};

export const usesExamDoctorSignature = (
  section: ReportSignatureSection,
  config?: LaborReportBrandingConfig | null,
  reportType?: string
): boolean => {
  return (
    getPolicyForSection(section, config, reportType).mode === "exam_doctor"
  );
};

export const getInstitutionalSignerForSection = (
  section: ReportSignatureSection,
  config?: LaborReportBrandingConfig | null,
  reportType?: string
): LaborReportSignerDisplay => {
  const resolvedConfig = resolveLaborReportBrandingConfig(config);
  const policy = getPolicyForSection(section, resolvedConfig, reportType);

  const signer =
    policy.signer ??
    resolvedConfig.signers.find(
      (currentSigner) =>
        currentSigner.active && currentSigner.signerType === "institutional"
    ) ??
    DEFAULT_INSTITUTIONAL_SIGNER;

  return {
    name: signer.name || DEFAULT_INSTITUTIONAL_SIGNER.name,
    license: signer.license || DEFAULT_INSTITUTIONAL_SIGNER.license || "",
    specialty:
      signer.specialty || DEFAULT_INSTITUTIONAL_SIGNER.specialty || "",
    signatureUrl:
      signer.signatureUrl || DEFAULT_INSTITUTIONAL_SIGNER.signatureUrl || "",
    sealUrl: signer.sealUrl,
    stampText: sanitizeText(signer.stampText) ?? DEFAULT_INSTITUTIONAL_SIGNER.stampText,
  };
};

export const getPresentationModeForSection = (
  section: ReportSignatureSection,
  config?: LaborReportBrandingConfig | null,
  reportType?: string
): LaborReportSignaturePresentationMode => {
  return (
    getPolicyForSection(section, config, reportType).presentationMode ??
    (normalizeSection(section) === "clinical"
      ? "signature_and_text"
      : "signature_seal_and_text")
  );
};

export const buildFallbackStampText = ({
  name,
  specialty,
  license,
}: {
  name?: string | null;
  specialty?: string | null;
  license?: string | null;
}): string => {
  return [name, specialty, license]
    .map((value) => sanitizeText(value))
    .filter((value): value is string => Boolean(value))
    .join("\n");
};

export const resolveStampTextLines = ({
  stampText,
  name,
  specialty,
  license,
}: {
  stampText?: string | null;
  name?: string | null;
  specialty?: string | null;
  license?: string | null;
}): string[] => {
  const resolvedText =
    sanitizeText(stampText) ??
    sanitizeText(
      buildFallbackStampText({
        name,
        specialty,
        license,
      })
    ) ??
    "-";

  return resolvedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};
