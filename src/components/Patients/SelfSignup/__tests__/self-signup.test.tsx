// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Patient } from "@/types/Patient/Patient";
import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";

const roles = { isPatient: false, isDoctor: false, isSecretary: true, isAdmin: false };
const verify = vi.fn().mockResolvedValue({});
const deactivate = vi.fn().mockResolvedValue({ message: "ok" });

vi.mock("@/hooks/useRoles", () => ({ default: () => ({ ...roles, session: null }) }));
vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));
vi.mock("@/components/Patients/SelfSignup/useSelfSignupMutations", () => ({
  useSelfSignupMutations: () => ({
    verifyMutation: { mutateAsync: verify, isPending: false },
    deactivateMutation: { mutateAsync: deactivate, isPending: false },
  }),
}));

const basePatient = {
  id: "uuid-1",
  userId: 7001,
  firstName: "Lucía",
  lastName: "Prueba",
  dni: "40200200",
  userName: "40200200",
  email: "lucia@example.com",
  phoneNumber: "3415551234",
  birthDate: "1991-06-15",
  gender: "",
  slug: "lucia-prueba-7001",
  healthPlans: [],
  affiliationNumber: "",
} as unknown as Patient;

const renderInfo = (patient: Patient) =>
  render(
    <MemoryRouter>
      <PatientInformation patient={patient} />
    </MemoryRouter>
  );

describe("Ficha: autoregistro sin verificar", () => {
  beforeEach(() => {
    Object.assign(roles, { isPatient: false, isSecretary: true, isAdmin: false });
    verify.mockClear();
    deactivate.mockClear();
  });

  it("muestra el distintivo y Datos verificados a la secretaria; sin desactivar", () => {
    renderInfo({ ...basePatient, registrationSource: "SELF_SIGNUP", verifiedAt: null });
    expect(screen.getByTestId("self-signup-badge")).toHaveTextContent(
      "Autoregistro · revisar datos"
    );
    expect(screen.getByRole("button", { name: "Datos verificados" })).toBeInTheDocument();
    expect(screen.queryByTestId("deactivate-self-signup")).not.toBeInTheDocument();
  });

  it("Datos verificados exige confirmar DNI y credencial", async () => {
    renderInfo({ ...basePatient, registrationSource: "SELF_SIGNUP", verifiedAt: null });
    await userEvent.click(screen.getByRole("button", { name: "Datos verificados" }));
    const confirm = screen.getByTestId("verify-self-signup-confirm");
    expect(confirm).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Vi el DNI del paciente"));
    expect(confirm).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Vi la credencial de la obra social"));
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(verify).toHaveBeenCalledWith(7001);
  });

  it("el admin puede desactivar con motivo", async () => {
    Object.assign(roles, { isSecretary: false, isAdmin: true });
    renderInfo({ ...basePatient, registrationSource: "SELF_SIGNUP", verifiedAt: null });
    await userEvent.click(screen.getByTestId("deactivate-self-signup"));
    const confirm = screen.getByTestId("deactivate-self-signup-confirm");
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Motivo"), "La titular vino con su DNI");
    await userEvent.click(confirm);
    expect(deactivate).toHaveBeenCalledWith({
      userId: 7001,
      reason: "La titular vino con su DNI",
    });
  });

  it("un rol Paciente no ve el botón", () => {
    Object.assign(roles, { isPatient: true, isSecretary: false, isAdmin: false });
    renderInfo({ ...basePatient, registrationSource: "SELF_SIGNUP", verifiedAt: null });
    expect(screen.queryByRole("button", { name: "Datos verificados" })).not.toBeInTheDocument();
  });

  it("verificado o cargado por secretaría: sin distintivo ni botón", () => {
    const { unmount } = renderInfo({
      ...basePatient,
      registrationSource: "SELF_SIGNUP",
      verifiedAt: "2026-09-29T13:00:00.000Z",
    });
    expect(screen.queryByTestId("self-signup-badge")).not.toBeInTheDocument();
    expect(screen.queryByTestId("self-signup-actions")).not.toBeInTheDocument();
    unmount();
    renderInfo({ ...basePatient, registrationSource: "STAFF", verifiedAt: null });
    expect(screen.queryByTestId("self-signup-badge")).not.toBeInTheDocument();
  });
});
