import { describe, expect, it } from "vitest";
import {
  getAppointmentConsultationTypeChips,
  getAppointmentConsultationTypeSummary,
  getAppointmentConsultationTypes,
} from "@/common/helpers/appointment-consultation-types";
import {
  ConsultationTypeBasicDto,
  publicNameOf,
} from "@/types/Appointment/Appointment";

const type = (
  id: number,
  name: string,
  extra: Partial<ConsultationTypeBasicDto> = {},
): ConsultationTypeBasicDto => ({ id, name, ...extra });

const ERGOMETRIA = type(1, "Ergometría");
const ECOCARDIOGRAMA = type(2, "Ecocardiograma Doppler Color", {
  color: "#0ea5e9",
});
const DOPPLER_CUELLO = type(3, "Doppler de Vasos de Cuello");
const ELECTROCARDIOGRAMA = type(4, "Electrocardiograma");

// Los subtipos de eco tienen nombre real distinto y el MISMO nombre público:
// a la paciente no se le dice cuál es (lo indica la médica).
const ECO_MAMARIA = type(10, "Ecografía Mamaria", { publicName: "Ecografía" });
const ECO_TRANSVAGINAL = type(11, "Ecografía Transvaginal", {
  publicName: "Ecografía",
});

describe("getAppointmentConsultationTypeChips", () => {
  it("un turno de un solo tipo da un chip con ese nombre (no-regresión del 93%)", () => {
    expect(
      getAppointmentConsultationTypeChips({
        consultationTypes: [ERGOMETRIA],
      }),
    ).toEqual([{ id: 1, label: "Ergometría", color: undefined }]);
  });

  it("un turno sin tipos no da ningún chip", () => {
    expect(getAppointmentConsultationTypeChips({})).toEqual([]);
    expect(getAppointmentConsultationTypeChips(null)).toEqual([]);
  });

  it("un turno de dos tipos da un chip por estudio, sin +N", () => {
    const chips = getAppointmentConsultationTypeChips({
      consultationTypes: [ECOCARDIOGRAMA, ERGOMETRIA],
    });

    expect(chips.map((chip) => chip.label)).toEqual([
      "Ecocardiograma Doppler Color",
      "Ergometría",
    ]);
  });

  it("un turno de tres tipos da tres chips", () => {
    const chips = getAppointmentConsultationTypeChips({
      consultationTypes: [ECOCARDIOGRAMA, DOPPLER_CUELLO, ERGOMETRIA],
    });

    expect(chips).toHaveLength(3);
    expect(chips.map((chip) => chip.label)).toEqual([
      "Ecocardiograma Doppler Color",
      "Doppler de Vasos de Cuello",
      "Ergometría",
    ]);
  });

  it("un turno de cuatro tipos da cuatro chips", () => {
    const chips = getAppointmentConsultationTypeChips({
      consultationTypes: [
        ECOCARDIOGRAMA,
        DOPPLER_CUELLO,
        ELECTROCARDIOGRAMA,
        ERGOMETRIA,
      ],
    });

    expect(chips.map((chip) => chip.label)).toEqual([
      "Ecocardiograma Doppler Color",
      "Doppler de Vasos de Cuello",
      "Electrocardiograma",
      "Ergometría",
    ]);
  });

  it("conserva el color del tipo para pintar el chip", () => {
    const [chip] = getAppointmentConsultationTypeChips({
      consultationTypes: [ECOCARDIOGRAMA],
    });

    expect(chip.color).toBe("#0ea5e9");
  });

  it("cae al tipo singular cuando el turno no trae el array", () => {
    expect(
      getAppointmentConsultationTypeChips({
        consultationType: ERGOMETRIA,
      }).map((chip) => chip.label),
    ).toEqual(["Ergometría"]);
  });

  it("con nombre público muestra 'Ecografía' y no el subtipo real", () => {
    const chips = getAppointmentConsultationTypeChips(
      { consultationTypes: [ECO_MAMARIA] },
      publicNameOf,
    );

    expect(chips.map((chip) => chip.label)).toEqual(["Ecografía"]);
  });

  it("dos subtipos de eco con el mismo nombre público dan UN solo chip", () => {
    const chips = getAppointmentConsultationTypeChips(
      { consultationTypes: [ECO_MAMARIA, ECO_TRANSVAGINAL] },
      publicNameOf,
    );

    expect(chips.map((chip) => chip.label)).toEqual(["Ecografía"]);
  });

  it("esos mismos dos subtipos dan DOS chips con el nombre real", () => {
    const chips = getAppointmentConsultationTypeChips({
      consultationTypes: [ECO_MAMARIA, ECO_TRANSVAGINAL],
    });

    expect(chips.map((chip) => chip.label)).toEqual([
      "Ecografía Mamaria",
      "Ecografía Transvaginal",
    ]);
  });

  it("descarta etiquetas vacías", () => {
    const chips = getAppointmentConsultationTypeChips({
      consultationTypes: [type(20, "   "), ERGOMETRIA],
    });

    expect(chips.map((chip) => chip.label)).toEqual(["Ergometría"]);
  });
});

describe("getAppointmentConsultationTypeSummary", () => {
  it("un solo tipo se sigue leyendo exactamente igual que hoy", () => {
    expect(
      getAppointmentConsultationTypeSummary({
        consultationTypes: [ERGOMETRIA],
      }),
    ).toBe("Ergometría");
  });

  it("sin tipos devuelve null", () => {
    expect(getAppointmentConsultationTypeSummary({})).toBeNull();
  });

  it("dos tipos se nombran los dos, sin +1", () => {
    const summary = getAppointmentConsultationTypeSummary({
      consultationTypes: [ECOCARDIOGRAMA, ERGOMETRIA],
    });

    expect(summary).toBe("Ecocardiograma Doppler Color · Ergometría");
    expect(summary).not.toMatch(/\+\d/);
  });

  it("cuatro tipos se nombran los cuatro", () => {
    const summary = getAppointmentConsultationTypeSummary({
      consultationTypes: [
        ECOCARDIOGRAMA,
        DOPPLER_CUELLO,
        ELECTROCARDIOGRAMA,
        ERGOMETRIA,
      ],
    });

    expect(summary).toBe(
      "Ecocardiograma Doppler Color · Doppler de Vasos de Cuello · Electrocardiograma · Ergometría",
    );
    expect(summary).not.toMatch(/\+\d/);
  });

  it("acepta un nombrador para las pantallas de paciente", () => {
    expect(
      getAppointmentConsultationTypeSummary(
        { consultationTypes: [ECO_MAMARIA, ECO_TRANSVAGINAL] },
        publicNameOf,
      ),
    ).toBe("Ecografía");
  });
});

describe("getAppointmentConsultationTypes", () => {
  it("sigue deduplicando por id y devolviendo los tipos completos", () => {
    expect(
      getAppointmentConsultationTypes({
        consultationTypes: [ERGOMETRIA, ERGOMETRIA, ECOCARDIOGRAMA],
      }),
    ).toEqual([ERGOMETRIA, ECOCARDIOGRAMA]);
  });
});
