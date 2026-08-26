// @vitest-environment jsdom
// ============================================================
// La lista de estudios sin asignar.
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

    expect(screen.getByText(/No hay estudios sin asignar/i)).toBeInTheDocument();
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
// El 25/08 había 80 estudios sin asignar. Cada tarjeta pide dos cosas (las
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

// ============================================================
// El buscador.
//
// 25/08, 80 estudios en la pestaña. Francisco: "con 80 tarjetas, encontrar la
// propia es scrollear a ojo". La ecografista acaba de hacer la eco y tiene a
// la paciente esperando el informe: necesita llegar a SU tarjeta, no recorrer
// la lista.
//
// Filtra en el cliente sobre lo ya cargado (la ventana de 60 días viene entera
// en una respuesta): es instantáneo mientras escribe y no le suma un pedido al
// backend.
// ============================================================
describe("OrphanStudiesList — el buscador", () => {
  const conNombre = (
    id: string,
    nombre: string,
    fecha = "2026-08-20T00:00:00.000Z",
  ): OrphanStudy =>
    huerfano({
      sourceInboxItemId: id,
      detectedPatientName: nombre,
      studyDate: fecha,
      hasImages: false,
      needsPatient: false,
    });

  const buscador = () => screen.getByRole("searchbox");

  it("filtra por una parte del apellido", async () => {
    const user = userEvent.setup();
    renderList({
      studies: [
        conNombre("a", "PERALTA MARTA"),
        conNombre("b", "GOMEZ ANA"),
        conNombre("c", "SUAREZ JULIA"),
      ],
    });

    await user.type(buscador(), "peral");

    expect(screen.getByText("PERALTA MARTA")).toBeInTheDocument();
    expect(screen.queryByText("GOMEZ ANA")).not.toBeInTheDocument();
    expect(screen.queryByText("SUAREZ JULIA")).not.toBeInTheDocument();
  });

  it("no distingue mayúsculas ni acentos", async () => {
    const user = userEvent.setup();
    renderList({
      studies: [conNombre("a", "PEÑA ROSA"), conNombre("b", "GOMEZ ANA")],
    });

    await user.type(buscador(), "pena");

    expect(screen.getByText("PEÑA ROSA")).toBeInTheDocument();
    expect(screen.queryByText("GOMEZ ANA")).not.toBeInTheDocument();
  });

  // La tarjeta dice "20/08/2026". Escribir "20/08" TIENE que encontrarla: es
  // el caso que no puede fallar.
  it("filtra por la fecha tal como se lee en la tarjeta", async () => {
    const user = userEvent.setup();
    renderList({
      studies: [
        conNombre("a", "PERALTA MARTA", "2026-08-20T00:00:00.000Z"),
        conNombre("b", "GOMEZ ANA", "2026-08-21T00:00:00.000Z"),
      ],
    });

    await user.type(buscador(), "20/08");

    expect(screen.getByText("PERALTA MARTA")).toBeInTheDocument();
    expect(screen.queryByText("GOMEZ ANA")).not.toBeInTheDocument();
  });

  it("acepta el guión y la fecha ISO", async () => {
    const user = userEvent.setup();
    renderList({
      studies: [
        conNombre("a", "PERALTA MARTA", "2026-08-20T00:00:00.000Z"),
        conNombre("b", "GOMEZ ANA", "2026-08-21T00:00:00.000Z"),
      ],
    });

    await user.type(buscador(), "20-08");
    expect(screen.queryByText("GOMEZ ANA")).not.toBeInTheDocument();

    await user.clear(buscador());
    await user.type(buscador(), "2026-08-21");
    expect(screen.getByText("GOMEZ ANA")).toBeInTheDocument();
    expect(screen.queryByText("PERALTA MARTA")).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------
  // Los dos vacíos NO significan lo mismo.
  //
  // "No hay estudios sin asignar" es una BUENA noticia: no quedó nada suelto.
  // "No encontré nada con lo que escribiste" es un callejón sin salida del que
  // hay que poder salir, y por eso trae el botón para limpiar la búsqueda.
  // Mostrar el primero cuando pasa el segundo le haría creer que la lista se
  // vació.
  // ------------------------------------------------------------
  it("cuando la búsqueda no encuentra nada lo dice por la búsqueda, no por la lista", async () => {
    const user = userEvent.setup();
    renderList({ studies: [conNombre("a", "PERALTA MARTA")] });

    await user.type(buscador(), "zzz");

    expect(screen.getByText(/No hay estudios que coincidan/i)).toBeInTheDocument();
    expect(screen.queryByText(/No hay estudios sin asignar/i)).not.toBeInTheDocument();
  });

  it("ofrece limpiar la búsqueda y al limpiarla vuelve la lista entera", async () => {
    const user = userEvent.setup();
    renderList({
      studies: [conNombre("a", "PERALTA MARTA"), conNombre("b", "GOMEZ ANA")],
    });

    await user.type(buscador(), "zzz");
    await user.click(screen.getByRole("button", { name: /Limpiar búsqueda/i }));

    expect(screen.getByText("PERALTA MARTA")).toBeInTheDocument();
    expect(screen.getByText("GOMEZ ANA")).toBeInTheDocument();
    expect(buscador()).toHaveValue("");
  });

  it("con la lista vacía de verdad no muestra buscador, muestra la buena noticia", () => {
    renderList({ studies: [] });

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByText(/No hay estudios sin asignar/i)).toBeInTheDocument();
  });

  it("dice cuántas está mostrando de cuántas para que no parezca que se perdieron", async () => {
    const user = userEvent.setup();
    renderList({
      studies: [
        conNombre("a", "PERALTA MARTA"),
        conNombre("b", "GOMEZ ANA"),
        conNombre("c", "SUAREZ JULIA"),
      ],
    });

    await user.type(buscador(), "peral");

    expect(screen.getByText(/1 de 3/i)).toBeInTheDocument();
  });

  // La pantalla se usa de pie, con el equipo al lado y el celular en la mano.
  it("el buscador ocupa todo el ancho en el celular", () => {
    renderList({ studies: [conNombre("a", "PERALTA MARTA")] });

    expect(buscador().className).toContain("w-full");
  });

  it("reclamar sigue funcionando con el filtro puesto", async () => {
    const onClaim = vi.fn();
    const user = userEvent.setup();
    renderList({
      studies: [conNombre("a", "PERALTA MARTA"), conNombre("b", "GOMEZ ANA")],
      onClaim,
    });

    await user.type(buscador(), "gomez");
    await user.click(screen.getByRole("button", { name: /Es mío/i }));

    expect(onClaim).toHaveBeenCalledWith(
      expect.objectContaining({ sourceInboxItemId: "b" }),
    );
  });
});

// ============================================================
// El filtro no puede romper el lazy loading.
//
// Las miniaturas se bajan sólo cuando la tarjeta entra en pantalla, con tope
// de 4 pedidos a la vez: eso es lo que arregló el "desaparece la carga de
// imágenes" del 25/08. Al filtrar cambia QUÉ tarjetas están en pantalla — una
// que estaba enterrada en el puesto 40 pasa a estar arriba de todo — y su
// miniatura tiene que bajarse ahí, no quedarse en el esqueleto para siempre.
// ============================================================
describe("OrphanStudiesList — el filtro y las miniaturas", () => {
  /**
   * Lo que hace el navegador después de que el filtro reacomoda la lista:
   * reporta como visibles las tarjetas que siguen montadas y ahora entran en
   * pantalla. Las que el filtro sacó ya no están en el DOM y no se reportan.
   */
  const navegadorReportaLoQueQuedaEnPantalla = (): void => {
    act(() => {
      observaciones
        .filter((observacion) => observacion.elemento.isConnected)
        .forEach(mostrar);
    });
  };

  it("baja la miniatura de la tarjeta que el filtro subió a la vista", async () => {
    visibleAlObservar = false;
    getOrphanStudyImages.mockResolvedValue(["inst-1"]);
    getOrphanStudyImagePreview.mockResolvedValue(new Blob(["jpeg"]));

    const user = userEvent.setup();
    const estudios = Array.from({ length: 40 }, (_, indice) =>
      huerfano({
        sourceInboxItemId: `item-${indice + 1}`,
        detectedPatientName: indice === 39 ? "PERALTA MARTA" : `PACIENTE ${indice}`,
      }),
    );
    renderList({ studies: estudios });

    // Enterrada en el puesto 40: sin scrollear no se pidió nada.
    expect(getOrphanStudyImages).not.toHaveBeenCalled();

    await user.type(screen.getByRole("searchbox"), "peralta");
    navegadorReportaLoQueQuedaEnPantalla();

    await waitFor(() =>
      expect(getOrphanStudyImages).toHaveBeenCalledWith("item-40"),
    );
    // Y sólo la suya: las otras 39 ya no están en pantalla.
    expect(getOrphanStudyImages).toHaveBeenCalledTimes(1);
  });
});
