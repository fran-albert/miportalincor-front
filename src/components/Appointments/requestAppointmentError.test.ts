import { describe, expect, it } from "vitest";
import { getAppointmentRequestErrorMessage } from "./requestAppointmentError";

describe("getAppointmentRequestErrorMessage", () => {
  it("prioritizes the backend message over the generic error label", () => {
    expect(
      getAppointmentRequestErrorMessage({
        response: {
          data: {
            error: "Bad Request",
            message: "Este horario ya no está disponible.",
          },
        },
      }),
    ).toBe("Este horario ya no está disponible.");
  });

  it("joins validation message arrays", () => {
    expect(
      getAppointmentRequestErrorMessage({
        response: {
          data: {
            error: "Bad Request",
            message: ["doctorId must be an integer number", "hour debe estar en formato HH:mm"],
          },
        },
      }),
    ).toBe("doctorId must be an integer number hour debe estar en formato HH:mm");
  });

  it("falls back to the error field when no message is available", () => {
    expect(
      getAppointmentRequestErrorMessage({
        response: {
          data: {
            error: "No se pudo reservar el turno.",
          },
        },
      }),
    ).toBe("No se pudo reservar el turno.");
  });

  it("uses a default message when the backend response is empty", () => {
    expect(getAppointmentRequestErrorMessage({})).toBe("No pudimos reservar el turno.");
  });
});
