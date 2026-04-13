import { Torax } from "@/store/Pre-Occupational/preOccupationalSlice";
import { pdfColors } from "../../../Pdf/shared";

interface Props {
  data: Torax;
}

export default function ToraxHtml({ data }: Props) {
  const hasData = data.deformaciones !== undefined || data.cicatrices !== undefined;
  if (!hasData) return null;

  const items = [
    data.deformaciones !== undefined
      ? {
          label: "Deformaciones",
          value: `${data.deformaciones === "si" ? "Sí" : "No"}${data.deformacionesObs?.trim() ? ` · ${data.deformacionesObs}` : ""}`,
        }
      : null,
    data.cicatrices !== undefined
      ? {
          label: "Cicatrices",
          value: `${data.cicatrices === "si" ? "Sí" : "No"}${data.cicatricesObs?.trim() ? ` · ${data.cicatricesObs}` : ""}`,
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
          Tórax
        </p>
      </div>

      <div className="space-y-3 px-3 py-[10px]">
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
