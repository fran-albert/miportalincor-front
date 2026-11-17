export type SpecialConsultationTypeKind = "MAPA" | "HOLTER" | "AMPA";

export interface SpecialConsultationTypeInfo {
  kind: SpecialConsultationTypeKind;
  label: string;
  badgeClassName: string;
  markerClassName: string;
  eventBackgroundColor: string;
  eventTextColor: string;
  eventBorderColor: string;
}

const SPECIAL_CONSULTATION_TYPES: Record<
  SpecialConsultationTypeKind,
  SpecialConsultationTypeInfo
> = {
  MAPA: {
    kind: "MAPA",
    label: "MAPA",
    badgeClassName:
      "border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-sm",
    markerClassName: "is-special-mapa",
    eventBackgroundColor: "#dbeafe",
    eventTextColor: "#1e3a8a",
    eventBorderColor: "#2563eb",
  },
  HOLTER: {
    kind: "HOLTER",
    label: "HOLTER",
    badgeClassName:
      "border-violet-500 bg-violet-50 text-violet-800 font-bold shadow-sm",
    markerClassName: "is-special-holter",
    eventBackgroundColor: "#ede9fe",
    eventTextColor: "#4c1d95",
    eventBorderColor: "#7c3aed",
  },
  AMPA: {
    kind: "AMPA",
    label: "AMPA",
    badgeClassName:
      "border-green-600 bg-green-50 text-green-800 font-bold shadow-sm",
    markerClassName: "is-special-ampa",
    eventBackgroundColor: "#dcfce7",
    eventTextColor: "#14532d",
    eventBorderColor: "#16a34a",
  },
};

const normalizeConsultationTypeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const getSpecialConsultationTypeInfo = (
  name?: string | null,
): SpecialConsultationTypeInfo | null => {
  if (!name) return null;

  const normalized = normalizeConsultationTypeName(name);

  if (
    normalized.includes("mapa") ||
    normalized.includes("monitoreoambulatoriodepresion")
  ) {
    return SPECIAL_CONSULTATION_TYPES.MAPA;
  }

  if (normalized.includes("holter")) {
    return SPECIAL_CONSULTATION_TYPES.HOLTER;
  }

  if (
    /^ampa(?![a-z])/.test(normalized) ||
    normalized.includes("automonitoreo")
  ) {
    return SPECIAL_CONSULTATION_TYPES.AMPA;
  }

  return null;
};

export const getSpecialConsultationTypeFromNames = (
  names: Array<string | null | undefined>,
): SpecialConsultationTypeInfo | null => {
  for (const name of names) {
    const info = getSpecialConsultationTypeInfo(name);
    if (info) return info;
  }

  return null;
};
