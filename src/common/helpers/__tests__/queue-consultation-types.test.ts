import { describe, expect, it } from "vitest";
import { getQueueEntryConsultationTypeLabels } from "@/common/helpers/queue-consultation-types";
import type { QueueEntry } from "@/types/Queue";

const entry = (overrides: Partial<QueueEntry>): QueueEntry =>
  ({
    id: 1,
    appointmentId: 900,
    appointmentType: "SCHEDULED_APPOINTMENT",
    patientId: 42,
    patientName: "RISSO, RUBEN",
    patientDocument: "20123456",
    isGuest: false,
    doctorId: 388,
    doctorName: "Dr. Perez",
    scheduledTime: "10:40",
    status: "WAITING",
    displayNumber: "A-01",
    queueNumber: 1,
    queuePrefix: "A",
    checkedInAt: "2026-08-20T13:30:00.000Z",
    ...overrides,
  }) as QueueEntry;

describe("getQueueEntryConsultationTypeLabels", () => {
  it("usa el array plural que ya manda el backend, no el singular", () => {
    expect(
      getQueueEntryConsultationTypeLabels(
        entry({
          consultationTypeName: "Ergometría",
          consultationTypeNames: ["Ecocardiograma Doppler Color", "Ergometría"],
        }),
      ),
    ).toEqual(["Ecocardiograma Doppler Color", "Ergometría"]);
  });

  it("un turno de un solo tipo se lee igual que hoy", () => {
    expect(
      getQueueEntryConsultationTypeLabels(
        entry({
          consultationTypeName: "Ergometría",
          consultationTypeNames: ["Ergometría"],
        }),
      ),
    ).toEqual(["Ergometría"]);
  });

  it("cae al singular cuando la cola no trae el plural", () => {
    expect(
      getQueueEntryConsultationTypeLabels(
        entry({ consultationTypeName: "Ergometría" }),
      ),
    ).toEqual(["Ergometría"]);
  });

  it("toma los tipos como objetos cuando vienen así", () => {
    expect(
      getQueueEntryConsultationTypeLabels(
        entry({
          consultationTypes: [
            { id: 2, name: "Ecografía Mamaria" },
            "Ecografía Transvaginal",
          ],
        }),
      ),
    ).toEqual(["Ecografía Mamaria", "Ecografía Transvaginal"]);
  });

  it("no repite un tipo que llega por dos caminos", () => {
    expect(
      getQueueEntryConsultationTypeLabels(
        entry({
          consultationTypeNames: ["Ergometría"],
          consultationType: { id: 1, name: "Ergometría" },
          consultationTypeName: "Ergometría",
        }),
      ),
    ).toEqual(["Ergometría"]);
  });

  it("una entrada sin tipos no devuelve etiquetas", () => {
    expect(getQueueEntryConsultationTypeLabels(entry({}))).toEqual([]);
  });

  it("descarta los vacíos y el '0' que manda la cola cuando no hay tipo", () => {
    expect(
      getQueueEntryConsultationTypeLabels(
        entry({ consultationTypeNames: ["", "  ", "0"] }),
      ),
    ).toEqual([]);
  });
});
