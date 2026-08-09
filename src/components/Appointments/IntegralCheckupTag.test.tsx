import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegralCheckupTag } from "./IntegralCheckupTag";
import { eventColorsFromCatalogColor } from "@/common/helpers/integral-checkup-style";
import { INTEGRAL_CHECKUP_FALLBACK_COLOR } from "@/common/constants/integral-checkup";
import type { IntegralCheckupLink } from "@/types/Appointment/Appointment";

/** Lo que ve la ecografista: su eco, compartida con la ginecóloga. */
const seenFromUltrasound: IntegralCheckupLink = {
  role: "ULTRASOUND",
  counterpartType: "APPOINTMENT",
  counterpartId: 9539,
  counterpartDoctorId: 388,
  counterpartDoctorFirstName: "Victoria",
  counterpartDoctorLastName: "Tudela",
  counterpartDate: "2026-09-09",
  counterpartHour: "10:20",
  counterpartDescription: "Control Ginecológico Integral",
  color: "#D946EF",
};

describe("IntegralCheckupTag", () => {
  it("dice que es un control integral", () => {
    render(<IntegralCheckupTag link={seenFromUltrasound} />);

    expect(screen.getByText(/control integral/i)).toBeInTheDocument();
  });

  it("🔴 dice con qué colega y a qué hora está compartido", () => {
    render(<IntegralCheckupTag link={seenFromUltrasound} />);

    expect(
      screen.getByText(/compartido con Dra\. Victoria Tudela · 10:20 hs/i),
    ).toBeInTheDocument();
  });

  it("se puede mostrar sin la contraparte cuando no hay lugar", () => {
    render(
      <IntegralCheckupTag link={seenFromUltrasound} showCounterpart={false} />,
    );

    expect(screen.getByText(/control integral/i)).toBeInTheDocument();
    expect(screen.queryByText(/compartido con/i)).not.toBeInTheDocument();
  });

  it("no rompe si el backend no mandó el nombre de la colega", () => {
    render(
      <IntegralCheckupTag
        link={{
          ...seenFromUltrasound,
          counterpartDoctorFirstName: undefined,
          counterpartDoctorLastName: undefined,
        }}
      />,
    );

    expect(
      screen.getByText(/compartido con la otra profesional/i),
    ).toBeInTheDocument();
  });

  it("🔴 el color sale del catálogo, no de un hex escrito acá", () => {
    const { container } = render(
      <IntegralCheckupTag link={{ ...seenFromUltrasound, color: "#123456" }} />,
    );
    const badge = container.querySelector("[style]") as HTMLElement;

    const expected = eventColorsFromCatalogColor("#123456");
    expect(badge.style.borderColor).toBeTruthy();
    expect(badge.style.backgroundColor).toBe(
      hexToRgb(expected.backgroundColor),
    );
  });

  it("si el backend no manda color, usa el fallback y no queda sin marcar", () => {
    const { container } = render(
      <IntegralCheckupTag link={{ ...seenFromUltrasound, color: undefined }} />,
    );
    const badge = container.querySelector("[style]") as HTMLElement;

    expect(badge.style.backgroundColor).toBe(
      hexToRgb(
        eventColorsFromCatalogColor(INTEGRAL_CHECKUP_FALLBACK_COLOR)
          .backgroundColor,
      ),
    );
  });
});

/** jsdom normaliza los colores inline a rgb(). */
const hexToRgb = (hex: string): string => {
  const normalized = hex.replace(/^#/, "");
  const channel = (start: number): number =>
    parseInt(normalized.slice(start, start + 2), 16);
  return `rgb(${channel(0)}, ${channel(2)}, ${channel(4)})`;
};
