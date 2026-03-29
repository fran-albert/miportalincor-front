export type ReportVisibilityMode = "automatic" | "force_show" | "force_hide";
export type ReportResolvedVisibility = "visible" | "hidden";
export type ReportResolvedPresentation = "full" | "summary" | "hidden";

export type ReportSectionKey = "genitourinary" | "genitourinary_gyn_ob";

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

const normalizeGender = (gender?: string | null): string => {
  if (!gender) return "";

  return gender.trim().toLowerCase();
};

export function resolveReportVisibility({
  sectionKey,
  visibilityMode = "automatic",
  collaboratorGender,
  hasData,
}: ResolveReportVisibilityParams): ReportVisibilityResolution {
  if (visibilityMode === "force_show") {
    return {
      sectionKey,
      visibilityMode,
      resolvedVisibility: "visible",
      resolvedPresentation: "full",
      reason: "force_show",
    };
  }

  if (visibilityMode === "force_hide") {
    return {
      sectionKey,
      visibilityMode,
      resolvedVisibility: "hidden",
      resolvedPresentation: "hidden",
      reason: "force_hide",
    };
  }

  if (!hasData) {
    return {
      sectionKey,
      visibilityMode,
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
      visibilityMode,
      resolvedVisibility: "hidden",
      resolvedPresentation: "hidden",
      reason: "gender_male",
    };
  }

  return {
    sectionKey,
    visibilityMode,
    resolvedVisibility: "visible",
    resolvedPresentation: "full",
    reason: "has_data",
  };
}
