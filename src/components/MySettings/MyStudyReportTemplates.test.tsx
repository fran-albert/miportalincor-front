import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  MyStudyReportTemplateDetail as MyStudyReportTemplateDetailType,
  MyStudyReportTemplateSummary,
} from "@/types/StudyReport/StudyReport.types";

const mockUseMyStudyReportTemplates = vi.hoisted(() => vi.fn());
const mockUseMyStudyReportTemplate = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/StudyReport/useMyStudyReportTemplates", () => ({
  useMyStudyReportTemplates: mockUseMyStudyReportTemplates,
  useMyStudyReportTemplate: mockUseMyStudyReportTemplate,
}));

import { MyStudyReportTemplates } from "./MyStudyReportTemplates";
import { MyStudyReportTemplateDetail } from "./MyStudyReportTemplateDetail";

interface QueryResultStub<TData> {
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const listResult = (
  overrides: Partial<QueryResultStub<MyStudyReportTemplateSummary[]>> = {},
): QueryResultStub<MyStudyReportTemplateSummary[]> => ({
  data: [],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  ...overrides,
});

const detailResult = (
  overrides: Partial<QueryResultStub<MyStudyReportTemplateDetailType>> = {},
): QueryResultStub<MyStudyReportTemplateDetailType> => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  ...overrides,
});

const summary = (
  overrides: Partial<MyStudyReportTemplateSummary> = {},
): MyStudyReportTemplateSummary => ({
  templateKey: "abdominal-ultrasound",
  label: "Ecografía de abdomen",
  hasTemplate: true,
  ...overrides,
});

describe("MyStudyReportTemplates", () => {
  it("lista las plantillas propias ordenadas por nombre", () => {
    mockUseMyStudyReportTemplates.mockReturnValue(
      listResult({
        data: [
          summary({ templateKey: "breast", label: "Ecografía mamaria" }),
          summary({ templateKey: "abdominal", label: "Ecografía de abdomen" }),
          summary({ templateKey: "neck", label: "Doppler de vasos del cuello" }),
        ],
      }),
    );

    render(<MyStudyReportTemplates />);

    const rows = screen.getAllByTestId("template-row");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText("Doppler de vasos del cuello")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Ecografía de abdomen")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Ecografía mamaria")).toBeInTheDocument();
    expect(screen.getByText("Mis plantillas")).toBeInTheDocument();
    expect(screen.getByText("3 estudios")).toBeInTheDocument();
  });

  it("muestra los tipos sin plantilla propia, marcados y no escondidos", () => {
    mockUseMyStudyReportTemplates.mockReturnValue(
      listResult({
        data: [
          summary({ templateKey: "abdominal", label: "Ecografía de abdomen" }),
          summary({
            templateKey: "transvaginal",
            label: "Ecografía transvaginal",
            hasTemplate: false,
          }),
        ],
      }),
    );

    render(<MyStudyReportTemplates />);

    expect(screen.getByText("Ecografía transvaginal")).toBeInTheDocument();
    expect(screen.getByText("Sin plantilla")).toBeInTheDocument();
    expect(screen.getByText("Sin plantilla propia")).toBeInTheDocument();
    expect(
      screen.getByText(/Vas a arrancar con los campos en blanco/),
    ).toBeInTheDocument();
    // Una sección con la propia y otra con la que falta: ninguna se esconde.
    expect(screen.getAllByText("1 estudio")).toHaveLength(2);
    expect(screen.getAllByTestId("template-row")).toHaveLength(2);
  });

  it("avisa cuando no tiene NINGUNA plantilla cargada, sin dejar la pantalla en blanco", () => {
    mockUseMyStudyReportTemplates.mockReturnValue(
      listResult({
        data: [
          summary({
            templateKey: "abdominal",
            label: "Ecografía de abdomen",
            hasTemplate: false,
          }),
        ],
      }),
    );

    render(<MyStudyReportTemplates />);

    expect(screen.getByTestId("my-templates-none-loaded")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Todavía no tenés plantillas cargadas\. Los informes van a arrancar con los campos en blanco\./,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Mis plantillas")).not.toBeInTheDocument();
    // El tipo sin plantilla se sigue listando: es lo que le sirve para pedirla.
    expect(screen.getByText("Ecografía de abdomen")).toBeInTheDocument();
  });

  it("tiene estado de carga propio", () => {
    mockUseMyStudyReportTemplates.mockReturnValue(
      listResult({ data: undefined, isLoading: true }),
    );

    render(<MyStudyReportTemplates />);

    expect(screen.getByTestId("my-templates-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("template-row")).not.toBeInTheDocument();
  });

  it("un error no se disfraza de estado vacío: muestra error con reintento", async () => {
    const refetch = vi.fn();
    mockUseMyStudyReportTemplates.mockReturnValue(
      listResult({ data: undefined, isError: true, refetch }),
    );

    render(<MyStudyReportTemplates />);

    expect(screen.getByTestId("my-templates-error")).toBeInTheDocument();
    expect(
      screen.getByText("No se pudieron cargar tus plantillas"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("muestra el estado vacío cuando no hay ningún tipo de estudio", () => {
    mockUseMyStudyReportTemplates.mockReturnValue(listResult({ data: [] }));

    render(<MyStudyReportTemplates />);

    expect(screen.getByTestId("my-templates-empty")).toBeInTheDocument();
  });

  it("al abrir una plantilla muestra sus campos", async () => {
    mockUseMyStudyReportTemplates.mockReturnValue(
      listResult({
        data: [summary({ templateKey: "abdominal", label: "Ecografía de abdomen" })],
      }),
    );
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({
        data: {
          templateKey: "abdominal",
          label: "Ecografía de abdomen",
          hasTemplate: true,
          fields: [
            { key: "liver", label: "Hígado", type: "text", text: "Tamaño normal." },
          ],
        },
      }),
    );

    render(<MyStudyReportTemplates />);

    await userEvent.click(
      screen.getByRole("button", { name: /Ecografía de abdomen/ }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("template-detail")).toBeInTheDocument();
    });
    expect(screen.getByText("Hígado")).toBeInTheDocument();
    expect(screen.getByText("Tamaño normal.")).toBeInTheDocument();
  });

  describe("solo lectura: no hay ningún camino para editar", () => {
    const renderFullList = () => {
      mockUseMyStudyReportTemplates.mockReturnValue(
        listResult({
          data: [
            summary({ templateKey: "abdominal", label: "Ecografía de abdomen" }),
            summary({
              templateKey: "transvaginal",
              label: "Ecografía transvaginal",
              hasTemplate: false,
            }),
          ],
        }),
      );
      return render(<MyStudyReportTemplates />);
    };

    it("no renderiza inputs, textareas ni selects", () => {
      const { container } = renderFullList();

      expect(container.querySelector("input")).toBeNull();
      expect(container.querySelector("textarea")).toBeNull();
      expect(container.querySelector("select")).toBeNull();
      expect(container.querySelector("[contenteditable]")).toBeNull();
      expect(container.querySelector("form")).toBeNull();
    });

    it("no hay botones de edición, ni siquiera deshabilitados", () => {
      renderFullList();

      const buttons = screen.getAllByRole("button");
      expect(buttons.every((button) => !button.hasAttribute("disabled"))).toBe(true);

      const forbidden =
        /editar|crear|nueva|nuevo|borrar|eliminar|guardar|duplicar|clonar|restaurar|ocultar|reordenar/i;
      buttons.forEach((button) => {
        expect(button.textContent ?? "").not.toMatch(forbidden);
      });
    });
  });

  describe("layout sin scroll horizontal", () => {
    it("no usa overflow-x como solución de layout", () => {
      mockUseMyStudyReportTemplates.mockReturnValue(
        listResult({
          data: [
            summary({
              templateKey: "neck",
              label:
                "Ecodoppler de vasos del cuello con criterios FAC 2022 / ASE / SAC 2020",
            }),
          ],
        }),
      );

      const { container } = render(<MyStudyReportTemplates />);

      expect(
        container.querySelectorAll(
          "[class*='overflow-x-auto'], [class*='overflow-x-scroll']",
        ),
      ).toHaveLength(0);
    });

    it("un nombre largo va en un contenedor con min-w-0 y break-words", () => {
      const longLabel =
        "Ecodoppler de vasos del cuello con criterios FAC 2022 / ASE / SAC 2020";
      mockUseMyStudyReportTemplates.mockReturnValue(
        listResult({ data: [summary({ templateKey: "neck", label: longLabel })] }),
      );

      render(<MyStudyReportTemplates />);

      const label = screen.getByText(longLabel);
      expect(label.className).toContain("break-words");
      expect(label.parentElement?.className).toContain("min-w-0");
    });

    it("la fila se apila en mobile y pasa a fila en sm+", () => {
      mockUseMyStudyReportTemplates.mockReturnValue(
        listResult({ data: [summary()] }),
      );

      render(<MyStudyReportTemplates />);

      const layout = screen.getByText("Ecografía de abdomen").parentElement;
      expect(layout?.className).toContain("flex-col");
      expect(layout?.className).toContain("sm:flex-row");
    });
  });
});

describe("MyStudyReportTemplateDetail", () => {
  it("muestra los campos en el orden que los manda la API", () => {
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({
        data: {
          templateKey: "abdominal",
          label: "Ecografía de abdomen",
          hasTemplate: true,
          fields: [
            { key: "liver", label: "Hígado", type: "text", text: "Normal." },
            { key: "spleen", label: "Bazo", type: "text", text: "Normal." },
            { key: "aorta", label: "Aorta", type: "number", text: null },
          ],
        },
      }),
    );

    render(<MyStudyReportTemplateDetail templateKey="abdominal" />);

    const fields = screen.getAllByTestId("template-field");
    expect(fields.map((field) => field.textContent?.startsWith("Hígado"))).toEqual([
      true,
      false,
      false,
    ]);
    expect(within(fields[1]).getByText("Bazo")).toBeInTheDocument();
    expect(within(fields[2]).getByText("Aorta")).toBeInTheDocument();
  });

  it("respeta los saltos de línea del texto clínico", () => {
    const clinicalText = "Hígado de tamaño normal.\nEcoestructura homogénea.";
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({
        data: {
          templateKey: "abdominal",
          label: "Ecografía de abdomen",
          hasTemplate: true,
          fields: [
            { key: "liver", label: "Hígado", type: "text", text: clinicalText },
          ],
        },
      }),
    );

    render(<MyStudyReportTemplateDetail templateKey="abdominal" />);

    const paragraph = screen.getByText(/Hígado de tamaño normal/);
    expect(paragraph.textContent).toBe(clinicalText);
    expect(paragraph.className).toContain("whitespace-pre-wrap");
    expect(paragraph.className).toContain("break-words");
  });

  it("marca como vacíos los campos sin texto (text: null y string vacío)", () => {
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({
        data: {
          templateKey: "abdominal",
          label: "Ecografía de abdomen",
          hasTemplate: true,
          fields: [
            { key: "liver", label: "Hígado", type: "text", text: null },
            { key: "spleen", label: "Bazo", type: "text", text: "   " },
          ],
        },
      }),
    );

    render(<MyStudyReportTemplateDetail templateKey="abdominal" />);

    expect(
      screen.getAllByText("Sin texto — este campo arranca vacío"),
    ).toHaveLength(2);
  });

  it("avisa cuando el estudio no tiene plantilla propia", () => {
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({
        data: {
          templateKey: "transvaginal",
          label: "Ecografía transvaginal",
          hasTemplate: false,
          fields: [
            { key: "uterus", label: "Útero", type: "text", text: null },
          ],
        },
      }),
    );

    render(<MyStudyReportTemplateDetail templateKey="transvaginal" />);

    expect(
      screen.getByText(
        /No tenés plantilla propia para este estudio: vas a arrancar con los campos en blanco\./,
      ),
    ).toBeInTheDocument();
  });

  it("tiene estado de carga y de error propios", async () => {
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({ isLoading: true }),
    );
    const { unmount } = render(
      <MyStudyReportTemplateDetail templateKey="abdominal" />,
    );
    expect(screen.getByTestId("template-detail-loading")).toBeInTheDocument();
    unmount();

    const refetch = vi.fn();
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({ isError: true, refetch }),
    );
    render(<MyStudyReportTemplateDetail templateKey="abdominal" />);

    expect(screen.getByTestId("template-detail-error")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("el detalle tampoco ofrece edición", () => {
    mockUseMyStudyReportTemplate.mockReturnValue(
      detailResult({
        data: {
          templateKey: "abdominal",
          label: "Ecografía de abdomen",
          hasTemplate: true,
          fields: [
            { key: "liver", label: "Hígado", type: "text", text: "Normal." },
          ],
        },
      }),
    );

    const { container } = render(
      <MyStudyReportTemplateDetail templateKey="abdominal" />,
    );

    expect(container.querySelector("input")).toBeNull();
    expect(container.querySelector("textarea")).toBeNull();
    expect(container.querySelector("select")).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
