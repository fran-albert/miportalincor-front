import { describe, expect, it } from "vitest";

import { doctorOffersIntegralCheckup } from "./integral-checkup-offer";

/**
 * 🔴 La invariante de este archivo: **el front no sabe quién es la
 * ginecóloga**. Lo pregunta.
 *
 * Quién ofrece el control es config de instancia —hoy Tudela, en otra clínica
 * sería otra— y vive en el backend. Acá solo se compara el médico que eligió
 * la secretaria contra lo que el servidor contestó. Por eso ninguno de estos
 * tests tiene un id "correcto" cableado: el id correcto es el que manda el
 * servidor, cualquiera sea.
 */
describe("doctorOffersIntegralCheckup", () => {
  const config = { consultationDoctorId: 388, ultrasoundDoctorId: 176 };

  it("dice que sí cuando el médico elegido es el que manda el backend", () => {
    expect(doctorOffersIntegralCheckup(config, 388)).toBe(true);
  });

  it("dice que no con cualquier otro médico", () => {
    expect(doctorOffersIntegralCheckup(config, 12)).toBe(false);
  });

  it("sigue al backend si mañana la ginecóloga es otra", () => {
    // El mismo front, otra instancia: la respuesta cambia sin tocar código.
    expect(doctorOffersIntegralCheckup({ ...config, consultationDoctorId: 77 }, 77)).toBe(
      true,
    );
    expect(doctorOffersIntegralCheckup({ ...config, consultationDoctorId: 77 }, 388)).toBe(
      false,
    );
  });

  it("la ecografista sola no ofrece el control: el control se da desde la consulta", () => {
    expect(doctorOffersIntegralCheckup(config, 176)).toBe(false);
  });

  it("dice que no mientras no haya médico elegido", () => {
    expect(doctorOffersIntegralCheckup(config, undefined)).toBe(false);
  });

  it("dice que no mientras el backend no contestó", () => {
    // Sin respuesta no hay afirmación: la modalidad no aparece "por las dudas".
    expect(doctorOffersIntegralCheckup(undefined, 388)).toBe(false);
  });
});
