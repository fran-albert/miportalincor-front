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
}

export const DEFAULT_VACCINE_VISUAL: VaccineVisual = {
  icon: Syringe,
  badgeClassName: "bg-teal-100 text-teal-700",
};

const VACCINE_VISUALS: Record<string, VaccineVisual> = {
  bcg: { icon: Wind, badgeClassName: "bg-amber-100 text-amber-700" },
  hepatitis_b: {
    icon: Droplets,
    badgeClassName: "bg-orange-100 text-orange-700",
  },
  hepatitis_a: {
    icon: Droplet,
    badgeClassName: "bg-yellow-100 text-yellow-700",
  },
  neumococo_conjugada: {
    icon: Bug,
    badgeClassName: "bg-green-100 text-green-700",
  },
  rotavirus: { icon: Baby, badgeClassName: "bg-pink-100 text-pink-700" },
  quintuple_pentavalente: {
    icon: ShieldPlus,
    badgeClassName: "bg-indigo-100 text-indigo-700",
  },
  ipv_salk: { icon: Footprints, badgeClassName: "bg-cyan-100 text-cyan-700" },
  meningococo: {
    icon: Brain,
    badgeClassName: "bg-violet-100 text-violet-700",
  },
  gripe: { icon: Thermometer, badgeClassName: "bg-sky-100 text-sky-700" },
  triple_viral: {
    icon: Microscope,
    badgeClassName: "bg-rose-100 text-rose-700",
  },
  varicela: { icon: Sparkles, badgeClassName: "bg-lime-100 text-lime-700" },
  triple_bacteriana_celular: {
    icon: Shield,
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  dtpa: {
    icon: ShieldCheck,
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
  vph: { icon: Dna, badgeClassName: "bg-fuchsia-100 text-fuchsia-700" },
};

export const getVaccineVisual = (code?: string | null): VaccineVisual => {
  const normalizedCode = code?.trim().toLowerCase();
  if (!normalizedCode) return DEFAULT_VACCINE_VISUAL;
  return VACCINE_VISUALS[normalizedCode] ?? DEFAULT_VACCINE_VISUAL;
};
