export type LaborReportSignatureMode =
  | "institutional_signer"
  | "exam_doctor";

export type LaborReportSignaturePresentationMode =
  | "signature_and_text"
  | "signature_seal_and_text"
  | "text_only";

export type LaborReportSignatureSection = "cover" | "clinical" | "studies";

export type LaborReportSignerType = "institutional" | "doctor-linked";

export interface LaborReportSigner {
  id: number;
  signerKey: string;
  name: string;
  license: string | null;
  specialty: string | null;
  signatureUrl: string | null;
  sealUrl: string | null;
  stampText: string | null;
  hcDoctorUserId: string | null;
  signerType: LaborReportSignerType;
  active: boolean;
}

export interface LaborReportSignaturePolicy {
  id: number;
  reportType: string;
  section: LaborReportSignatureSection;
  mode: LaborReportSignatureMode;
  presentationMode: LaborReportSignaturePresentationMode;
  signer: LaborReportSigner | null;
}

export interface LaborReportBrandingConfig {
  id: number;
  institutionName: string;
  logoUrl: string | null;
  headerAddress: string | null;
  footerLegalText: string | null;
  active: boolean;
  signers: LaborReportSigner[];
  policies: LaborReportSignaturePolicy[];
}

export interface LaborReportSignerDisplay {
  name: string;
  license: string;
  specialty: string;
  signatureUrl: string;
  sealUrl?: string | null;
  stampText?: string | null;
}

export interface UpdateLaborReportBrandingConfigInput {
  institutionName?: string;
  logoUrl?: string | null;
  headerAddress?: string | null;
  footerLegalText?: string | null;
  active?: boolean;
}

export interface UpsertLaborReportSignerInput {
  id?: number;
  signerKey: string;
  name: string;
  license?: string | null;
  specialty?: string | null;
  signatureUrl?: string | null;
  sealUrl?: string | null;
  stampText?: string | null;
  hcDoctorUserId?: string | null;
  signerType: LaborReportSignerType;
  active?: boolean;
}

export interface ReplaceLaborReportSignersInput {
  signers: UpsertLaborReportSignerInput[];
}

export interface UpsertLaborReportSignaturePolicyInput {
  id?: number;
  reportType: string;
  section: LaborReportSignatureSection;
  mode: LaborReportSignatureMode;
  presentationMode: LaborReportSignaturePresentationMode;
  signerId?: number | null;
}

export interface ReplaceLaborReportSignaturePoliciesInput {
  policies: UpsertLaborReportSignaturePolicyInput[];
}
