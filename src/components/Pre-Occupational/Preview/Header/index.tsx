import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { pdfColors } from "../Pdf/shared";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import { resolveLaborReportBrandingConfig } from "../signature-policy";

interface HeaderPreviewHtmlProps {
  evaluationType: string;
  examType: string;
  brandingConfig?: LaborReportBrandingConfig;
}

const HeaderPreviewHtml: React.FC<HeaderPreviewHtmlProps> = ({
  evaluationType,
  examType,
  brandingConfig,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });
  const resolvedBranding = resolveLaborReportBrandingConfig(brandingConfig);

  return (
    <div
      className="mb-[14px] overflow-hidden rounded-[8px] border bg-white"
      style={{ borderColor: pdfColors.line }}
    >
      <div
        className="h-[8px]"
        style={{ backgroundColor: pdfColors.accent }}
      />
      <div className="flex items-center px-4 py-[14px]">
        <div className="flex w-[110px] items-center justify-start">
          <img
            className="h-[42px] w-[78px] object-contain"
            src={resolvedBranding.logoUrl ?? undefined}
            alt="Logo"
          />
        </div>
        <div
          className="mx-[14px] self-stretch"
          style={{ width: 1, backgroundColor: pdfColors.line }}
        />
        <div className="flex flex-1 flex-col gap-1">
          <span
            className="text-[8px] uppercase tracking-[0.18em]"
            style={{ color: pdfColors.muted }}
          >
            {resolvedBranding.institutionName}
          </span>
          <span
            className="text-[16px] font-bold leading-none"
            style={{ color: pdfColors.accentText }}
          >
            {examType}
          </span>
          <span className="text-[10px]" style={{ color: pdfColors.muted }}>
            {evaluationType}
          </span>
        </div>
        <div className="flex min-w-[72px] flex-col items-end justify-center gap-[3px]">
          <span
            className="text-[7.2px] uppercase tracking-[0.12em]"
            style={{ color: pdfColors.muted }}
          >
            Fecha
          </span>
          <span
            className="text-[9px] font-bold"
            style={{ color: pdfColors.ink }}
          >
            {currentDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderPreviewHtml;
