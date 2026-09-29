import {
  Baby,
  Brain,
  Bug,
  Dna,
  Droplet,
  Droplets,
  Footprints,
  Microscope,
  Shield,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  Syringe,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

export interface VaccineVisual {
  icon: LucideIcon;
  /** Fondo + color del icono redondo. Siempre va acompanado del nombre. */
  badgeClassName: string;
  /** Aclaracion bien escrita; la de la base viene sin tildes. */
  description?: string;
}

export const DEFAULT_VACCINE_VISUAL: VaccineVisual = {
  icon: Syringe,
  badgeClassName: "bg-teal-100 text-teal-700",
};

const VACCINE_VISUALS: Record<string, VaccineVisual> = {
  bcg: { icon: Wind, badgeClassName: "bg-amber-100 text-amber-700",
    description: "Tuberculosis",
  },
  hepatitis_b: {
    icon: Droplets,
    badgeClassName: "bg-orange-100 text-orange-700",
    description: "Hepatitis B",
  },
  hepatitis_a: {
    icon: Droplet,
    badgeClassName: "bg-yellow-100 text-yellow-700",
    description: "Hepatitis A",
  },
  neumococo_conjugada: {
    icon: Bug,
    badgeClassName: "bg-green-100 text-green-700",
    description: "Enfermedad neumocócica",
  },
  rotavirus: { icon: Baby, badgeClassName: "bg-pink-100 text-pink-700",
    description: "Rotavirus",
  },
  quintuple_pentavalente: {
    icon: ShieldPlus,
    badgeClassName: "bg-indigo-100 text-indigo-700",
    description: "Difteria, tétanos, tos convulsa, Hib y hepatitis B",
  },
  ipv_salk: { icon: Footprints, badgeClassName: "bg-cyan-100 text-cyan-700",
    description: "Poliomielitis",
  },
  meningococo: {
    icon: Brain,
    badgeClassName: "bg-violet-100 text-violet-700",
    description: "Enfermedad meningocócica",
  },
  gripe: { icon: Thermometer, badgeClassName: "bg-sky-100 text-sky-700",
    description: "Influenza",
  },
  triple_viral: {
    icon: Microscope,
    badgeClassName: "bg-rose-100 text-rose-700",
    description: "Sarampión, rubéola y paperas",
  },
  varicela: { icon: Sparkles, badgeClassName: "bg-lime-100 text-lime-700",
    description: "Varicela",
  },
  triple_bacteriana_celular: {
    icon: Shield,
    badgeClassName: "bg-blue-100 text-blue-700",
    description: "Difteria, tétanos y tos convulsa",
  },
  dtpa: {
    icon: ShieldCheck,
    badgeClassName: "bg-emerald-100 text-emerald-700",
    description: "Difteria, tétanos y tos convulsa (acelular)",
  },
  vph: { icon: Dna, badgeClassName: "bg-fuchsia-100 text-fuchsia-700",
    description: "Virus del papiloma humano",
  },
};

export const getVaccineVisual = (code?: string | null): VaccineVisual => {
  const normalizedCode = code?.trim().toLowerCase();
  if (!normalizedCode) return DEFAULT_VACCINE_VISUAL;
  return VACCINE_VISUALS[normalizedCode] ?? DEFAULT_VACCINE_VISUAL;
};

export const getVaccineDescription = (
  code: string | null | undefined,
  apiDescription: string | undefined
): string | undefined => getVaccineVisual(code).description ?? apiDescription;

const DOSE_LABELS: Record<string, string> = {
  "Unica dosis": "Única dosis",
  "11 anios": "11 años",
  "1ra dosis pediatrica": "1ra dosis pediátrica",
  "2da dosis pediatrica si corresponde": "2da dosis pediátrica",
};

// Solo corrige las etiquetas conocidas del catalogo; el resto se muestra tal cual.
export const formatDoseLabel = (doseLabel: string): string =>
  DOSE_LABELS[doseLabel.trim()] ?? doseLabel;
