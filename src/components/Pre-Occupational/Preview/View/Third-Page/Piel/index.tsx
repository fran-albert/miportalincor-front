import { Piel } from "@/store/Pre-Occupational/preOccupationalSlice";
import { pdfColors } from "../../../Pdf/shared";

interface Props {
  data: Piel;
}

export default function PielHtml({ data }: Props) {
  const hasData =
    data.normocoloreada !== undefined ||
    data.tatuajes !== undefined ||
    data.observaciones?.trim();

  if (!hasData) return null;

  const items = [
    data.normocoloreada !== undefined
      ? {
          label: "Normocoloreada",
          value: data.normocoloreada === "si" ? "Sí" : "No",
        }
      : null,
    data.tatuajes !== undefined
      ? {
          label: "Tatuajes",
          value: data.tatuajes === "si" ? "Sí" : "No",
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
          Piel
        </p>
      </div>

      <div className="space-y-3 px-3 py-[10px]">
        {!!items.length && (
          <div className="grid grid-cols-2 gap-[8px]">
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
        )}

        {data.observaciones?.trim() && (
          <div className="space-y-1">
            <p
              className="text-[8px] uppercase tracking-[0.08em]"
              style={{ color: pdfColors.muted }}
            >
              Observaciones
            </p>
            <div
              className="rounded-[6px] border bg-white px-[10px] py-[8px]"
              style={{ borderColor: pdfColors.line }}
            >
              <p className="text-[10px] text-slate-900">{data.observaciones}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
