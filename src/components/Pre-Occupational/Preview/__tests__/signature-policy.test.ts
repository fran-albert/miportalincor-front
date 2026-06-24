import { describe, expect, it } from "vitest";
import {
  getInstitutionalSignerForSection,
  getPresentationModeForSection,
  usesExamDoctorSignature,
} from "../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

describe("report signature policy", () => {
  it("uses Bonifacio on the cover page", () => {
    expect(usesExamDoctorSignature("cover")).toBe(false);
  });

  it("uses the exam doctor on clinical pages", () => {
    expect(usesExamDoctorSignature("clinical")).toBe(true);
  });

  it("uses Bonifacio on study attachment pages", () => {
    expect(usesExamDoctorSignature("study")).toBe(false);
  });

  it("uses backend policies when they are available", () => {
    const config: LaborReportBrandingConfig = {
      id: 1,
      institutionName: "Instituto Demo",
      logoUrl: "https://example.com/logo.png",
      headerAddress: null,
      footerLegalText: null,
      active: true,
      signers: [
        {
          id: 10,
          signerKey: "demo_signer",
          name: "Dra. Demo",
          license: "M.P. 123",
          specialty: "Medicina Laboral",
          signatureUrl: "https://example.com/signature.png",
          sealUrl: "https://example.com/seal.png",
          stampText: "Dra. Demo\nMedicina Laboral\nM.P. 123",
          hcDoctorUserId: null,
          signerType: "institutional",
          active: true,
        },
      ],
      policies: [
        {
          id: 100,
          reportType: "PREOCUPACIONAL",
          section: "cover",
          mode: "exam_doctor",
          presentationMode: "signature_and_text",
          signer: null,
        },
        {
          id: 101,
          reportType: "PREOCUPACIONAL",
          section: "studies",
          mode: "institutional_signer",
          presentationMode: "signature_seal_and_text",
          signer: {
            id: 10,
            signerKey: "demo_signer",
            name: "Dra. Demo",
            license: "M.P. 123",
            specialty: "Medicina Laboral",
            signatureUrl: "https://example.com/signature.png",
            sealUrl: "https://example.com/seal.png",
            stampText: "Dra. Demo\nMedicina Laboral\nM.P. 123",
            hcDoctorUserId: null,
            signerType: "institutional",
            active: true,
          },
        },
      ],
    };

    expect(usesExamDoctorSignature("cover", config, "Preocupacional")).toBe(
      true
    );
    expect(
      getInstitutionalSignerForSection("studies", config, "Preocupacional").name
    ).toBe("Dra. Demo");
    expect(
      getPresentationModeForSection("studies", config, "Preocupacional")
    ).toBe("signature_seal_and_text");
  });
});
