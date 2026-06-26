export type ReportVisibilityMode = "automatic" | "force_show" | "force_hide";
export type ReportResolvedVisibility = "visible" | "hidden";
export type ReportResolvedPresentation = "full" | "summary" | "hidden";

export type ReportSectionKey = "genitourinary" | "genitourinary_gyn_ob";
export type ReportVisibilityOverrides = Partial<
  Record<ReportSectionKey, ReportVisibilityMode>
>;

const MANUAL_REPORT_VISIBILITY_SECTION_KEYS: ReportSectionKey[] = [
  "genitourinary",
];

export interface ReportVisibilityResolution {
  sectionKey: ReportSectionKey;
  visibilityMode: ReportVisibilityMode;
  resolvedVisibility: ReportResolvedVisibility;
  resolvedPresentation: ReportResolvedPresentation;
  reason:
    | "force_show"
    | "force_hide"
    | "gender_male"
    | "has_data"
    | "empty_section";
}

interface ResolveReportVisibilityParams {
  sectionKey: ReportSectionKey;
  visibilityMode?: ReportVisibilityMode;
  collaboratorGender?: string | null;
  hasData: boolean;
}

export function normalizeReportVisibilityOverrides(
  overrides?: ReportVisibilityOverrides | null
): ReportVisibilityOverrides {
  if (!overrides) return {};

  return MANUAL_REPORT_VISIBILITY_SECTION_KEYS.reduce<
    ReportVisibilityOverrides
  >((acc, key) => {
    const value = overrides[key];

    if (value && value !== "automatic") {
      acc[key] = value;
    }

    return acc;
  }, {});
}

export const normalizeGender = (gender?: string | null): string => {
  if (!gender) return "";

  return gender.trim().toLowerCase();
};

// Los datos gineco-obstétricos (FUM, partos, cesárea, embarazos) no aplican a
// colaboradores de sexo masculino. Mismo criterio que usa el informe/PDF.
export const isGynObApplicable = (gender?: string | null): boolean =>
  normalizeGender(gender) !== "masculino";

export function resolveReportVisibility({
  sectionKey,
  visibilityMode = "automatic",
  collaboratorGender,
  hasData,
}: ResolveReportVisibilityParams): ReportVisibilityResolution {
  const effectiveVisibilityMode =
    sectionKey === "genitourinary_gyn_ob" ? "automatic" : visibilityMode;

  if (effectiveVisibilityMode === "force_show") {
    return {
      sectionKey,
      visibilityMode: effectiveVisibilityMode,
      resolvedVisibility: "visible",
      resolvedPresentation: "full",
      reason: "force_show",
    };
  }

  if (effectiveVisibilityMode === "force_hide") {
    return {
      sectionKey,
      visibilityMode: effectiveVisibilityMode,
      resolvedVisibility: "hidden",
      resolvedPresentation: "hidden",
      reason: "force_hide",
    };
  }

  if (!hasData) {
    return {
      sectionKey,
      visibilityMode: effectiveVisibilityMode,
      resolvedVisibility: "hidden",
      resolvedPresentation: "hidden",
      reason: "empty_section",
    };
  }

  if (
    sectionKey === "genitourinary_gyn_ob" &&
    normalizeGender(collaboratorGender) === "masculino"
  ) {
    return {
      sectionKey,
      visibilityMode: effectiveVisibilityMode,
      resolvedVisibility: "hidden",
      resolvedPresentation: "hidden",
      reason: "gender_male",
    };
  }

  return {
    sectionKey,
    visibilityMode: effectiveVisibilityMode,
    resolvedVisibility: "visible",
    resolvedPresentation: "full",
    reason: "has_data",
  };
}
