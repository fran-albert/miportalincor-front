import { ExamResults } from "@/common/helpers/examsResults.maps";
import React from "react";
import { pdfColors } from "../../../Pdf/shared";
import {
  emptyExamResultsMessage,
  getVisibleExamResultRows,
} from "../../../exam-results-visibility";


interface ExamResultsHtmlProps {
  examResults: ExamResults;
}

const ExamResultsHtml: React.FC<ExamResultsHtmlProps> = ({ examResults }) => {
  const rows = getVisibleExamResultRows(examResults);

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
        {rows.length === 0 ? (
          <p
            className="text-[8px] leading-[1.22]"
            style={{ color: pdfColors.muted }}
          >
            {emptyExamResultsMessage}
          </p>
        ) : rows.map((row, index) => (
          <div
            key={row.valueKey}
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
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamResultsHtml;
