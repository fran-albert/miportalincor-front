import React from "react";
import HeaderPreviewHtml from "../Header";
import FooterHtmlConditional from "./Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import {
  LaborReportBrandingConfig,
  LaborReportSignaturePresentationMode,
  LaborReportSignerDisplay,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface PreviewPageShellProps {
  children: React.ReactNode;
  pageNumber: number;
  examType: string;
  evaluationType: string;
  brandingConfig?: LaborReportBrandingConfig;
  institutionalSigner?: LaborReportSignerDisplay;
  presentationMode?: LaborReportSignaturePresentationMode;
  doctorData?: DoctorSignatures;
  useCustomSignature?: boolean;
  contentClassName?: string;
}

const PreviewPageShell: React.FC<PreviewPageShellProps> = ({
  children,
  pageNumber,
  examType,
  evaluationType,
  brandingConfig,
  institutionalSigner,
  presentationMode = "signature_and_text",
  doctorData,
  useCustomSignature = false,
  contentClassName = "",
}) => {
  return (
    <section className="mx-auto mb-6 flex min-h-[297mm] w-[210mm] flex-col bg-white px-[20px] py-[20px] text-[10px] text-slate-900 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] print:mb-0 print:shadow-none">
      <HeaderPreviewHtml
        examType={examType}
        evaluationType={evaluationType}
        brandingConfig={brandingConfig}
      />
      <div className={`flex flex-1 flex-col ${contentClassName}`.trim()}>
        {children}
      </div>
      <FooterHtmlConditional
        pageNumber={pageNumber}
        useCustom={Boolean(useCustomSignature && doctorData)}
        institutionalSigner={institutionalSigner}
        presentationMode={presentationMode}
        doctorLicense={doctorData?.matricula}
        doctorName={doctorData?.fullName}
        doctorSpeciality={doctorData?.specialty}
        doctorStampText={doctorData?.stampText}
        signatureUrl={doctorData?.signatureDataUrl}
        sealUrl={doctorData?.sealDataUrl}
      />
    </section>
  );
};

export default PreviewPageShell;
