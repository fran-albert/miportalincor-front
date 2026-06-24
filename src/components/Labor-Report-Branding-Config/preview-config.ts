import {
  LaborReportBrandingConfig,
  LaborReportSigner,
  ReplaceLaborReportSignaturePoliciesInput,
  ReplaceLaborReportSignersInput,
  UpdateLaborReportBrandingConfigInput,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import { resolveLaborReportBrandingConfig } from "@/components/Pre-Occupational/Preview/signature-policy";

const normalizeNullable = (value?: string | null) => value?.trim() || null;

const mapPreviewSigners = (
  signerDrafts: ReplaceLaborReportSignersInput["signers"]
): LaborReportSigner[] =>
  signerDrafts.map((signer, index) => ({
    id: signer.id ?? -(index + 1),
    signerKey: signer.signerKey || `signer_${index + 1}`,
    name: signer.name || `Firmante ${index + 1}`,
    license: normalizeNullable(signer.license),
    specialty: normalizeNullable(signer.specialty),
    signatureUrl: normalizeNullable(signer.signatureUrl),
    sealUrl: normalizeNullable(signer.sealUrl),
    stampText: normalizeNullable(signer.stampText),
    hcDoctorUserId: normalizeNullable(signer.hcDoctorUserId),
    signerType: signer.signerType,
    active: signer.active ?? true,
  }));

export const buildPreviewBrandingConfig = ({
  baseConfig,
  brandingDraft,
  signerDrafts,
  policyDrafts,
}: {
  baseConfig: LaborReportBrandingConfig;
  brandingDraft: UpdateLaborReportBrandingConfigInput;
  signerDrafts: ReplaceLaborReportSignersInput["signers"];
  policyDrafts: ReplaceLaborReportSignaturePoliciesInput["policies"];
}) => {
  const resolvedBase = resolveLaborReportBrandingConfig(baseConfig);
  const previewSigners = mapPreviewSigners(signerDrafts);

  return resolveLaborReportBrandingConfig({
    ...resolvedBase,
    institutionName:
      brandingDraft.institutionName?.trim() || resolvedBase.institutionName,
    logoUrl: normalizeNullable(brandingDraft.logoUrl) ?? null,
    headerAddress: normalizeNullable(brandingDraft.headerAddress) ?? null,
    footerLegalText: normalizeNullable(brandingDraft.footerLegalText) ?? null,
    active: brandingDraft.active ?? resolvedBase.active,
    signers: previewSigners,
    policies: policyDrafts.map((policy, index) => ({
      id: policy.id ?? -(index + 1),
      reportType: policy.reportType,
      section: policy.section,
      mode: policy.mode,
      presentationMode: policy.presentationMode,
      signer:
        policy.mode === "institutional_signer"
          ? previewSigners.find((signer) => signer.id === policy.signerId) ?? null
          : null,
    })),
  });
};
