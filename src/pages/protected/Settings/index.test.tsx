// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./index";
import type { ConsultationType } from "@/types/ConsultationType/ConsultationType";
import { PERMISSIONS, filterMenuItems } from "@/common/constants/permissions";
import { Role } from "@/common/enums/role.enum";

/**
 * Configuración: la secretaria entra solo a los tipos de estudio (crear,
 * editar y desactivar). Pantalla TV y Chequeos Periódicos siguen siendo del
 * administrador.
 */

const roles = { isAdmin: false, isSecretary: false };
vi.mock("@/hooks/useRoles", () => ({
  default: () => roles,
}));

vi.mock("@/components/TvMedia/TvMediaManager", () => ({
  TvMediaManager: () => <div>Gestor de pantalla TV</div>,
}));
vi.mock("@/components/PeriodicCheckup", () => ({
  CheckupTypesManager: () => <div>Gestor de chequeos periódicos</div>,
}));

const buildType = (overrides: Partial<ConsultationType> = {}): ConsultationType => ({
  id: 7,
  name: "MAPA",
  defaultDurationMinutes: 20,
  isActive: true,
  displayOrder: 1,
  isEcoSubtype: false,
  isIntegralCheckupEco: false,
  createdAt: "2026-08-11T10:00:00Z",
  updatedAt: "2026-08-11T10:00:00Z",
  ...overrides,
});

const createType = vi.fn();
const updateType = vi.fn();
const deactivateType = vi.fn();
const TYPES = [buildType()];

vi.mock("@/hooks/ConsultationType", () => ({
  useAllConsultationTypes: () => ({ consultationTypes: TYPES, isLoading: false }),
  useOwnConsultationTypes: () => ({ consultationTypes: [], isLoading: false }),
  useCreateConsultationType: () => ({ mutateAsync: createType, isPending: false }),
  useUpdateConsultationType: () => ({ mutateAsync: updateType, isPending: false }),
  useDeactivateConsultationType: () => ({ mutateAsync: deactivateType, isPending: false }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("Configuración por rol", () => {
  beforeEach(() => {
    Object.assign(roles, { isAdmin: false, isSecretary: false });
    createType.mockReset().mockResolvedValue(buildType({ id: 8, name: "AMPA" }));
    updateType.mockReset().mockResolvedValue(buildType());
    deactivateType.mockReset().mockResolvedValue(buildType({ isActive: false }));
  });

  it("la secretaria ve solo los tipos de estudio", () => {
    roles.isSecretary = true;
    renderPage();

    expect(screen.getByRole("heading", { name: "Tipos de estudio" })).toBeInTheDocument();
    expect(screen.getByText("MAPA")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByText("Pantalla TV")).not.toBeInTheDocument();
    expect(screen.queryByText("Chequeos Periódicos")).not.toBeInTheDocument();
    expect(screen.queryByText("Gestor de pantalla TV")).not.toBeInTheDocument();
    expect(screen.queryByText("Gestor de chequeos periódicos")).not.toBeInTheDocument();
  });

  it("el administrador ve todas las secciones", async () => {
    roles.isAdmin = true;
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole("heading", { name: "Configuración" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Tipos de Turno/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Pantalla TV/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Chequeos Periódicos/ })).toBeInTheDocument();
    expect(screen.getByText("MAPA")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Pantalla TV/ }));
    expect(await screen.findByText("Gestor de pantalla TV")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /Chequeos Periódicos/ }));
    expect(await screen.findByText("Gestor de chequeos periódicos")).toBeInTheDocument();
  });

  describe("la secretaria administra tipos de estudio", () => {
    beforeEach(() => {
      roles.isSecretary = true;
    });

    it("crea un tipo nuevo", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: /Nuevo tipo/ }));
      const dialog = await screen.findByRole("dialog");
      await user.type(within(dialog).getByLabelText("Nombre *"), "AMPA");
      await user.click(within(dialog).getByRole("button", { name: /crear tipo/i }));

      await waitFor(() =>
        expect(createType).toHaveBeenCalledWith(expect.objectContaining({ name: "AMPA" })),
      );
    });

    it("edita un tipo existente", async () => {
      const user = userEvent.setup();
      renderPage();

      const row = screen.getByRole("row", { name: /MAPA/ });
      await user.click(within(row).getByRole("button"));
      await user.click(await screen.findByRole("menuitem", { name: /Editar/ }));

      const dialog = await screen.findByRole("dialog");
      const name = within(dialog).getByLabelText("Nombre *");
      expect(name).toHaveValue("MAPA");
      await user.clear(name);
      await user.type(name, "MAPA 24 hs");
      await user.click(within(dialog).getByRole("button", { name: /guardar/i }));

      await waitFor(() =>
        expect(updateType).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 7,
            dto: expect.objectContaining({ name: "MAPA 24 hs" }),
          }),
        ),
      );
    });

    it("desactiva un tipo", async () => {
      const user = userEvent.setup();
      renderPage();

      const row = screen.getByRole("row", { name: /MAPA/ });
      await user.click(within(row).getByRole("button"));
      await user.click(await screen.findByRole("menuitem", { name: /Desactivar/ }));

      const confirm = await screen.findByRole("alertdialog");
      await user.click(within(confirm).getByRole("button", { name: "Desactivar" }));

      await waitFor(() => expect(deactivateType).toHaveBeenCalledWith(7));
    });
  });
});

describe("Menú: Tipos de estudio", () => {
  const items = [
    {
      title: "Tipos de estudio",
      allowedRoles: PERMISSIONS.CONSULTATION_TYPES,
      strictRoles: true,
    },
  ];

  it("aparece para la secretaria", () => {
    expect(filterMenuItems(items, [Role.SECRETARIA])).toHaveLength(1);
  });

  it("no aparece para el médico ni duplica Configuración al administrador", () => {
    expect(filterMenuItems(items, [Role.MEDICO])).toHaveLength(0);
    expect(filterMenuItems(items, [Role.ADMINISTRADOR])).toHaveLength(0);
  });
});
