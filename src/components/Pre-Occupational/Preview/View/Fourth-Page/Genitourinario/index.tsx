import { Genitourinario } from "@/store/Pre-Occupational/preOccupationalSlice";
import { pdfColors } from "../../../Pdf/shared";

interface Props {
  data: Genitourinario;
  showGinecoData?: boolean;
}

export default function GenitourinarioHtml({
  data,
  showGinecoData = true,
}: Props) {
  const hasCoreData =
    data.sinAlteraciones !== undefined ||
    data.varicocele !== undefined ||
    Boolean(data.observaciones?.trim()) ||
    Boolean(data.varicoceleObs?.trim());
  const hasGinecoData =
    showGinecoData &&
    (Boolean(data.fum?.trim()) ||
      Boolean(data.partos?.trim()) ||
      Boolean(data.embarazos?.trim()) ||
      Boolean(data.cesarea?.trim()));

  if (!hasCoreData && !hasGinecoData) {
    return null;
  }

  const coreItems = [
    data.sinAlteraciones !== undefined
      ? {
          label: "Sin alteraciones",
          value: data.sinAlteraciones ? "Sí" : "No",
        }
      : null,
    data.varicocele !== undefined
      ? {
          label: "Varicocele",
          value: `${data.varicocele ? "Sí" : "No"}${data.varicoceleObs?.trim() ? ` · ${data.varicoceleObs}` : ""}`,
        }
      : null,
  ].filter(Boolean);

  const gynItems = [
    data.fum?.trim() ? { label: "F.U.M.", value: data.fum } : null,
    data.embarazos?.trim()
      ? { label: "Embarazos", value: data.embarazos }
      : null,
    data.partos?.trim() ? { label: "Partos", value: data.partos } : null,
    data.cesarea?.trim() ? { label: "Cesárea", value: data.cesarea } : null,
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
          Aparato genitourinario
        </p>
      </div>

      <div className="space-y-3 px-3 py-[10px]">
        {coreItems.map((item) => (
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

        {hasGinecoData && (
          <div className="grid grid-cols-2 gap-[8px]">
            {gynItems.map((item) => (
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
      </div>
    </div>
  );
}
