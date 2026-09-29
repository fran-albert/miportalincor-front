// @vitest-environment happy-dom
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupHealthInsurance } from "@/types/Signup/Signup";
import { EMPTY_SIGNUP_FORM, SignupFormData, StepProps } from "../types";
import { StepDni } from "../steps/StepDni";
import { StepPersonal } from "../steps/StepPersonal";
import { StepHealthInsurance } from "../steps/StepHealthInsurance";
import { StepAddress } from "../steps/StepAddress";
import { StepPassword } from "../steps/StepPassword";
import { StepSummary } from "../steps/StepSummary";

const INSURANCES: SignupHealthInsurance[] = [
  {
    id: 3,
    name: "Galeno",
    requiresAffiliationNumber: true,
    plans: [
      { id: 3, name: "Oro" },
      { id: 4, name: "Azul" },
    ],
  },
  {
    id: 1,
    name: "OSDE",
    requiresAffiliationNumber: true,
    plans: [{ id: 1, name: "Plan 210" }],
  },
  {
    id: 40,
    name: "PARTICULAR",
    requiresAffiliationNumber: false,
    plans: [{ id: 40, name: "PARTICULAR" }],
  },
];

/** Renderiza un paso con estado real, como lo usa el asistente. */
function renderStep(
  Step: (props: StepProps) => JSX.Element,
  initial: Partial<SignupFormData> = {}
) {
  const onNext = vi.fn();
  let latest: SignupFormData = { ...EMPTY_SIGNUP_FORM, ...initial };
  function Harness() {
    const [data, setData] = useState<SignupFormData>(latest);
    latest = data;
    return (
      <Step
        data={data}
        onChange={(patch) => setData((current) => ({ ...current, ...patch }))}
        onBack={() => undefined}
        onNext={onNext}
      />
    );
  }
  render(<Harness />);
  return { onNext, current: () => latest };
}

describe("Paso 1: DNI", () => {
  const Dni = (props: StepProps) => (
    <StepDni {...props} locked={false} tokenExpired={false} isChecking={false} />
  );

  it("no deja avanzar con un DNI inválido y muestra el error", async () => {
    const { onNext } = renderStep(Dni);
    await userEvent.type(screen.getByLabelText("DNI"), "12345");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText(/7 u 8 números/)).toBeInTheDocument();
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
  });

  it("con 7 u 8 números avanza", async () => {
    const { onNext } = renderStep(Dni);
    await userEvent.type(screen.getByLabelText("DNI"), "40200200");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("con token: el DNI viene bloqueado", () => {
    render(
      <StepDni
        data={{ ...EMPTY_SIGNUP_FORM, dni: "40200200" }}
        onChange={() => undefined}
        onNext={() => undefined}
        locked
        tokenExpired={false}
        isChecking={false}
      />
    );
    expect(screen.getByLabelText("DNI")).toHaveAttribute("readonly");
    expect(screen.getByText("Es el DNI con el que sacaste tu turno.")).toBeInTheDocument();
  });

  it("token vencido: avisa y el campo queda editable", () => {
    render(
      <StepDni
        data={EMPTY_SIGNUP_FORM}
        onChange={() => undefined}
        onNext={() => undefined}
        locked={false}
        tokenExpired
        isChecking={false}
      />
    );
    expect(screen.getByTestId("signup-token-expired")).toHaveTextContent(
      "venció o ya se usó"
    );
    expect(screen.getByLabelText("DNI")).not.toHaveAttribute("readonly");
  });
});

describe("Paso 2: Tus datos", () => {
  it("valida celular, email y fecha antes de avanzar", async () => {
    const { onNext } = renderStep(StepPersonal, {
      firstName: "Lucía",
      lastName: "Prueba",
    });
    await userEvent.type(screen.getByLabelText("Celular"), "155551234");
    await userEvent.type(screen.getByLabelText(/Email/), "no-es-email");
    await userEvent.type(screen.getByLabelText("Fecha de nacimiento"), "31021991");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText(/sin 0 ni 15 \(por ejemplo/)).toBeInTheDocument();
    expect(screen.getByText("El email no tiene un formato válido")).toBeInTheDocument();
    expect(screen.getByText(/DD\/MM\/AAAA/)).toBeInTheDocument();
  });

  it("con datos precargados y fecha válida avanza (el email es opcional)", async () => {
    const { onNext, current } = renderStep(StepPersonal, {
      firstName: "Lucía",
      lastName: "Prueba",
      phone: "3415551234",
    });
    await userEvent.type(screen.getByLabelText("Fecha de nacimiento"), "15061991");
    expect(current().birthDate).toBe("15/06/1991");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe("Paso 3: Obra social", () => {
  const Health = (props: StepProps) => (
    <StepHealthInsurance
      {...props}
      insurances={INSURANCES}
      isLoading={false}
      loadError={false}
    />
  );

  it("no se puede saltear", async () => {
    const { onNext } = renderStep(Health);
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText("Elegí tu obra social de la lista")).toBeInTheDocument();
  });

  it("busca sin tildes y, con un solo plan, lo asigna solo; exige afiliado", async () => {
    const { onNext, current } = renderStep(Health);
    await userEvent.type(screen.getByPlaceholderText("Buscá tu obra social"), "osd");
    expect(screen.queryByRole("button", { name: "Galeno" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "OSDE" }));
    expect(current().healthPlanId).toBe(1);

    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText("Completá tu número de afiliado")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Número de afiliado"), "12 34");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).not.toHaveBeenCalled();

    await userEvent.clear(screen.getByLabelText("Número de afiliado"));
    await userEvent.type(screen.getByLabelText("Número de afiliado"), "61234567801");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("con más de un plan pide elegir el plan", async () => {
    const { onNext, current } = renderStep(Health);
    await userEvent.click(screen.getByRole("button", { name: "Galeno" }));
    await userEvent.type(screen.getByLabelText("Número de afiliado"), "99887766");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText("Elegí tu plan")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Azul" }));
    expect(current().healthPlanId).toBe(4);
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("PARTICULAR no pide afiliado", async () => {
    const { onNext } = renderStep(Health);
    await userEvent.click(screen.getByRole("button", { name: "PARTICULAR" }));
    expect(screen.queryByLabelText("Número de afiliado")).not.toBeInTheDocument();
    expect(screen.getByTestId("signup-particular-note")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe("Paso 4: Dirección", () => {
  it("pide provincia, ciudad, calle y número", async () => {
    const Address = (props: StepProps) => (
      <StepAddress {...props} states={[]} cities={[]} isLoadingCities={false} />
    );
    const { onNext } = renderStep(Address);
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getAllByText("Elegí tu provincia").length).toBeGreaterThan(0);
    expect(screen.getByText("Completá la calle")).toBeInTheDocument();
    expect(screen.getByText("Completá el número")).toBeInTheDocument();
  });

  it("con ciudad elegida y calle y número, avanza (piso/depto es opcional)", async () => {
    const Address = (props: StepProps) => (
      <StepAddress {...props} states={[]} cities={[]} isLoadingCities={false} />
    );
    const { onNext } = renderStep(Address, {
      stateId: 22,
      stateName: "Santa Fe",
      cityId: 2104,
      cityName: "Rosario",
    });
    expect(screen.getByTestId("signup-city-selected")).toHaveTextContent("Rosario");
    await userEvent.type(screen.getByLabelText("Calle"), "Calle Ficticia");
    await userEvent.type(screen.getByLabelText("Número"), "123");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe("Paso 5: Contraseña", () => {
  it("rechaza el DNI como contraseña y que no coincidan", async () => {
    const { onNext } = renderStep(StepPassword, { dni: "40200200" });
    await userEvent.type(screen.getByLabelText("Contraseña"), "40200200");
    await userEvent.type(screen.getByLabelText("Repetí la contraseña"), "40200201");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText("No puede ser tu DNI. Elegí otra.")).toBeInTheDocument();
    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  it("con una contraseña válida repetida igual avanza", async () => {
    const { onNext } = renderStep(StepPassword, { dni: "40200200" });
    await userEvent.type(screen.getByLabelText("Contraseña"), "clave-segura-1");
    await userEvent.type(screen.getByLabelText("Repetí la contraseña"), "clave-segura-1");
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe("Confirmación", () => {
  const data: SignupFormData = {
    ...EMPTY_SIGNUP_FORM,
    dni: "40200200",
    firstName: "Lucía",
    lastName: "Prueba",
    phone: "3415551234",
    birthDate: "15/06/1991",
    healthInsuranceId: 1,
    healthInsuranceName: "OSDE",
    healthPlanId: 1,
    healthPlanName: "Plan 210",
    affiliationNumber: "61234567801",
    stateId: 22,
    stateName: "Santa Fe",
    cityId: 2104,
    cityName: "Rosario",
    street: "Calle Ficticia",
    number: "123",
    description: "2° B",
    password: "clave-segura-1",
    confirmPassword: "clave-segura-1",
  };

  it("muestra el resumen y Editar lleva a cada paso", async () => {
    const onEdit = vi.fn();
    const onSubmit = vi.fn();
    render(
      <StepSummary
        data={data}
        onEdit={onEdit}
        onBack={() => undefined}
        onSubmit={onSubmit}
        isSubmitting={false}
        dniLocked={false}
      />
    );
    expect(screen.getByTestId("summary-personal")).toHaveTextContent("341 555 1234");
    expect(screen.getByTestId("summary-health")).toHaveTextContent("61234567801");
    expect(screen.getByTestId("summary-address")).toHaveTextContent(
      "Calle Ficticia 123, 2° B"
    );
    expect(screen.getByTestId("summary-password")).not.toHaveTextContent("clave");

    await userEvent.click(screen.getByRole("button", { name: "Editar obra social" }));
    expect(onEdit).toHaveBeenCalledWith("health");
    await userEvent.click(screen.getByRole("button", { name: "Crear mi cuenta" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("con DNI del turno no se puede editar el DNI", () => {
    render(
      <StepSummary
        data={data}
        onEdit={() => undefined}
        onBack={() => undefined}
        onSubmit={() => undefined}
        isSubmitting={false}
        dniLocked
      />
    );
    expect(screen.queryByRole("button", { name: "Editar dni" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar tus datos" })).toBeInTheDocument();
  });
});
