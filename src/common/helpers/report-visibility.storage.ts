import {
  ReportSectionKey,
  ReportVisibilityMode,
} from "./report-visibility";

const STORAGE_PREFIX = "preoccupational-report-visibility";
const VALID_MODES: ReportVisibilityMode[] = [
  "automatic",
  "force_show",
  "force_hide",
];
const VALID_KEYS: ReportSectionKey[] = ["genitourinary", "genitourinary_gyn_ob"];

export type StoredReportVisibilityOverrides = Partial<
  Record<ReportSectionKey, ReportVisibilityMode>
>;

const getStorageKey = (medicalEvaluationId: number) =>
  `${STORAGE_PREFIX}:${medicalEvaluationId}`;

export const loadReportVisibilityOverrides = (
  medicalEvaluationId: number
): StoredReportVisibilityOverrides => {
  if (typeof window === "undefined" || medicalEvaluationId <= 0) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(medicalEvaluationId));

    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as Record<string, string>;

    return Object.entries(parsed).reduce<StoredReportVisibilityOverrides>(
      (accumulator, [key, value]) => {
        if (
          VALID_KEYS.includes(key as ReportSectionKey) &&
          VALID_MODES.includes(value as ReportVisibilityMode)
        ) {
          accumulator[key as ReportSectionKey] = value as ReportVisibilityMode;
        }

        return accumulator;
      },
      {}
    );
  } catch {
    return {};
  }
};

export const saveReportVisibilityOverrides = (
  medicalEvaluationId: number,
  overrides: StoredReportVisibilityOverrides
) => {
  if (typeof window === "undefined" || medicalEvaluationId <= 0) {
    return;
  }

  const sanitized = Object.entries(overrides).reduce<StoredReportVisibilityOverrides>(
    (accumulator, [key, value]) => {
      if (
        VALID_KEYS.includes(key as ReportSectionKey) &&
        value &&
        VALID_MODES.includes(value)
      ) {
        accumulator[key as ReportSectionKey] = value;
      }

      return accumulator;
    },
    {}
  );

  if (Object.keys(sanitized).length === 0) {
    window.localStorage.removeItem(getStorageKey(medicalEvaluationId));
    return;
  }

  window.localStorage.setItem(
    getStorageKey(medicalEvaluationId),
    JSON.stringify(sanitized)
  );
};
