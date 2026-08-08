import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegralCheckupNotice } from "./IntegralCheckupNotice";
import type { IntegralCheckupLink } from "@/types/Appointment/Appointment";

const ultrasoundLink: IntegralCheckupLink = {
  role: "CONSULTATION",
  counterpartType: "OVERTURN",
  counterpartId: 900,
  counterpartDoctorId: 176,
  counterpartDoctorFirstName: "Andrea",
  counterpartDoctorLastName: "Torri",
  counterpartDate: "2027-03-10",
  counterpartHour: "10:05",
  counterpartDescription: "Ecografía Ginecológica, Ecografía Mamaria",
};

const consultationLink: IntegralCheckupLink = {
  role: "ULTRASOUND",
  counterpartType: "APPOINTMENT",
  counterpartId: 800,
  counterpartDoctorId: 388,
  counterpartDoctorFirstName: "Victoria",
  counterpartDoctorLastName: "Tudela",
  counterpartDate: "2027-03-10",
  counterpartHour: "10:20",
  counterpartDescription: "Consulta ginecológica",
};

describe("IntegralCheckupNotice", () => {
  it("desde la consulta muestra la ecografía de la colega", () => {
    render(<IntegralCheckupNotice link={ultrasoundLink} />);

    expect(
      screen.getByText(/es parte de un control integral/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/la ecografía de las 10:05/i)).toBeInTheDocument();
    expect(screen.getByText(/Dra\. Andrea Torri/i)).toBeInTheDocument();
  });

  it("desde la ecografía muestra la consulta de la colega", () => {
    render(<IntegralCheckupNotice link={consultationLink} />);

    expect(screen.getByText(/la consulta de las 10:20/i)).toBeInTheDocument();
    expect(screen.getByText(/Dra\. Victoria Tudela/i)).toBeInTheDocument();
  });

  it("al cancelar avisa que se cancelan los dos", () => {
    render(<IntegralCheckupNotice link={ultrasoundLink} action="cancel" />);

    expect(
      screen.getByText(/al cancelar se cancelan los dos/i),
    ).toBeInTheDocument();
  });

  it("al reprogramar avisa que se mueven los dos manteniendo los 15 minutos", () => {
    render(<IntegralCheckupNotice link={ultrasoundLink} action="reschedule" />);

    expect(screen.getByText(/se mueven los dos/i)).toBeInTheDocument();
    expect(screen.getByText(/15 minutos/i)).toBeInTheDocument();
  });

  it("sin acción no promete nada sobre cancelar ni mover", () => {
    render(<IntegralCheckupNotice link={ultrasoundLink} />);

    expect(screen.queryByText(/se cancelan los dos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/se mueven los dos/i)).not.toBeInTheDocument();
  });
});
