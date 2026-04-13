import React from "react";
import { pdfColors } from "../../../Pdf/shared";

interface ClinicalEvaluationHtmlProps {
  talla?: string;
  peso?: string;
  imc?: string;
  aspectoGeneral?: string;
  tiempoLibre?: string;
  isEditing?: boolean;
  handleAspectoGeneralChange?: (value: string) => void;
}

const ClinicalEvaluationHtml: React.FC<ClinicalEvaluationHtmlProps> = ({
  talla,
  peso,
  imc,
  aspectoGeneral,
}) => {
  return (
    <div
      className="mb-2.5 overflow-hidden rounded-[8px] border"
      style={{ borderColor: pdfColors.line }}
    >
      <div
        className="border-b px-3 py-2"
        style={{
          backgroundColor: pdfColors.surface,
          borderBottomColor: pdfColors.line,
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ color: pdfColors.accentText }}
        >
          Examen clínico
        </p>
      </div>

      <div className="space-y-2.5 px-3 py-[9px]">
        {aspectoGeneral?.trim() && (
          <div className="space-y-1">
            <p
              className="text-[8px] uppercase tracking-[0.08em]"
              style={{ color: pdfColors.muted }}
            >
              Aspecto general
            </p>
            <p className="text-[10px] font-semibold text-slate-900">
              {aspectoGeneral}
            </p>
          </div>
        )}

        <div className="space-y-1">
          <p
            className="text-[8px] uppercase tracking-[0.08em]"
            style={{ color: pdfColors.muted }}
          >
            Mediciones
          </p>
          <div className="grid grid-cols-3 gap-[10px]">
            {[
              { label: "Peso (kg)", value: peso },
              { label: "Talla (cm)", value: talla },
              { label: "IMC", value: imc },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[6px] border bg-white px-[10px] py-[8px]"
                style={{ borderColor: pdfColors.line }}
              >
                <p
                  className="mb-1 text-[8px] uppercase tracking-[0.08em]"
                  style={{ color: pdfColors.muted }}
                >
                  {item.label}
                </p>
                <p className="text-[10px] font-semibold text-slate-900">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalEvaluationHtml;
