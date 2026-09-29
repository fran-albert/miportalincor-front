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
      className="pointer-events-none absolute right-5 top-1/2 hidden h-20 w-36 -translate-y-1/2 md:block lg:right-8"
    >
      <Leaf className="absolute bottom-0 left-10 h-7 w-7 -rotate-12 text-teal-100" />
      <Leaf className="absolute bottom-0 right-0 h-8 w-8 rotate-12 text-teal-100" />
      <span className="absolute bottom-1 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
        <CalendarCheck className="h-5 w-5 text-teal-600" />
      </span>
      <ShieldPlus
        className="absolute right-10 top-1 h-12 w-12 fill-white text-greenPrimary"
        strokeWidth={1.5}
      />
      <Syringe
        className="absolute right-1 top-0 h-10 w-10 text-teal-600"
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
    <header className="relative overflow-hidden bg-white px-5 pb-5 pt-6 sm:px-7">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-greenPrimary"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 md:pr-44">
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
          className="hidden h-14 w-px bg-slate-200 sm:block"
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
