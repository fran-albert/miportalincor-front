// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { Collaborator } from "@/types/Collaborator/Collaborator";
import type { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import type { PhysicalEvaluation } from "@/common/helpers/maps";
import type { ExamResults } from "@/common/helpers/examsResults.maps";

const previewPageShellSpy = vi.fn();

vi.mock("../View/PageShell", () => ({
  default: (
    props: React.PropsWithChildren<{
      useCustomSignature?: boolean;
      presentationMode?: string;
    }>
  ) => {
    previewPageShellSpy(props);
    return <div data-testid="preview-page-shell">{props.children}</div>;
  },
}));

vi.mock("../Collaborator-Information", () => ({
  default: () => <div>Collaborator information</div>,
}));

vi.mock("../View/First-Page/Exams-Results", () => ({
  default: () => <div>Exam results</div>,
}));

vi.mock("../View/First-Page/Conclusion", () => ({
  default: () => <div>Conclusion</div>,
}));

vi.mock("../View/Second-Page/Clinical-Evaluation", () => ({
  default: () => <div>Clinical evaluation</div>,
}));

vi.mock("../View/Second-Page/Visual", () => ({
  default: () => <div>Visual</div>,
}));

vi.mock("../View/Third-Page/Piel", () => ({
  default: () => <div>Piel</div>,
}));

vi.mock("../View/Second-Page/CabezaCuello", () => ({
  default: () => <div>Cabeza y cuello</div>,
}));

vi.mock("../View/Third-Page/Bucodental", () => ({
  default: () => <div>Bucodental</div>,
}));

vi.mock("../View/Third-Page/Torax", () => ({
  default: () => <div>Torax</div>,
}));

vi.mock("../View/Third-Page/Respiratorio", () => ({
  default: () => <div>Respiratorio</div>,
}));

vi.mock("../View/Third-Page/Circulatorio", () => ({
  default: () => <div>Circulatorio</div>,
}));

vi.mock("../View/Fourth-Page/Neurologico", () => ({
  default: () => <div>Neurologico</div>,
}));

vi.mock("../View/Fourth-Page/Gastrointestinal", () => ({
  default: () => <div>Gastrointestinal</div>,
}));

vi.mock("../View/Fourth-Page/Genitourinario", () => ({
  default: () => <div>Genitourinario</div>,
}));

vi.mock("../View/Fourth-Page/Osteoarticular", () => ({
  default: () => <div>Osteoarticular</div>,
}));

import FirstPageHTML from "../View/First-Page";
import SecondPageHTML from "../View/Second-Page";
import ThirdPageHTML from "../View/Third-Page";
import FourthPageHTML from "../View/Fourth-Page";
import FifthPageHTML from "../View/Fifth-Page";
import StudyPageHtml from "../View/Study-Page";

const collaborator = {
  id: 1,
  firstName: "Francisco",
  lastName: "Albert",
  gender: "Masculino",
  company: {
    bussinesName: "INCOR",
  },
} as unknown as Collaborator;

const doctorData = {
  fullName: "Dra. Ana Torres",
  matricula: "M.P. 123",
  specialty: "Clínica médica",
  stampText: "Dra. Ana Torres\nClínica médica\nM.P. 123",
  signatureDataUrl: "https://example.com/signature.png",
  sealDataUrl: "https://example.com/seal.png",
} as DoctorSignatures;

describe("preview page signature policy", () => {
  beforeEach(() => {
    previewPageShellSpy.mockClear();
  });

  it("uses Bonifacio on the first page", () => {
    render(
      <FirstPageHTML
        collaborator={collaborator}
        examResults={{} as ExamResults}
        conclusion="Apto"
        medicalEvaluationType="Preocupacional"
        antecedentes={[]}
        recomendaciones=""
        doctorData={doctorData}
      />
    );

    expect(previewPageShellSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustomSignature: false,
        presentationMode: "signature_seal_and_text",
      })
    );
  });

  it("uses the exam doctor on clinical pages", () => {
    render(
      <SecondPageHTML
        collaborator={collaborator}
        talla="180"
        peso="80"
        imc="24.7"
        medicalEvaluationType="Preocupacional"
        perimetroAbdominal="90"
        aspectoGeneral="Bueno"
        tiempoLibre=""
        frecuenciaCardiaca="70"
        frecuenciaRespiratoria="16"
        presionSistolica="120"
        presionDiastolica="80"
        examenFisico={{} as PhysicalEvaluation}
        antecedentes={[]}
        visualWithout={{ right: "10/10", left: "10/10" }}
        visualWith={{ right: "10/10", left: "10/10" }}
        visualChromatic="normal"
        doctorData={doctorData}
      />
    );

    expect(previewPageShellSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustomSignature: true,
        presentationMode: "signature_and_text",
      })
    );
  });

  it("keeps the clinical signature on later clinical pages", () => {
    render(
      <ThirdPageHTML
        bucodental={{ sinAlteraciones: true }}
        torax={{ cicatrices: false }}
        doctorData={doctorData}
        pielData={{ observaciones: "Sin lesiones" }}
        cabezaCuello={{ sinAlteraciones: true }}
        medicalEvaluationType="Preocupacional"
      />
    );

    expect(previewPageShellSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustomSignature: true,
        presentationMode: "signature_and_text",
      })
    );
  });

  it("keeps the clinical signature on fourth and fifth pages", () => {
    render(
      <FourthPageHTML
        neurologico={{ sinAlteraciones: true }}
        respiratorio={{ sinAlteraciones: true }}
        circulatorio={{ sinAlteraciones: true }}
        doctorData={doctorData}
        medicalEvaluationType="Preocupacional"
      />
    );

    expect(previewPageShellSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustomSignature: true,
        presentationMode: "signature_and_text",
      })
    );

    render(
      <FifthPageHTML
        collaboratorGender="Masculino"
        gastrointestinal={{ sinAlteraciones: true }}
        genitourinario={{ sinAlteraciones: true }}
        osteoarticular={{ mmssSin: true }}
        doctorData={doctorData}
        medicalEvaluationType="Preocupacional"
      />
    );

    expect(previewPageShellSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustomSignature: true,
        presentationMode: "signature_and_text",
      })
    );
  });

  it("uses Bonifacio on study attachment pages", () => {
    render(
      <StudyPageHtml
        studyTitle="Laboratorio"
        studyUrl="https://example.com/study.png"
        pageNumber={6}
        examResults={{ laboratorio: "Normal" } as unknown as ExamResults}
        medicalEvaluationType="Preocupacional"
        doctorData={doctorData}
      />
    );

    expect(previewPageShellSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustomSignature: false,
        presentationMode: "signature_seal_and_text",
      })
    );
  });
});
