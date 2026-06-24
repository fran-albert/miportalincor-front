// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { Collaborator } from "@/types/Collaborator/Collaborator";
import type { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import type { ExamResults } from "@/common/helpers/examsResults.maps";
import type { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";

const footerSpy = vi.fn();

vi.mock("@react-pdf/renderer", () => ({
  Page: ({ children }: React.PropsWithChildren) => (
    <div data-testid="pdf-page">{children}</div>
  ),
  View: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  Image: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
  StyleSheet: {
    create: <T,>(styles: T) => styles,
  },
}));

vi.mock("../Pdf/Footer", () => ({
  default: (props: { useCustom?: boolean; presentationMode?: string }) => {
    footerSpy(props);
    return (
      <div
        data-testid="pdf-footer"
        data-use-custom={props.useCustom ? "true" : "false"}
      />
    );
  },
}));

vi.mock("../Pdf/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../Pdf/Collaborator-Information", () => ({
  default: () => <div>Collaborator information</div>,
}));

vi.mock("../Pdf/First-Page/Exams-Results", () => ({
  default: () => <div>Exam results</div>,
}));

vi.mock("../Pdf/First-Page/Conclusion", () => ({
  default: () => <div>Conclusion</div>,
}));

vi.mock("../Pdf/Second-Page/Clinical-Evaluation", () => ({
  default: () => <div>Clinical evaluation</div>,
}));

vi.mock("../Pdf/Second-Page/Visual", () => ({
  default: () => <div>Visual</div>,
}));

import FirstPagePdfDocument from "../Pdf/First-Page";
import SecondPagePdfDocument from "../Pdf/Second-Page";
import StudyPagePdfDocument from "../Pdf/Study-Page";

const collaborator = {
  id: 1,
  firstName: "Francisco",
  lastName: "Albert",
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

describe("pdf page signature policy", () => {
  beforeEach(() => {
    footerSpy.mockClear();
  });

  it("uses Bonifacio on the first page footer", () => {
    render(
      <FirstPagePdfDocument
        collaborator={collaborator}
        examResults={{} as ExamResults}
        conclusion="Apto"
        recomendaciones=""
        medicalEvaluationType="Preocupacional"
        antecedentes={[]}
        doctorData={doctorData}
      />
    );

    expect(footerSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustom: false,
        presentationMode: "signature_seal_and_text",
      })
    );
  });

  it("uses the exam doctor on the clinical page footer", () => {
    render(
      <SecondPagePdfDocument
        collaborator={collaborator}
        talla="180"
        peso="80"
        imc="24.7"
        medicalEvaluationType="Preocupacional"
        antecedentes={[]}
        doctorData={doctorData}
        aspectoGeneral="Bueno"
        data={{
          agudezaSc: { right: "10/10", left: "10/10" },
          agudezaCc: { right: "10/10", left: "10/10" },
          visionCromatica: "normal",
          notasVision: "",
        } as unknown as IMedicalEvaluation}
      />
    );

    expect(footerSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustom: true,
        presentationMode: "signature_and_text",
      })
    );
  });

  it("uses Bonifacio on study attachment pages", () => {
    render(
      <StudyPagePdfDocument
        studyTitle="Laboratorio"
        studyUrl="https://example.com/study.png"
        pageNumber={6}
        examResults={{ laboratorio: "Normal" } as unknown as ExamResults}
        medicalEvaluationType="Preocupacional"
        doctorData={doctorData}
      />
    );

    expect(footerSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        useCustom: false,
        presentationMode: "signature_seal_and_text",
      })
    );
  });
});
