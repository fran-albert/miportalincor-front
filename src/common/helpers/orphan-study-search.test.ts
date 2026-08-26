// ============================================================
// El buscador de la lista "Sin asignar".
//
// El 25/08 había 80 estudios en esa pestaña. La ecografista entra a buscar UNO
// —el que acaba de hacer, con la paciente esperando el informe— y hoy la única
// forma es scrollear a ojo mirando 80 miniaturas.
//
// Busca por lo que tiene a la vista en la tarjeta: el nombre que quedó cargado
// en el equipo y la fecha del estudio. Nada más, porque nada más se ve.
//
// La regla que gobierna el filtro por fecha: si escribe "20/08" TIENE que
// aparecer el estudio cuya tarjeta dice "20/08/2026". Por eso el criterio es
// "subcadena de la fecha tal como se muestra" y no un parseo de fecha: lo que
// se busca es literalmente lo que se ve.
// ============================================================

import { describe, expect, it } from "vitest";
import { filterOrphanStudies } from "./orphan-study-search";
import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

const estudio = (overrides: Partial<OrphanStudy> = {}): OrphanStudy => ({
  sourceInboxItemId: "item-1",
  detectedPatientName: "PERALTA MARTA",
  detectedDni: null,
  studyDate: "2026-08-20T00:00:00.000Z",
  receivedAt: "2026-08-20T11:05:00.000Z",
  studySubtype: null,
  imageCount: 12,
  hasImages: true,
  needsPatient: false,
  ...overrides,
});

const ids = (studies: OrphanStudy[]): string[] =>
  studies.map((study) => study.sourceInboxItemId);

describe("filterOrphanStudies — sin búsqueda", () => {
  it("devuelve la lista entera cuando no se escribió nada", () => {
    const lista = [estudio(), estudio({ sourceInboxItemId: "item-2" })];

    expect(filterOrphanStudies(lista, "")).toEqual(lista);
  });

  it("trata los espacios sueltos como no haber escrito nada", () => {
    const lista = [estudio()];

    expect(filterOrphanStudies(lista, "   ")).toEqual(lista);
  });
});

describe("filterOrphanStudies — por nombre", () => {
  it("encuentra por una parte del apellido", () => {
    const lista = [
      estudio({ sourceInboxItemId: "peralta", detectedPatientName: "PERALTA MARTA" }),
      estudio({ sourceInboxItemId: "gomez", detectedPatientName: "GOMEZ ANA" }),
    ];

    expect(ids(filterOrphanStudies(lista, "peral"))).toEqual(["peralta"]);
  });

  it("encuentra por el nombre, no sólo por el apellido", () => {
    const lista = [
      estudio({ sourceInboxItemId: "marta", detectedPatientName: "PERALTA MARTA" }),
      estudio({ sourceInboxItemId: "ana", detectedPatientName: "GOMEZ ANA" }),
    ];

    expect(ids(filterOrphanStudies(lista, "marta"))).toEqual(["marta"]);
  });

  it("no distingue mayúsculas", () => {
    const lista = [estudio({ detectedPatientName: "PERALTA MARTA" })];

    expect(filterOrphanStudies(lista, "PeRaLtA")).toHaveLength(1);
  });

  // El equipo manda los nombres como vienen: "PEÑA", "MUÑOZ", "GARCÍA". La
  // ecografista escribe en el celular, de pie, con el equipo al lado: no va a
  // pelear con la ñ ni con la tilde.
  it("no distingue acentos ni la ñ", () => {
    const lista = [
      estudio({ sourceInboxItemId: "pena", detectedPatientName: "PEÑA ROSA" }),
      estudio({ sourceInboxItemId: "garcia", detectedPatientName: "GARCÍA LUIS" }),
    ];

    expect(ids(filterOrphanStudies(lista, "pena"))).toEqual(["pena"]);
    expect(ids(filterOrphanStudies(lista, "garcia"))).toEqual(["garcia"]);
  });

  it("encuentra igual si la que busca es la que escribe con acento", () => {
    const lista = [estudio({ detectedPatientName: "GARCIA LUIS" })];

    expect(filterOrphanStudies(lista, "garcía")).toHaveLength(1);
  });

  it("deja afuera al estudio sin nombre cargado en vez de romperse", () => {
    const lista = [
      estudio({ sourceInboxItemId: "sin-nombre", detectedPatientName: null }),
      estudio({ sourceInboxItemId: "con-nombre" }),
    ];

    expect(ids(filterOrphanStudies(lista, "peralta"))).toEqual(["con-nombre"]);
  });
});

describe("filterOrphanStudies — por fecha", () => {
  const lista = [
    estudio({ sourceInboxItemId: "del-20", studyDate: "2026-08-20T00:00:00.000Z" }),
    estudio({ sourceInboxItemId: "del-21", studyDate: "2026-08-21T00:00:00.000Z" }),
    estudio({ sourceInboxItemId: "de-julio", studyDate: "2026-07-20T00:00:00.000Z" }),
  ];

  // El formato que se ve en la tarjeta y el que sale solo al escribir a mano.
  it("encuentra escribiendo día/mes como se ve en la tarjeta", () => {
    expect(ids(filterOrphanStudies(lista, "20/08"))).toEqual(["del-20"]);
  });

  it("acepta el guión, que es como muchas escriben en el teclado del celular", () => {
    expect(ids(filterOrphanStudies(lista, "20-08"))).toEqual(["del-20"]);
  });

  it("acepta la fecha ISO completa", () => {
    expect(ids(filterOrphanStudies(lista, "2026-08-20"))).toEqual(["del-20"]);
  });

  it("acepta la fecha completa como se ve en la tarjeta", () => {
    expect(ids(filterOrphanStudies(lista, "20/08/2026"))).toEqual(["del-20"]);
  });

  // Nadie escribe el cero de adelante cuando escribe rápido.
  it("no exige el cero de adelante", () => {
    expect(ids(filterOrphanStudies(lista, "20/8"))).toEqual(["del-20"]);
  });

  it("acepta el punto como separador", () => {
    expect(ids(filterOrphanStudies(lista, "20.08"))).toEqual(["del-20"]);
  });

  it("busca por mes cuando escribe sólo el mes y el año", () => {
    expect(ids(filterOrphanStudies(lista, "08/2026"))).toEqual([
      "del-20",
      "del-21",
    ]);
  });

  // La fecha del estudio llega a medianoche UTC. Formatearla en hora local
  // (UTC-3) mostraría el día anterior: la tarjeta dice 20/08 y el buscador
  // tendría que encontrarla por 19/08. Es el mismo bug que ya se arregló en
  // la bandeja, y acá lo tiene que respetar el filtro.
  it("usa el mismo día que muestra la tarjeta, sin correrse por la zona horaria", () => {
    const medianocheUtc = [
      estudio({ sourceInboxItemId: "del-24", studyDate: "2026-08-24T00:00:00.000Z" }),
    ];

    expect(ids(filterOrphanStudies(medianocheUtc, "24/08"))).toEqual(["del-24"]);
    expect(filterOrphanStudies(medianocheUtc, "23/08")).toHaveLength(0);
  });

  it("deja afuera al estudio sin fecha en vez de romperse", () => {
    const sinFecha = [
      estudio({ sourceInboxItemId: "sin-fecha", studyDate: null }),
      estudio({ sourceInboxItemId: "con-fecha" }),
    ];

    expect(ids(filterOrphanStudies(sinFecha, "20/08"))).toEqual(["con-fecha"]);
  });
});

describe("filterOrphanStudies — nombre y fecha no se pisan", () => {
  it("un nombre no se interpreta como fecha", () => {
    const lista = [estudio({ detectedPatientName: "PERALTA MARTA" })];

    expect(filterOrphanStudies(lista, "zzz")).toHaveLength(0);
  });

  it("no devuelve nada cuando la búsqueda no coincide con ningún estudio", () => {
    const lista = [
      estudio({ detectedPatientName: "PERALTA MARTA" }),
      estudio({ sourceInboxItemId: "item-2", detectedPatientName: "GOMEZ ANA" }),
    ];

    expect(filterOrphanStudies(lista, "01/01")).toHaveLength(0);
  });
});
