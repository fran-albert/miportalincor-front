import { CalendarCheck, Leaf, ShieldPlus, Syringe } from "lucide-react";

import type { VaccinationPatientInfo } from "@/types/Vaccination/Vaccination";

export const INCOR_LOGO_URL =
  "https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png";

interface VaccinationCardHeaderProps {
  titleId: string;
  patient?: VaccinationPatientInfo;
}

function HeaderIllustration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 hidden h-28 w-48 -translate-y-1/2 md:block lg:right-8"
    >
      <div className="absolute right-10 top-0 h-24 w-24 rounded-full bg-teal-100/80" />
      <Leaf className="absolute bottom-0 left-12 h-9 w-9 -rotate-12 text-teal-200" />
      <Leaf className="absolute bottom-1 right-0 h-10 w-10 rotate-12 text-teal-200" />
      <span className="absolute bottom-2 left-0 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-teal-100">
        <CalendarCheck className="h-7 w-7 text-teal-600" />
      </span>
      <ShieldPlus
        className="absolute right-[3.25rem] top-3 h-16 w-16 fill-white text-teal-600"
        strokeWidth={1.5}
      />
      <Syringe
        className="absolute right-2 top-0 h-14 w-14 text-teal-500"
        strokeWidth={1.5}
      />
    </div>
  );
}

export function VaccinationCardHeader({
  titleId,
  patient,
}: VaccinationCardHeaderProps) {
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`.trim()
    : "";

  return (
    <header className="relative overflow-hidden px-5 pb-6 pt-5 sm:px-7 sm:pt-6">
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-10 w-full text-teal-100/70"
      >
        <path
          d="M0 38 C 220 8 420 60 700 30 C 900 10 1050 22 1200 12 L1200 60 L0 60 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 md:pr-52">
        <div className="flex items-center gap-2">
          <img
            src={INCOR_LOGO_URL}
            alt="Incor Centro Médico"
            className="h-12 w-auto"
          />
          <div aria-hidden="true" className="leading-none">
            <p className="text-2xl font-bold tracking-tight text-greenPrimary">
              INCOR
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-teal-700">
              Centro Médico
            </p>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden h-14 w-px bg-teal-200 sm:block"
        />

        <div className="min-w-0">
          <h2
            id={titleId}
            className="text-2xl font-bold leading-tight text-greenPrimary sm:text-3xl"
          >
            Carnet de vacunación
          </h2>
          {patientName && (
            <p className="mt-1 break-words text-base font-medium uppercase tracking-wide text-slate-600 sm:text-lg">
              {patientName}
            </p>
          )}
        </div>
      </div>

      <HeaderIllustration />
    </header>
  );
}
