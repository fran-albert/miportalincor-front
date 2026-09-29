// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VaccinationCardView } from "../VaccinationCardView";
import {
  buildAdultCard,
  buildApplication,
  buildItem,
  buildVaccine,
} from "@/test/fixtures/vaccination.fixtures";
import type { VaccinationCard } from "@/types/Vaccination/Vaccination";

const mocks = vi.hoisted(() => ({
  useVaccinationCatalog: vi.fn(),
  createApplicationMutation: { mutateAsync: vi.fn(), isPending: false },
  updateApplicationMutation: { mutateAsync: vi.fn(), isPending: false },
  deleteApplicationMutation: { mutateAsync: vi.fn(), isPending: false },
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("@/hooks/Vaccination/useVaccinationCard", () => ({
  useVaccinationCatalog: mocks.useVaccinationCatalog,
}));

vi.mock("@/hooks/Vaccination/useVaccinationMutations", () => ({
  useVaccinationMutations: () => ({
    createApplicationMutation: mocks.createApplicationMutation,
    updateApplicationMutation: mocks.updateApplicationMutation,
    deleteApplicationMutation: mocks.deleteApplicationMutation,
  }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    showSuccess: mocks.showSuccess,
    showError: mocks.showError,
  }),
}));

const tripleViral = buildVaccine(
  "triple_viral",
  "Triple viral",
  "Sarampion, rubeola y paperas"
);
const vph = buildVaccine("vph", "VPH", "Virus del papiloma humano");
const gripe = buildVaccine("gripe", "Gripe", "Influenza");

const buildCard = (
  overrides: Partial<VaccinationCard> = {}
): VaccinationCard => {
  const applications = [
    buildApplication({
      id: "app-gripe",
      vaccine: gripe,
      doseLabel: "1ra dosis",
      appliedDate: "2024-04-15",
      canEdit: false,
      doctor: { firstName: "Carlos", lastName: "Gomez" },
    }),
    buildApplication({
      id: "app-triple",
      vaccine: tripleViral,
      doseLabel: "1ra dosis",
      appliedDate: "2026-09-28",
      canEdit: true,
      observations: "Sin reacciones",
    }),
    buildApplication({
      id: "app-vph",
      vaccine: vph,
      doseLabel: "Unica dosis",
      appliedDate: "2025-03-28",
      canEdit: true,
    }),
  ];

  return {
    patientUserId: "patient-uuid",
    patient: {
      id: "patient-uuid",
      firstName: "Juliana",
      lastName: "Albert Rolandi",
      userName: "25123456",
      birthDate: "1978-03-12",
    },
    generatedAt: "2026-09-28",
    counts: { applied: 3, pending: 0, overdue: 0, upcoming: 0 },
    items: applications.map((application) =>
      buildItem({
        scheduleRuleId: application.scheduleRuleId,
        vaccine: application.vaccine!,
        doseLabel: application.doseLabel,
        status: "applied",
        application,
      })
    ),
    applications,
    canAddApplications: true,
    ...overrides,
  };
};

const getDataRows = () =>
  within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("VaccinationCardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useVaccinationCatalog.mockReturnValue({
      catalog: { vaccines: [], scheduleRules: [] },
      isLoading: false,
    });
  });

  it("muestra el encabezado del carnet con logo, titulo y paciente", () => {
    render(<VaccinationCardView vaccinationCard={buildCard()} />);

    const title = screen.getByRole("heading", { name: "Carnet de vacunación" });
    expect(title.nextElementSibling).toHaveTextContent("Juliana Albert Rolandi");
    expect(screen.getByRole("img", { name: "Incor Centro Médico" })).toBeInTheDocument();
  });

  it("usa encabezados de tabla reales", () => {
    render(<VaccinationCardView vaccinationCard={buildCard()} />);

    const headers = within(screen.getByRole("table"))
      .getAllByRole("columnheader")
      .map((header) => header.textContent);
    expect(headers).toEqual([
      "Vacuna",
      "Fecha de aplicación",
      "Dosis",
      "Médico",
      "Estado",
    ]);
  });

  it("ordena las aplicadas por fecha, la mas reciente arriba", () => {
    render(<VaccinationCardView vaccinationCard={buildCard()} />);

    const names = getDataRows().map(
      (row) => within(row).getAllByRole("cell")[0].querySelector("p")?.textContent
    );
    expect(names).toEqual(["Triple viral", "VPH", "Gripe"]);

    const mobileItems = within(
      screen.getByRole("list", { name: "Vacunas aplicadas" })
    ).getAllByRole("listitem");
    expect(mobileItems.map((item) => item.querySelector("p")?.textContent)).toEqual([
      "Triple viral",
      "VPH",
      "Gripe",
    ]);
  });

  it("muestra en cada fila vacuna, aclaracion, fecha, dosis, medico y estado", () => {
    render(<VaccinationCardView vaccinationCard={buildCard()} />);

    const cells = within(getDataRows()[0]).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Triple viral");
    expect(cells[0]).toHaveTextContent("Sarampión, rubéola y paperas");
    expect(cells[0]).toHaveTextContent("Sin reacciones");
    expect(cells[1]).toHaveTextContent("28/09/2026");
    expect(cells[2]).toHaveTextContent("1ra dosis");
    expect(cells[3]).toHaveTextContent("Juliana Albert Rolandi");
    expect(cells[4]).toHaveTextContent("Aplicada");

    expect(within(getDataRows()[2]).getAllByRole("cell")[3]).toHaveTextContent(
      "Carlos Gomez"
    );
  });

  it("muestra la dosis bien escrita sin tocar el dato", () => {
    render(<VaccinationCardView vaccinationCard={buildCard()} />);

    expect(within(getDataRows()[1]).getAllByRole("cell")[2]).toHaveTextContent(
      "Única dosis"
    );
  });

  it("en la vista del paciente no hay acciones", () => {
    render(
      <VaccinationCardView
        vaccinationCard={buildCard({ canAddApplications: false })}
      />
    );

    expect(
      within(screen.getByRole("table")).queryByRole("columnheader", {
        name: "Acciones",
      })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /eliminar/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /cargar vacuna/i })
    ).not.toBeInTheDocument();
    expect(mocks.useVaccinationCatalog).toHaveBeenCalledWith(false);
  });

  it("aunque la API diga canEdit, el paciente no ve acciones sin isDoctor", () => {
    render(<VaccinationCardView vaccinationCard={buildCard()} />);

    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(mocks.useVaccinationCatalog).toHaveBeenCalledWith(false);
  });

  it("en la vista del medico hay acciones por fila segun canEdit", () => {
    render(<VaccinationCardView vaccinationCard={buildCard()} isDoctor />);

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("columnheader", { name: "Acciones" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("button", { name: "Editar Triple viral 1ra dosis" })
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("button", { name: "Eliminar VPH Única dosis" })
    ).toBeInTheDocument();
    expect(
      within(table).queryByRole("button", { name: /editar gripe/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cargar vacuna/i })
    ).toBeInTheDocument();
    expect(mocks.useVaccinationCatalog).toHaveBeenCalledWith(true);
  });

  it("el medico puede borrar una aplicacion confirmando", async () => {
    const user = userEvent.setup();
    mocks.deleteApplicationMutation.mutateAsync.mockResolvedValue(undefined);
    render(<VaccinationCardView vaccinationCard={buildCard()} isDoctor />);

    await user.click(
      within(screen.getByRole("table")).getByRole("button", {
        name: "Eliminar VPH Única dosis",
      })
    );
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(mocks.deleteApplicationMutation.mutateAsync).toHaveBeenCalledWith({
      applicationId: "app-vph",
    });
  });

  it("estado vacio para el paciente", () => {
    render(
      <VaccinationCardView
        vaccinationCard={buildCard({
          applications: [],
          items: [],
          canAddApplications: false,
        })}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Carnet de vacunación" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Todavía no hay vacunas cargadas. Las carga tu médico en la consulta."
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("estado vacio para el medico invita a cargar la primera", () => {
    render(
      <VaccinationCardView
        vaccinationCard={buildCard({ applications: [], items: [] })}
        isDoctor
      />
    );

    expect(
      screen.getByText("Todavía no hay vacunas cargadas para este paciente.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cargar la primera vacuna" })
    ).toBeInTheDocument();
  });

  it("a un adulto no le muestra el calendario infantil como vencido", () => {
    render(<VaccinationCardView vaccinationCard={buildAdultCard()} />);

    expect(getDataRows()).toHaveLength(2);
    expect(screen.queryByText(/vencid/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/próximas y pendientes/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/calendario/i)).not.toBeInTheDocument();
  });

  it("al medico de un adulto le aclara que el calendario cargado es el infantil", () => {
    render(
      <VaccinationCardView vaccinationCard={buildAdultCard()} isDoctor />
    );

    expect(screen.queryByText(/vencid/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/el calendario cargado es el infantil/i)
    ).toBeInTheDocument();
  });

  it("si el calendario aplica, lo muestra plegado debajo del carnet", async () => {
    const user = userEvent.setup();
    const card = buildCard({
      items: [
        buildItem({
          scheduleRuleId: "rule-vph",
          vaccine: vph,
          doseLabel: "Unica dosis",
          status: "upcoming",
          recommendedDate: "2031-01-15",
        }),
        buildItem({
          scheduleRuleId: "rule-old",
          vaccine: tripleViral,
          doseLabel: "2da dosis",
          status: "overdue",
          recommendedDate: "2025-01-15",
        }),
      ],
    });
    render(<VaccinationCardView vaccinationCard={card} isDoctor />);

    const trigger = screen.getByRole("button", {
      name: /próximas y pendientes según el calendario/i,
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    const calendar = screen.getByRole("list", { name: "Dosis del calendario" });
    expect(within(calendar).getByText("VPH")).toBeInTheDocument();
    expect(within(calendar).getByText(/15\/01\/2031/)).toBeInTheDocument();
    expect(within(calendar).queryByText("Triple viral")).not.toBeInTheDocument();
    expect(
      within(calendar).getByRole("button", { name: "Cargar VPH Única dosis" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/vencid/i)).not.toBeInTheDocument();
  });
});
