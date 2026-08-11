// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import QrAttendancePage from "./index";

const registerPublicQrAttendance = vi.fn();

vi.mock("@/api/Program/register-public-qr-attendance.action", () => ({
  registerPublicQrAttendance: (qrToken: string, dni: string) =>
    registerPublicQrAttendance(qrToken, dni) as unknown,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/asistencia/qr/token-gimnasio"]}>
        <Routes>
          <Route
            path="/asistencia/qr/:qrToken"
            element={<QrAttendancePage />}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const confirmar = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Ingresá tu DNI"), "12345678");
  await user.click(screen.getByRole("button", { name: "Confirmar asistencia" }));
};

describe("QrAttendancePage", () => {
  it("avisa que no hay plan vigente sin frenar el registro de la asistencia", async () => {
    registerPublicQrAttendance.mockResolvedValue({
      firstName: "Rosa",
      activityName: "Gimnasio",
      alreadyRegistered: false,
      withoutActivePlan: true,
    });

    renderPage();
    await confirmar();

    // La asistencia se registró igual: primero el OK, después el aviso.
    expect(await screen.findByText("¡Listo, Rosa!")).toBeInTheDocument();
    expect(
      screen.getByText("Tu asistencia a Gimnasio quedó registrada.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Todavía no tenés un plan cargado")
    ).toBeInTheDocument();
  });

  it("no muestra el aviso cuando el paciente tiene plan vigente", async () => {
    registerPublicQrAttendance.mockResolvedValue({
      firstName: "Rosa",
      activityName: "Gimnasio",
      alreadyRegistered: false,
      withoutActivePlan: false,
    });

    renderPage();
    await confirmar();

    expect(await screen.findByText("¡Listo, Rosa!")).toBeInTheDocument();
    expect(screen.queryByText("Todavía no tenés un plan cargado")).toBeNull();
  });
});
