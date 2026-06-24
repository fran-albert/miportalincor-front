// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FooterHtmlConditional from "../View/Footer";

describe("FooterHtmlConditional", () => {
  const institutionalSigner = {
    name: "Dra. Demo",
    license: "M.P. 456",
    specialty: "Medicina Laboral",
    signatureUrl: "https://example.com/demo-signature.png",
    sealUrl: "https://example.com/demo-seal.png",
    stampText: "Dra. Demo\nMedicina Laboral\nM.P. 456",
  };

  it("falls back to Bonifacio when custom signature is disabled", () => {
    render(
      <FooterHtmlConditional
        pageNumber={1}
        useCustom={false}
        doctorName="Dra. Ana Torres"
        doctorLicense="M.P. 123"
        doctorSpeciality="Cardiología"
        signatureUrl="https://example.com/signature.png"
      />
    );

    expect(screen.getByText("BONIFACIO Ma. CECILIA")).toBeInTheDocument();
    expect(screen.queryByText("Dra. Ana Torres")).not.toBeInTheDocument();
  });

  it("renders the configured institutional signer when provided", () => {
    render(
      <FooterHtmlConditional
        pageNumber={1}
        useCustom={false}
        institutionalSigner={institutionalSigner}
      />
    );

    expect(screen.getByText("Dra. Demo")).toBeInTheDocument();
    expect(screen.queryByText("BONIFACIO Ma. CECILIA")).not.toBeInTheDocument();
  });

  it("renders the exam doctor when custom signature is enabled", () => {
    render(
      <FooterHtmlConditional
        pageNumber={2}
        useCustom
        presentationMode="signature_and_text"
        doctorName="Dra. Ana Torres"
        doctorLicense="M.P. 123"
        doctorSpeciality="Cardiología"
        doctorStampText="Dra. Ana Torres\nCardiología\nM.P. 123"
        signatureUrl="https://example.com/signature.png"
      />
    );

    expect(screen.getByText(/Dra\. Ana Torres/)).toBeInTheDocument();
    expect(screen.queryByText("BONIFACIO Ma. CECILIA")).not.toBeInTheDocument();
  });

  it("does not mix institutional stamp text when the exam doctor has no custom stampText", () => {
    render(
      <FooterHtmlConditional
        pageNumber={2}
        useCustom
        presentationMode="signature_and_text"
        doctorName="Dra. Juliana Albert"
        doctorLicense="M.P. 789"
        doctorSpeciality="Cardiología"
        signatureUrl="https://example.com/juliana-signature.png"
        institutionalSigner={institutionalSigner}
      />
    );

    expect(screen.getByText("Dra. Juliana Albert")).toBeInTheDocument();
    expect(screen.getByText("Cardiología")).toBeInTheDocument();
    expect(screen.getByText("M.P. 789")).toBeInTheDocument();
    expect(screen.queryByText("Dra. Demo")).not.toBeInTheDocument();
    expect(screen.queryByText("Medicina Laboral")).not.toBeInTheDocument();
  });

  it("renders text only when the presentation mode requires it", () => {
    render(
      <FooterHtmlConditional
        pageNumber={3}
        useCustom={false}
        presentationMode="text_only"
        institutionalSigner={institutionalSigner}
      />
    );

    expect(screen.getByText("Dra. Demo")).toBeInTheDocument();
    expect(screen.queryByAltText(/Firma/i)).not.toBeInTheDocument();
  });
});
