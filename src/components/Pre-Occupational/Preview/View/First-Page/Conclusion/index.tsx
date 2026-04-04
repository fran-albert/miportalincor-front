import React from "react";
import { pdfColors } from "../../../Pdf/shared";

interface ConclusionHtmlProps {
  conclusion: string;
  recomendaciones: string;
}

const ConclusionHtml: React.FC<ConclusionHtmlProps> = ({
  conclusion,
  recomendaciones,
}) => {
  return (
    <div className="space-y-2.5">
      <div
        className="overflow-hidden rounded-[8px] border"
        style={{ borderColor: pdfColors.line }}
      >
        <div
          className="border-b px-[10px] py-[6px]"
          style={{
            backgroundColor: pdfColors.surface,
            borderBottomColor: pdfColors.line,
          }}
        >
          <p
            className="text-[9px] font-bold uppercase tracking-[0.08em]"
            style={{ color: pdfColors.accentText }}
          >
            Conclusion
          </p>
        </div>
        <div className="px-[10px] py-[8px]">
          <p
            className="text-[8px] leading-[1.22]"
            style={{ color: pdfColors.ink }}
          >
            {conclusion || "Sin conclusion registrada"}
          </p>
        </div>
      </div>

      {recomendaciones ? (
        <div
          className="overflow-hidden rounded-[8px] border"
          style={{ borderColor: pdfColors.line }}
        >
          <div
            className="border-b px-[10px] py-[6px]"
            style={{
              backgroundColor: pdfColors.surface,
              borderBottomColor: pdfColors.line,
            }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-[0.08em]"
              style={{ color: pdfColors.accentText }}
            >
              Recomendaciones
            </p>
          </div>
          <div className="px-[10px] py-[8px]">
            <p
              className="text-[8px] leading-[1.22]"
              style={{ color: pdfColors.ink }}
            >
              {recomendaciones}
            </p>
          </div>
        </div>
      ) : null}

      <p
        className="pt-0.5 text-center text-[7px]"
        style={{ color: pdfColors.muted }}
      >
          Ley Nacional 19.587, Dto. 1338/96, Ley Nacional 24.557 y Res. 37/10
      </p>
    </div>
  );
};

export default ConclusionHtml;
