import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import StudiesTimeline, { TimelineStudy } from "./index";

vi.mock("../Delete/dialog", () => ({
  default: ({ idStudy }: { idStudy: number }) => (
    <button data-testid={`delete-${idStudy}`}>Eliminar</button>
  ),
}));

const baseStudy = (overrides: Partial<TimelineStudy> = {}): TimelineStudy => ({
  id: 1,
  title: "Eco Doppler periférico",
  category: "Imagenología",
  date: "2026-07-20",
  dateLabel: "20/7/2026",
  fileUrl: "https://example.com/estudio.pdf",
  ...overrides,
});

describe("StudiesTimeline", () => {
  it("agrupa por mes/año en descendente con el conteo bien pluralizado", () => {
    render(
      <StudiesTimeline
        studies={[
          baseStudy({ id: 1, date: "2021-03-10", dateLabel: "10/3/2021" }),
          baseStudy({ id: 2, date: "2026-07-20", dateLabel: "20/7/2026" }),
          baseStudy({ id: 3, date: "2026-07-02", dateLabel: "2/7/2026" }),
        ]}
      />
    );

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      "JULIO 2026",
      "MARZO 2021",
    ]);

    expect(screen.getByText("2 estudios")).toBeInTheDocument();
    expect(screen.getByText("1 estudio")).toBeInTheDocument();
  });

  it("muestra el estudio más nuevo primero (regresión del orden invertido)", () => {
    render(
      <StudiesTimeline
        studies={[
          baseStudy({ id: 1, title: "Viejo 2021", date: "2021-03-10" }),
          baseStudy({ id: 2, title: "Nuevo 2026", date: "2026-07-20" }),
        ]}
      />
    );

    const rows = screen.getAllByTestId("study-row");
    expect(within(rows[0]).getByText("Nuevo 2026")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Viejo 2021")).toBeInTheDocument();
  });

  it("marca los estudios externos con badge y barra naranja", () => {
    render(
      <StudiesTimeline
        studies={[
          baseStudy({ isExternal: true, externalInstitution: "Sanatorio X" }),
        ]}
      />
    );

    expect(screen.getByText("Externo")).toBeInTheDocument();
    expect(screen.getByText("Sanatorio X")).toBeInTheDocument();
    expect(screen.getByTestId("study-row").className).toContain(
      "border-l-orange-500"
    );
  });

  it("usa la barra verde greenPrimary para los estudios propios", () => {
    render(<StudiesTimeline studies={[baseStudy()]} />);
    expect(screen.getByTestId("study-row").className).toContain(
      "border-l-greenPrimary"
    );
  });

  it("un estudio sin documento muestra los badges Manual y Sin documento, y no ofrece descarga", () => {
    render(<StudiesTimeline studies={[baseStudy({ fileUrl: undefined })]} />);

    expect(screen.getByText("Manual")).toBeInTheDocument();
    expect(screen.getByText("Sin documento")).toBeInTheDocument();
    expect(screen.queryByTitle("Descargar estudio")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Ver estudio")).not.toBeInTheDocument();
  });

  it("un externo sin documento no se marca como Manual", () => {
    render(
      <StudiesTimeline
        studies={[baseStudy({ fileUrl: undefined, isExternal: true })]}
      />
    );

    expect(screen.queryByText("Manual")).not.toBeInTheDocument();
    expect(screen.getByText("Sin documento")).toBeInTheDocument();
  });

  it("con documento ofrece ver y descargar", () => {
    render(<StudiesTimeline studies={[baseStudy()]} />);
    expect(screen.getByTitle("Ver estudio")).toBeInTheDocument();
    expect(screen.getByTitle("Descargar estudio")).toBeInTheDocument();
  });

  describe("permisos de borrado (no se amplían)", () => {
    it("sin canDelete y sin ser el médico firmante, no hay botón de eliminar", () => {
      render(
        <StudiesTimeline studies={[baseStudy()]} canDelete={false} patientId="7" />
      );
      expect(screen.queryByTestId("delete-1")).not.toBeInTheDocument();
    });

    it("con canDelete se puede borrar un estudio con documento", () => {
      render(
        <StudiesTimeline studies={[baseStudy()]} canDelete patientId="7" />
      );
      expect(screen.getByTestId("delete-1")).toBeInTheDocument();
    });

    it("canDelete NO alcanza para borrar un laboratorio manual ajeno", () => {
      render(
        <StudiesTimeline
          studies={[baseStudy({ fileUrl: undefined, signedDoctorId: "99" })]}
          canDelete
          patientId="7"
          currentDoctorId="5"
        />
      );
      expect(screen.queryByTestId("delete-1")).not.toBeInTheDocument();
    });

    it("el médico firmante sí puede borrar su laboratorio manual", () => {
      render(
        <StudiesTimeline
          studies={[baseStudy({ fileUrl: undefined, signedDoctorId: "5" })]}
          canDelete={false}
          patientId="7"
          currentDoctorId="5"
        />
      );
      expect(screen.getByTestId("delete-1")).toBeInTheDocument();
    });

    it("el médico firmante puede borrar su estudio externo", () => {
      render(
        <StudiesTimeline
          studies={[baseStudy({ isExternal: true, signedDoctorId: "5" })]}
          canDelete={false}
          patientId="7"
          currentDoctorId="5"
        />
      );
      expect(screen.getByTestId("delete-1")).toBeInTheDocument();
    });

    it("sin patientId nunca se ofrece borrar", () => {
      render(<StudiesTimeline studies={[baseStudy()]} canDelete />);
      expect(screen.queryByTestId("delete-1")).not.toBeInTheDocument();
    });
  });

  describe("layout sin scroll horizontal", () => {
    const longTitle =
      "SPECT GAMMA SIN ISQUEMIA NI NECROSIS PBA MAXIMA 9.5 METS TA NORMAL";

    it("no usa overflow-x como solución de layout", () => {
      const { container } = render(
        <StudiesTimeline
          studies={[baseStudy({ title: longTitle }), baseStudy({ id: 2 })]}
        />
      );

      const offenders = container.querySelectorAll(
        "[class*='overflow-x-auto'], [class*='overflow-x-scroll']"
      );
      expect(offenders).toHaveLength(0);
    });

    it("el contenido no lleva whitespace-nowrap (empujaría el ancho)", () => {
      const { container } = render(
        <StudiesTimeline studies={[baseStudy({ title: longTitle })]} />
      );

      // Los botones de acción son de icono y ancho fijo: su nowrap no ensancha
      // nada. Lo que no puede tener nowrap es el contenido de texto variable.
      const offenders = Array.from(
        container.querySelectorAll("[class*='whitespace-nowrap']")
      ).filter((el) => !el.closest("button"));

      expect(offenders).toHaveLength(0);
    });

    it("un título largo va en un contenedor con min-w-0 y break-words", () => {
      render(<StudiesTimeline studies={[baseStudy({ title: longTitle })]} />);

      const title = screen.getByText(longTitle);
      expect(title.className).toContain("break-words");
      expect(title.parentElement?.className).toContain("min-w-0");
    });

    it("las filas se apilan en mobile y pasan a fila en sm+", () => {
      render(<StudiesTimeline studies={[baseStudy()]} />);

      const layout = screen.getByTestId("study-row").firstElementChild;
      expect(layout?.className).toContain("flex-col");
      expect(layout?.className).toContain("sm:flex-row");
    });
  });

  it("muestra el estado vacío cuando no hay estudios", () => {
    render(<StudiesTimeline studies={[]} />);
    expect(screen.getByText("No hay estudios disponibles")).toBeInTheDocument();
  });
});
