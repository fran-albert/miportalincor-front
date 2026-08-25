// @vitest-environment jsdom
// ============================================================
// La lista de estudios sin dueño.
//
// El 24/08 Andrea Torri hizo una eco un día sin agenda abierta: el estudio
// llegó del ecógrafo sin AccessionNumber y no apareció en su cola. Había 88
// así. Esta lista existe para que reconozca el suyo y lo reclame sola, sin
// depender de que alguien lo rescate con SQL.
//
// Lo que tiene que estar en pantalla es lo que le permite reconocerlo: cuándo
// se hizo, qué nombre quedó cargado en el equipo y cuántas imágenes tiene.
// ============================================================

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { OrphanStudiesList } from "./OrphanStudiesList";
import type { OrphanStudy } from "@/types/StudyReport/StudyReport.types";

const getOrphanStudyImages = vi.fn();
const getOrphanStudyImagePreview = vi.fn();

vi.mock("@/api/StudyReport/study-report.actions", () => ({
  getOrphanStudyImages: (id: string) => getOrphanStudyImages(id) as unknown,
  getOrphanStudyImagePreview: (id: string, instanceId: string) =>
    getOrphanStudyImagePreview(id, instanceId) as unknown,
}));

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:orphan-thumb");
  URL.revokeObjectURL = vi.fn();
});

// ------------------------------------------------------------
// jsdom no trae IntersectionObserver y la lista lo usa para bajar sólo las
// miniaturas que la ecografista tiene a la vista. Este doble es la API del
// navegador, no código nuestro: por defecto reporta todo como visible (que es
// lo que ve un test de una sola tarjeta) y el test de scroll lo maneja a mano.
// ------------------------------------------------------------
interface ObservacionEnCurso {
  elemento: Element;
  callback: IntersectionObserverCallback;
  observador: IntersectionObserver;
}

let observaciones: ObservacionEnCurso[] = [];
let visibleAlObservar = true;

class IntersectionObserverDoble {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: number[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(elemento: Element): void {
    const observacion: ObservacionEnCurso = {
      elemento,
      callback: this.callback,
      observador: this as unknown as IntersectionObserver,
    };
    observaciones.push(observacion);
    if (visibleAlObservar) mostrar(observacion);
  }

  unobserve(): void {}

  disconnect(): void {
    observaciones = observaciones.filter(
      (observacion) => observacion.observador !== (this as unknown),
    );
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const mostrar = (observacion: ObservacionEnCurso): void => {
  observacion.callback(
    [
      {
        isIntersecting: true,
        target: observacion.elemento,
      } as IntersectionObserverEntry,
    ],
    observacion.observador,
  );
};

/** Simula que la ecografista scrolleó hasta esas tarjetas. */
const scrollearHasta = (cantidad: number): void => {
  act(() => {
    observaciones.slice(0, cantidad).forEach(mostrar);
  });
};

beforeEach(() => {
  observaciones = [];
  visibleAlObservar = true;
  vi.stubGlobal("IntersectionObserver", IntersectionObserverDoble);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const huerfano = (overrides: Partial<OrphanStudy> = {}): OrphanStudy => ({
  sourceInboxItemId: "item-1",
  detectedPatientName: "MP",
  detectedDni: null,
  studyDate: "2026-08-24T00:00:00.000Z",
  receivedAt: "2026-08-24T11:05:00.000Z",
  studySubtype: null,
  imageCount: 12,
  hasImages: true,
  needsPatient: true,
  ...overrides,
});

/**
 * Un QueryClient nuevo por test: las miniaturas se cachean, así que
 * compartirlo haría que un test viera la miniatura que bajó el anterior.
 */
const renderList = (props: {
  studies: OrphanStudy[];
  isLoading?: boolean;
  onClaim?: (study: OrphanStudy) => void;
}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <OrphanStudiesList
        studies={props.studies}
        isLoading={props.isLoading ?? false}
        onClaim={props.onClaim ?? vi.fn()}
      />
    </QueryClientProvider>,
  );
};

describe("OrphanStudiesList", () => {
  it("muestra los datos con los que la ecografista reconoce el estudio suyo", () => {
    renderList({ studies: [huerfano()], onClaim: vi.fn() });

    expect(screen.getByText("24/08/2026")).toBeInTheDocument();
    expect(screen.getByText("MP")).toBeInTheDocument();
    expect(screen.getByText(/12 imágenes/)).toBeInTheDocument();
  });

  // ------------------------------------------------------------
  // El cartel decía "Sin paciente identificado" JUSTO DEBAJO del nombre de la
  // paciente. Francisco lo miró en producción y preguntó "pero ese no es el
  // paciente?? qué onda": la paciente existía y el cartel parecía decir que
  // no. Lo que pasa es que el nombre no coincidió con el padrón, y lo que hay
  // que hacer es elegir a la persona al reclamar el estudio.
  // ------------------------------------------------------------
  it("dice que el nombre no coincidió con el padrón, no que no haya paciente", () => {
    renderList({ studies: [huerfano()], onClaim: vi.fn() });

    expect(screen.getByText(/No coincide con el padrón/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Sin paciente identificado/i),
    ).not.toBeInTheDocument();
  });

  it("dice qué tiene que hacer la ecografista con ese estudio", () => {
    renderList({ studies: [huerfano()], onClaim: vi.fn() });

    expect(screen.getByText(/elegilo al reclamar/i)).toBeInTheDocument();
  });

  it("muestra el nombre detectado cuando el equipo lo trajo completo", () => {
    renderList({ studies: [
          huerfano({
            detectedPatientName: "PERALTA MARTA",
            needsPatient: false,
          }),
        ], onClaim: vi.fn() });

    expect(screen.getByText("PERALTA MARTA")).toBeInTheDocument();
    expect(
      screen.queryByText(/No coincide con el padrón/i),
    ).not.toBeInTheDocument();
  });

  it("reclama el estudio que la médica eligió", async () => {
    const onClaim = vi.fn();
    const user = userEvent.setup();
    renderList({ studies: [huerfano()], onClaim: onClaim });

    await user.click(screen.getByRole("button", { name: /Es mío/i }));

    expect(onClaim).toHaveBeenCalledWith(
      expect.objectContaining({ sourceInboxItemId: "item-1" }),
    );
  });

  it("dice que no hay nada cuando la lista está vacía", () => {
    renderList({ studies: [] });

    expect(screen.getByText(/No hay estudios sin dueño/i)).toBeInTheDocument();
  });

  it("baja la miniatura del PACS para el estudio que tiene imágenes", async () => {
    getOrphanStudyImages.mockResolvedValue(["inst-1", "inst-2"]);
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    renderList({ studies: [huerfano()], onClaim: vi.fn() });

    await waitFor(() =>
      expect(getOrphanStudyImages).toHaveBeenCalledWith("item-1"),
    );
    // Una sola miniatura por tarjeta: la lista puede tener decenas de estudios
    // y bajar todas las imágenes de cada uno la dejaría inusable en el celular.
    await waitFor(() =>
      expect(getOrphanStudyImagePreview).toHaveBeenCalledTimes(1),
    );
    expect(getOrphanStudyImagePreview).toHaveBeenCalledWith("item-1", "inst-1");
  });

  it("no sale a buscar imágenes de un estudio que no las tiene", async () => {
    renderList({ studies: [huerfano({ hasImages: false, imageCount: 0 })], onClaim: vi.fn() });

    await waitFor(() => expect(screen.getByText("MP")).toBeInTheDocument());
    expect(getOrphanStudyImages).not.toHaveBeenCalled();
  });
});

// ============================================================
// La avalancha de pedidos.
//
// El 25/08 había 80 estudios sin dueño. Cada tarjeta pide dos cosas (las
// instancias del PACS y el preview de la primera): 160 pedidos simultáneos.
// El navegador encola, varios se caen por timeout y la tarjeta queda con el
// icono de "sin vista previa".
//
// La miniatura NO se puede sacar del listado: es lo único con lo que la
// ecografista reconoce su estudio. Lo que se saca es el pedido de lo que no
// está en pantalla.
// ============================================================
describe("OrphanStudiesList — no baja las 80 miniaturas de una", () => {
  const lista = (cantidad: number): OrphanStudy[] =>
    Array.from({ length: cantidad }, (_, indice) =>
      huerfano({ sourceInboxItemId: `item-${indice + 1}` }),
    );

  it("no pide nada de las tarjetas que quedaron abajo del scroll", async () => {
    visibleAlObservar = false;
    getOrphanStudyImages.mockResolvedValue(["inst-1"]);
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    renderList({ studies: lista(10) });

    // Nada a la vista todavía: ni un pedido.
    expect(getOrphanStudyImages).not.toHaveBeenCalled();

    scrollearHasta(3);

    await waitFor(() =>
      expect(getOrphanStudyImagePreview).toHaveBeenCalledTimes(3),
    );
    expect(getOrphanStudyImages).toHaveBeenCalledTimes(3);
    expect(getOrphanStudyImages).toHaveBeenCalledWith("item-1");
    expect(getOrphanStudyImages).not.toHaveBeenCalledWith("item-4");
  });

  it("baja la miniatura recién cuando la tarjeta entra en pantalla", async () => {
    visibleAlObservar = false;
    getOrphanStudyImages.mockResolvedValue(["inst-1"]);
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    renderList({ studies: lista(10) });
    scrollearHasta(10);

    await waitFor(() =>
      expect(getOrphanStudyImages).toHaveBeenCalledTimes(10),
    );
    // getAllByRole dentro del waitFor: findAllByRole resuelve con la primera
    // que aparezca y no probaría que llegaron las diez.
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(10));
  });
});
