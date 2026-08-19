import { afterAll, beforeAll, describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RescheduleAppointmentDialog } from "./RescheduleAppointmentDialog";
import type {
  IntegralCheckupLink,
  IntegralCheckupSlot,
} from "@/types/Appointment/Appointment";

/**
 * Reprogramar, desde el turnero y desde el portal.
 *
 * 🔴 La invariante que este archivo protege: **lo que el backend rechaza, el
 * usuario lo lee**. El diálogo llamaba a la mutación sin `try/catch`: cuando el
 * backend contestaba 400 la promesa se rechazaba, nadie la atrapaba y la
 * pantalla se quedaba igual. Francisco apretaba "Reprogramar" y no pasaba nada
 * —ni error, ni cierre—, y no era exclusivo del control: cualquier rechazo
 * (solapamiento, médico ausente, feriado) se tragaba igual.
 */

/**
 * El reloj queda quieto: qué días se pueden ofrecer depende de "hoy", y las
 * fechas de los fixtures son fijas. Solo se falsea `Date` —los timers de
 * verdad los necesita `userEvent`—.
 */
const HOY = "2026-08-19";
const MANANA = "2026-08-20";

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${HOY}T16:00:00`));
});

afterAll(() => {
  vi.useRealTimers();
});

const showError = vi.fn();
const showSuccess = vi.fn();
vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showError, showSuccess }),
}));

const rangeSlots = vi.fn<() => Array<{ date: string; hour: string }>>(() => [
  { date: "2026-08-27", hour: "11:00" },
  { date: "2026-08-27", hour: "11:30" },
]);

/**
 * Los días del control, tal como los manda el backend. El front no calcula
 * ninguna de las dos horas: la separación entre la consulta y la eco no es
 * fija (el miércoles la consulta dura 20 minutos y el jueves 30).
 */
const DIA_ACTUAL: IntegralCheckupSlot = {
  date: "2026-08-20",
  consultationHour: "15:00",
  ultrasoundHour: "15:30",
  consultationDoctorId: 388,
  ultrasoundDoctorId: 176,
};

const OTRO_DIA: IntegralCheckupSlot = {
  date: "2026-08-27",
  consultationHour: "15:00",
  ultrasoundHour: "15:30",
  consultationDoctorId: 388,
  ultrasoundDoctorId: 176,
};

/** El circuito viejo: la eco ANTES de la consulta, y con otra separación. */
const OTRO_DIA_ECO_PRIMERO: IntegralCheckupSlot = {
  date: "2026-08-27",
  consultationHour: "10:20",
  ultrasoundHour: "10:05",
  consultationDoctorId: 388,
  ultrasoundDoctorId: 176,
};

const integralDays = vi.fn<() => IntegralCheckupSlot[]>(() => [
  DIA_ACTUAL,
  OTRO_DIA,
]);

interface DaysOptions {
  enabled?: boolean;
  excludeAppointmentId?: number;
}

/** Con qué argumentos pidió el diálogo cada listado de días. */
const staffDaysCalls: DaysOptions[] = [];
const patientDaysCalls: DaysOptions[] = [];

/** Los flags de rol, tal como los devuelve `useUserRole`. */
interface RoleFlags {
  isPatient: boolean;
  isDoctor: boolean;
  isSecretary: boolean;
  isAdmin: boolean;
}

const SIN_ROLES: RoleFlags = {
  isPatient: false,
  isDoctor: false,
  isSecretary: false,
  isAdmin: false,
};

const roles = vi.fn<() => RoleFlags>(() => ({
  ...SIN_ROLES,
  isSecretary: true,
}));

const comoSecretaria = () =>
  roles.mockReturnValue({ ...SIN_ROLES, isSecretary: true });
const comoPaciente = () =>
  roles.mockReturnValue({ ...SIN_ROLES, isPatient: true });
const comoMedica = () => roles.mockReturnValue({ ...SIN_ROLES, isDoctor: true });
/** Un rol que este front todavía no conoce (o una sesión sin roles). */
const conRolDesconocido = () => roles.mockReturnValue({ ...SIN_ROLES });

vi.mock("@/hooks/useRoles", () => ({
  default: () => roles(),
}));

/** Que el listado del personal conteste con error (por ejemplo, un 403). */
const staffFalla = vi.fn(() => false);
const reintentarStaff = vi.fn();
const reintentarPaciente = vi.fn();

vi.mock("@/hooks/Appointments", () => ({
  useAvailableSlotsRange: () => ({
    slots: rangeSlots(),
    isLoading: false,
    isFetching: false,
  }),
  useStaffIntegralAvailableDays: (options: DaysOptions = {}) => {
    staffDaysCalls.push(options);
    const fallo = options.enabled !== false && staffFalla();
    return {
      days: options.enabled === false || fallo ? [] : integralDays(),
      isLoading: false,
      isError: fallo,
      refetch: reintentarStaff,
    };
  },
  useIntegralAvailableDays: (options: DaysOptions = {}) => {
    patientDaysCalls.push(options);
    return {
      days: options.enabled === false ? [] : integralDays(),
      isLoading: false,
      isError: false,
      refetch: reintentarPaciente,
    };
  },
}));

/** El selector de horas de siempre, reducido a elegir una. */
vi.mock("../Select/TimeSlotSelect", () => ({
  TimeSlotSelect: ({
    onValueChange,
    disabled,
  }: {
    onValueChange: (hour: string) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      data-testid="selector-de-hora"
      disabled={disabled}
      onClick={() => onValueChange("11:00")}
    >
      Elegir las 11:00
    </button>
  ),
}));

const TURNO_COMUN = {
  type: "appointment" as const,
  id: 6,
  doctorId: 388,
  date: "2026-08-20",
  hour: "15:00",
  consultationTypeId: 4,
  doctor: { userId: 388, firstName: "Victoria", lastName: "Tudela" },
  patient: { firstName: "Ana", lastName: "Pérez" },
};

/** El turno es la CONSULTA del control; la otra pata es la ecografía. */
const VINCULO_CONSULTA: IntegralCheckupLink = {
  role: "CONSULTATION",
  counterpartType: "APPOINTMENT",
  counterpartId: 7,
  counterpartDoctorId: 176,
  counterpartDoctorFirstName: "Andrea",
  counterpartDoctorLastName: "Torri",
  counterpartDate: "2026-08-20",
  counterpartHour: "15:30",
  counterpartDescription: "Ecografía",
};

/** El turno es la ECOGRAFÍA; la otra pata (la consulta) es el turno 5. */
const VINCULO_ECO: IntegralCheckupLink = {
  role: "ULTRASOUND",
  counterpartType: "APPOINTMENT",
  counterpartId: 5,
  counterpartDoctorId: 388,
  counterpartDoctorFirstName: "Victoria",
  counterpartDoctorLastName: "Tudela",
  counterpartDate: "2026-08-20",
  counterpartHour: "15:00",
  counterpartDescription: "Control Ginecológico Integral",
};

const rechazo = (message: string) =>
  vi.fn().mockRejectedValue({ response: { data: { message } } });

describe("RescheduleAppointmentDialog · el error del backend se muestra", () => {
  beforeEach(() => {
    showError.mockClear();
    showSuccess.mockClear();
    rangeSlots.mockReturnValue([
      { date: "2026-08-27", hour: "11:00" },
      { date: "2026-08-27", hour: "11:30" },
    ]);
    integralDays.mockReturnValue([DIA_ACTUAL, OTRO_DIA]);
    comoSecretaria();
    staffFalla.mockReturnValue(false);
    reintentarStaff.mockClear();
    staffDaysCalls.length = 0;
    patientDaysCalls.length = 0;
  });

  const abrir = (props: Partial<{
    onReschedule: (id: number, dto: { date: string; hour: string }) => Promise<void>;
    onOpenChange: (open: boolean) => void;
    integralCheckup: IntegralCheckupLink;
  }> = {}) => {
    const onReschedule = props.onReschedule ?? vi.fn().mockResolvedValue(undefined);
    const onOpenChange = props.onOpenChange ?? vi.fn();
    render(
      <RescheduleAppointmentDialog
        open
        onOpenChange={onOpenChange}
        appointment={TURNO_COMUN}
        onReschedule={onReschedule}
        isRescheduling={false}
        integralCheckup={props.integralCheckup}
      />,
    );
    return { user: userEvent.setup(), onReschedule, onOpenChange };
  };

  const elegirFechaYHora = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole("button", { name: /27\/08/ }));
    await user.click(screen.getByTestId("selector-de-hora"));
  };

  it("si el backend rechaza la reprogramación, muestra el mensaje del backend", async () => {
    const onReschedule = rechazo(
      "El control ginecológico integral de ese día es a las 15:00. Elegí uno de los horarios disponibles.",
    );
    const { user } = abrir({ onReschedule });

    await elegirFechaYHora(user);
    await user.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(
        "Error",
        "El control ginecológico integral de ese día es a las 15:00. Elegí uno de los horarios disponibles.",
      );
    });
  });

  it("con el diálogo abierto y el error mostrado, el turno se puede corregir", async () => {
    const onReschedule = rechazo("Ese horario ya está ocupado.");
    const { user, onOpenChange } = abrir({ onReschedule });

    await elegirFechaYHora(user);
    await user.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => expect(showError).toHaveBeenCalled());
    // El diálogo NO se cierra cuando el backend rechaza: cerrarlo escondería
    // el turno que hay que corregir.
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("si el backend no manda mensaje, igual dice que no se pudo", async () => {
    const onReschedule = vi.fn().mockRejectedValue(new Error("Network Error"));
    const { user } = abrir({ onReschedule });

    await elegirFechaYHora(user);
    await user.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(
        "Error",
        "No se pudo reprogramar el turno",
      );
    });
  });

  it("cuando sale bien, cierra el diálogo y no muestra ningún error", async () => {
    const { user, onOpenChange, onReschedule } = abrir();

    await elegirFechaYHora(user);
    await user.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => {
      expect(onReschedule).toHaveBeenCalledWith(6, {
        date: "2026-08-27",
        hour: "11:00",
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(showError).not.toHaveBeenCalled();
  });

  /**
   * No-regresión: el recorrido del turno común no cambió en nada. Elegir la
   * hora está bien cuando el turno es uno cualquiera; lo que no se puede es
   * ofrecer horas sueltas para un control.
   */
  it("un turno común conserva el selector de hora de siempre", () => {
    abrir();

    expect(screen.getByTestId("selector-de-hora")).toBeInTheDocument();
    expect(screen.getByText("Nuevo horario")).toBeInTheDocument();
    expect(screen.getByText("Nueva fecha")).toBeInTheDocument();
  });
});

/**
 * Reprogramar un control se parece al ALTA del control, no a mover un turno.
 *
 * 🔴 Un control tiene UNA sola hora por día —la de la grilla— y las dos patas
 * se mueven juntas. Ofrecerle a la secretaria los huecos libres de la agenda
 * era invitarla a elegir algo que el backend iba a rechazar. Acá se eligen
 * DÍAS, y cada día muestra sus dos horas, igual que en el alta.
 *
 * 🔴 Las horas salen del backend, siempre: el front no deriva una de la otra
 * ni sabe cuál va primero.
 */
describe("RescheduleAppointmentDialog · control integral", () => {
  beforeEach(() => {
    showError.mockClear();
    showSuccess.mockClear();
    integralDays.mockReturnValue([DIA_ACTUAL, OTRO_DIA]);
    comoSecretaria();
    staffFalla.mockReturnValue(false);
    reintentarStaff.mockClear();
    staffDaysCalls.length = 0;
    patientDaysCalls.length = 0;
  });

  const abrirControl = (
    props: Partial<{
      onReschedule: (id: number, dto: { date: string; hour: string }) => Promise<void>;
      integralCheckup: IntegralCheckupLink;
    }> = {},
  ) => {
    const onReschedule =
      props.onReschedule ?? vi.fn().mockResolvedValue(undefined);
    render(
      <RescheduleAppointmentDialog
        open
        onOpenChange={vi.fn()}
        appointment={TURNO_COMUN}
        onReschedule={onReschedule}
        isRescheduling={false}
        integralCheckup={props.integralCheckup ?? VINCULO_CONSULTA}
      />,
    );
    return { user: userEvent.setup(), onReschedule };
  };

  it("no ofrece elegir la hora: el control tiene una sola por día", () => {
    abrirControl();

    expect(screen.queryByTestId("selector-de-hora")).not.toBeInTheDocument();
    expect(screen.queryByText("Nuevo horario")).not.toBeInTheDocument();
  });

  it("ofrece los días de la grilla, cada uno con sus dos horas", async () => {
    abrirControl();

    const dia = await screen.findByRole("button", { name: /27 de agosto/i });

    expect(dia).toHaveTextContent("Consulta 15:00 hs");
    expect(dia).toHaveTextContent("Ecografía 15:30 hs");
  });

  it("las horas salen del backend: si se invierten, las sigue", async () => {
    integralDays.mockReturnValue([OTRO_DIA_ECO_PRIMERO]);
    abrirControl();

    const dia = await screen.findByRole("button", { name: /27 de agosto/i });

    expect(dia).toHaveTextContent("Ecografía 10:05 hs · Consulta 10:20 hs");
  });

  it("manda la hora de la CONSULTA cuando se mueve esa pata", async () => {
    const { user, onReschedule } = abrirControl();

    await user.click(screen.getByRole("button", { name: /27 de agosto/i }));
    await user.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => {
      expect(onReschedule).toHaveBeenCalledWith(6, {
        date: "2026-08-27",
        hour: "15:00",
      });
    });
  });

  it("manda la hora de la ECOGRAFÍA cuando se mueve esa pata", async () => {
    const { user, onReschedule } = abrirControl({
      integralCheckup: VINCULO_ECO,
    });

    await user.click(screen.getByRole("button", { name: /27 de agosto/i }));
    await user.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => {
      expect(onReschedule).toHaveBeenCalledWith(6, {
        date: "2026-08-27",
        hour: "15:30",
      });
    });
  });

  /**
   * El día donde el control ya está lo ocupa el propio control: si no se lo
   * excluye del cálculo, el listado esconde justo el día donde la secretaria
   * está parada. La exclusión se pide por el turno de la CONSULTA, que es el
   * que ocupa el casillero de la ginecóloga.
   */
  it("le pide al backend que no cuente el propio control como ocupado", () => {
    abrirControl();

    expect(staffDaysCalls).toContainEqual(
      expect.objectContaining({ excludeAppointmentId: 6 }),
    );
  });

  it("moviendo la ecografía, excluye igual el turno de la consulta", () => {
    abrirControl({ integralCheckup: VINCULO_ECO });

    expect(staffDaysCalls).toContainEqual(
      expect.objectContaining({ excludeAppointmentId: 5 }),
    );
  });

  it("el día donde el control ya está sigue en la lista, sin poder confirmarlo", async () => {
    const { user } = abrirControl();

    const diaActual = screen.getByRole("button", { name: /20 de agosto/i });
    expect(diaActual).toBeInTheDocument();

    await user.click(diaActual);

    // Está, se ve, pero mover el control al día donde ya está no es mover
    // nada: el backend lo rechaza y el botón no lo ofrece.
    expect(screen.getByRole("button", { name: "Reprogramar" })).toBeDisabled();
  });

  it("también acá el error del backend se muestra", async () => {
    const onReschedule = rechazo(
      "El control ginecológico integral de ese día es a las 15:00. Elegí uno de los horarios disponibles.",
    );
    const { user } = abrirControl({ onReschedule });

    await user.click(screen.getByRole("button", { name: /27 de agosto/i }));
    await user.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(
        "Error",
        "El control ginecológico integral de ese día es a las 15:00. Elegí uno de los horarios disponibles.",
      );
    });
  });

  it("en el turnero los días salen del endpoint del personal", () => {
    abrirControl();

    expect(staffDaysCalls).toContainEqual(
      expect.objectContaining({ enabled: true }),
    );
    expect(patientDaysCalls.every((call) => call.enabled === false)).toBe(true);
  });

  it("en el portal de la paciente salen del endpoint de la paciente", () => {
    // 🔴 El endpoint del personal le contesta 403 a una paciente: cuál se
    // pregunta sale del rol, no del lugar donde se montó el diálogo.
    comoPaciente();
    abrirControl();

    expect(patientDaysCalls).toContainEqual(
      expect.objectContaining({ enabled: true }),
    );
    expect(staffDaysCalls.every((call) => call.enabled === false)).toBe(true);
  });
});

/**
 * Quién mira cuál de los dos listados de días.
 *
 * 🔴 Este diálogo vive en dos pantallas (el turnero y `/mis-turnos`) y hay
 * **dos endpoints para cuatro roles**. Decidirlo por negación —"¿no es
 * paciente?"— mandaba a la médica al listado de secretaría, que le contesta
 * **403**: entraba a su agenda, apretaba Reprogramar y el listado quedaba
 * muerto. Se decide por capacidad, con la lista del personal escrita en un
 * solo lugar (`integralDaysSource`), y lo que el backend rechaza **se ve**.
 */
describe("RescheduleAppointmentDialog · de dónde salen los días", () => {
  beforeEach(() => {
    showError.mockClear();
    integralDays.mockReturnValue([DIA_ACTUAL, OTRO_DIA]);
    comoSecretaria();
    staffFalla.mockReturnValue(false);
    reintentarStaff.mockClear();
    staffDaysCalls.length = 0;
    patientDaysCalls.length = 0;
  });

  const abrirControl = () =>
    render(
      <RescheduleAppointmentDialog
        open
        onOpenChange={vi.fn()}
        appointment={TURNO_COMUN}
        onReschedule={vi.fn().mockResolvedValue(undefined)}
        isRescheduling={false}
        integralCheckup={VINCULO_CONSULTA}
      />,
    );

  it("la médica mueve su control con el listado del personal", () => {
    comoMedica();
    abrirControl();

    expect(staffDaysCalls).toContainEqual(
      expect.objectContaining({ enabled: true }),
    );
    expect(patientDaysCalls.every((call) => call.enabled === false)).toBe(true);
  });

  it("un rol que el front no conoce NO cae en el listado del personal", () => {
    // Antes esto se decidía por descarte (`!isPatient`): cualquier rol nuevo
    // heredaba el endpoint de secretaría y su 403.
    conRolDesconocido();
    abrirControl();

    expect(staffDaysCalls.every((call) => call.enabled === false)).toBe(true);
  });

  it("si el listado del personal falla, se ve el error y se puede reintentar", async () => {
    comoMedica();
    staffFalla.mockReturnValue(true);
    abrirControl();
    const user = userEvent.setup();

    expect(
      screen.getByText("No se pudieron cargar los días"),
    ).toBeInTheDocument();

    // Y no queda muerta: hay por dónde volver a pedirlo sin recargar.
    await user.click(screen.getByRole("button", { name: /reintentar/i }));

    expect(reintentarStaff).toHaveBeenCalled();
  });

  it("cuando falla no dice que no hay días: eso sería mentir", () => {
    comoMedica();
    staffFalla.mockReturnValue(true);
    abrirControl();

    expect(screen.queryByText("Sin días disponibles")).not.toBeInTheDocument();
  });
});

/**
 * Hasta dónde para atrás se puede mover un control.
 *
 * 🔴 El backend arma la lista de días **desde hoy**, y el listado la mostraba
 * tal cual: miércoles 16:00, la secretaria reprogramaba y le ofrecía *"hoy —
 * consulta 10:20 · ecografía 10:40"*. Confirmaba y el control quedaba a una
 * hora que ya pasó. El camino común de este mismo diálogo no lo permite: el
 * calendario deshabilita todo lo anterior a mañana. El mínimo es el mismo para
 * los dos: sale del mismo valor, no de dos cuentas parecidas.
 */
describe("RescheduleAppointmentDialog · el control no se puede mover a hoy", () => {
  const DIA_DE_HOY: IntegralCheckupSlot = {
    date: HOY,
    consultationHour: "10:20",
    ultrasoundHour: "10:40",
    consultationDoctorId: 388,
    ultrasoundDoctorId: 176,
  };

  const DIA_DE_MANANA: IntegralCheckupSlot = {
    date: MANANA,
    consultationHour: "15:00",
    ultrasoundHour: "15:30",
    consultationDoctorId: 388,
    ultrasoundDoctorId: 176,
  };

  beforeEach(() => {
    comoSecretaria();
    staffFalla.mockReturnValue(false);
    staffDaysCalls.length = 0;
    patientDaysCalls.length = 0;
  });

  const abrirControl = () =>
    render(
      <RescheduleAppointmentDialog
        open
        onOpenChange={vi.fn()}
        appointment={TURNO_COMUN}
        onReschedule={vi.fn().mockResolvedValue(undefined)}
        isRescheduling={false}
        integralCheckup={VINCULO_CONSULTA}
      />,
    );

  /** El texto de los días que quedaron ofrecidos en pantalla. */
  const diasOfrecidos = () =>
    screen
      .queryAllByRole("button")
      .filter((boton) => boton.hasAttribute("aria-pressed"))
      .map((boton) => boton.textContent ?? "");

  const fragmento = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
    });

  it("aunque el backend lo mande, hoy no se ofrece", () => {
    integralDays.mockReturnValue([DIA_DE_HOY, DIA_DE_MANANA, OTRO_DIA]);
    abrirControl();

    expect(
      diasOfrecidos().some((texto) => texto.includes(fragmento(HOY))),
    ).toBe(false);
  });

  it("mañana sí: el mínimo es el mismo que el del turno común", () => {
    integralDays.mockReturnValue([DIA_DE_HOY, DIA_DE_MANANA, OTRO_DIA]);
    abrirControl();

    expect(
      diasOfrecidos().some((texto) => texto.includes(fragmento(MANANA))),
    ).toBe(true);
  });

  it("si lo único que quedaba era hoy, lo dice en vez de mostrarlo", () => {
    integralDays.mockReturnValue([DIA_DE_HOY]);
    abrirControl();

    expect(screen.getByText("Sin días disponibles")).toBeInTheDocument();
  });
});
