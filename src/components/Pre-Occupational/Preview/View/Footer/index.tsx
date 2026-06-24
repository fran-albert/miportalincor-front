// components/FooterHtmlConditional.tsx
import React from "react";
import { pdfColors } from "../../Pdf/shared";
import {
  LaborReportSignaturePresentationMode,
  LaborReportSignerDisplay,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import {
  getInstitutionalSignerForSection,
  resolveStampTextLines,
} from "../../signature-policy";

interface Props {
  pageNumber: number;
  useCustom?: boolean;
  presentationMode?: LaborReportSignaturePresentationMode;
  institutionalSigner?: LaborReportSignerDisplay;
  doctorName?: string;
  doctorLicense?: string;
  doctorSpeciality?: string;
  doctorStampText?: string;
  signatureUrl?: string;
  sealUrl?: string;
}

const FooterHtmlConditional: React.FC<Props> = ({
  pageNumber,
  useCustom = false,
  presentationMode = "signature_and_text",
  institutionalSigner,
  doctorName,
  doctorLicense,
  doctorSpeciality,
  doctorStampText,
  signatureUrl,
  sealUrl,
}) => {
  const defaultSigner =
    institutionalSigner ?? getInstitutionalSignerForSection("cover");
  const name = useCustom && doctorName ? doctorName : defaultSigner.name;
  const licence =
    useCustom && doctorLicense ? doctorLicense : defaultSigner.license;
  const speciality =
    useCustom && doctorSpeciality
      ? doctorSpeciality
      : defaultSigner.specialty;
  const resolvedStampText = useCustom ? doctorStampText : defaultSigner.stampText;
  const sigUrl = useCustom ? signatureUrl : defaultSigner.signatureUrl;
  const sealImageUrl = useCustom ? sealUrl : defaultSigner.sealUrl;
  const stampLines = resolveStampTextLines({
    stampText: resolvedStampText,
    name,
    specialty: speciality,
    license: licence,
  });
  const shouldShowSignature =
    presentationMode !== "text_only" && Boolean(sigUrl);
  const shouldShowSeal =
    presentationMode === "signature_seal_and_text" && Boolean(sealImageUrl);

  return (
    <div
      className="relative mt-1 w-full border-t pt-[5px] text-black"
      style={{ borderTopColor: pdfColors.line }}
    >
      <div className="min-h-[46px] pr-6">
        {shouldShowSignature ? (
          <div className="relative mb-px h-[32px]">
            <img
              src={sigUrl}
              alt={`Firma ${name}`}
              className="h-[30px] w-[100px] object-contain"
            />
            {shouldShowSeal ? (
              <img
                src={sealImageUrl!}
                alt={`Sello ${name}`}
                className="h-[40px] w-[40px] object-contain"
                style={{
                  position: "absolute",
                  left: 58,
                  bottom: -1,
                  opacity: 0.88,
                }}
              />
            ) : null}
          </div>
        ) : (
          <div className="mb-1 h-[8px]" />
        )}
        <div className="space-y-px">
          {stampLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className={
                index === 0
                  ? "text-[8.2px] font-medium leading-tight"
                  : "text-[6.8px] leading-tight"
              }
              style={{ color: index === 0 ? pdfColors.ink : pdfColors.muted }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-[18px] text-right">
        <p className="text-[8.6px] font-bold" style={{ color: pdfColors.ink }}>
          {pageNumber}
        </p>
      </div>
    </div>
  );
};

export default FooterHtmlConditional;
