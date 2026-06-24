import { Osteoarticular } from "@/store/Pre-Occupational/preOccupationalSlice";
import { pdfColors } from "../../../Pdf/shared";

interface Props {
  data: Osteoarticular;
}

export default function OsteoarticularHtml({ data }: Props) {
  const hasData =
    data.mmssSin !== undefined ||
    data.mmiiSin !== undefined ||
    data.columnaSin !== undefined ||
    data.amputaciones !== undefined;

  if (!hasData) return null;

  const items = [
    data.mmssSin !== undefined
      ? {
          label: "MMSS",
          value: `${data.mmssSin ? "Sin alteraciones" : "Con hallazgos"}${data.mmssObs?.trim() ? ` · ${data.mmssObs}` : ""}`,
        }
      : null,
    data.mmiiSin !== undefined
      ? {
          label: "MMII",
          value: `${data.mmiiSin ? "Sin alteraciones" : "Con hallazgos"}${data.mmiiObs?.trim() ? ` · ${data.mmiiObs}` : ""}`,
        }
      : null,
    data.columnaSin !== undefined
      ? {
          label: "Columna",
          value: `${data.columnaSin ? "Sin alteraciones" : "Con hallazgos"}${data.columnaObs?.trim() ? ` · ${data.columnaObs}` : ""}`,
        }
      : null,
    data.amputaciones !== undefined
      ? {
          label: "Amputaciones",
          value: `${data.amputaciones ? "Sí" : "No"}${data.amputacionesObs?.trim() ? ` · ${data.amputacionesObs}` : ""}`,
        }
      : null,
  ].filter(Boolean);

  return (
    <div
      className="mb-3 overflow-hidden rounded-[8px] border"
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
          Aparato osteoarticular
        </p>
      </div>

      <div className="grid grid-cols-2 gap-[8px] px-3 py-[10px]">
        {items.map((item) => (
          <div
            key={item!.label}
            className="rounded-[6px] border bg-white px-[10px] py-[8px]"
            style={{ borderColor: pdfColors.line }}
          >
            <p
              className="mb-1 text-[8px] uppercase tracking-[0.08em]"
              style={{ color: pdfColors.muted }}
            >
              {item!.label}
            </p>
            <p className="text-[10px] font-semibold text-slate-900">
              {item!.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
