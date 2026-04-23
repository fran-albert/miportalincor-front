import { ExamResults } from "@/common/helpers/examsResults.maps";
import React from "react";
import { pdfColors } from "../../../Pdf/shared";


interface ExamResultsHtmlProps {
  examResults: ExamResults;
}

const normalizeResultValue = (value?: string) => {
  const text = String(value ?? "").trim();

  if (!text) {
    return "Sin dato registrado";
  }

  if (!/\s/.test(text) && text.length > 72) {
    return `${text.slice(0, 69)}...`;
  }

  return text;
};

const ExamResultsHtml: React.FC<ExamResultsHtmlProps> = ({ examResults }) => {
  const rows = [
    { label: "Clinico", value: examResults?.clinico },
    { label: "Audiometria", value: examResults?.audiometria },
    { label: "Psicotecnico", value: examResults?.psicotecnico },
    { label: "RX torax frente", value: examResults?.["rx-torax"] },
    {
      label: "Electrocardiograma",
      value: examResults?.["electrocardiograma-result"],
    },
    { label: "Laboratorio basico ley", value: examResults?.laboratorio },
    {
      label: "Electroencefalograma",
      value: examResults?.electroencefalograma,
    },
  ];

  return (
    <div
      className="mb-2.5 overflow-hidden rounded-[8px] border"
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
          Resultados del examen
        </p>
      </div>
      <div className="space-y-1 px-[10px] py-[8px]">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`grid grid-cols-[124px_1fr] gap-[8px] pb-[4px] ${
              index === rows.length - 1 ? "border-b-0 pb-0" : "border-b"
            }`}
            style={{
              borderBottomColor:
                index === rows.length - 1 ? "transparent" : "#eef2f7",
            }}
          >
            <p
              className="text-[7px] uppercase tracking-[0.08em]"
              style={{ color: pdfColors.muted }}
            >
              {row.label}
            </p>
            <p
              className="min-w-0 break-words text-[8px] leading-[1.22]"
              style={{ color: pdfColors.ink }}
            >
              {normalizeResultValue(row.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamResultsHtml;
