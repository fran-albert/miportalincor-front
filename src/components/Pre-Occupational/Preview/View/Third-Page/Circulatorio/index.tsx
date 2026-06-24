import { Circulatorio } from "@/store/Pre-Occupational/preOccupationalSlice";
import { pdfColors } from "../../../Pdf/shared";

interface Props {
  data: Circulatorio;
}

export default function CirculatorioHtml({ data }: Props) {
  const hasData =
    data.frecuenciaCardiaca?.trim() ||
    data.presion?.trim() ||
    data.sinAlteraciones !== undefined ||
    data.varices !== undefined ||
    data.observaciones?.trim();

  if (!hasData) return null;

  const measurementItems = [
    data.frecuenciaCardiaca?.trim()
      ? {
          label: "Frecuencia cardíaca",
          value: `${data.frecuenciaCardiaca} x minuto`,
        }
      : null,
    data.presion?.trim()
      ? {
          label: "Presión arterial",
          value: `${data.presion} mmHg`,
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
          Aparato circulatorio
        </p>
      </div>

      <div className="space-y-3 px-3 py-[10px]">
        {!!measurementItems.length && (
          <div className="grid grid-cols-2 gap-[8px]">
            {measurementItems.map((item) => (
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

        {data.sinAlteraciones !== undefined && (
          <div
            className="rounded-[6px] border bg-white px-[10px] py-[8px]"
            style={{ borderColor: pdfColors.line }}
          >
            <p
              className="mb-1 text-[8px] uppercase tracking-[0.08em]"
              style={{ color: pdfColors.muted }}
            >
              Sin alteraciones
            </p>
            <p className="text-[10px] font-semibold text-slate-900">
              {data.sinAlteraciones ? "Sí" : "No"}
            </p>
          </div>
        )}

        {data.varices !== undefined && (
          <div
            className="rounded-[6px] border bg-white px-[10px] py-[8px]"
            style={{ borderColor: pdfColors.line }}
          >
            <p
              className="mb-1 text-[8px] uppercase tracking-[0.08em]"
              style={{ color: pdfColors.muted }}
            >
              Várices
            </p>
            <p className="text-[10px] font-semibold text-slate-900">
              {data.varices ? "Sí" : "No"}
              {data.varicesObs?.trim() ? ` · ${data.varicesObs}` : ""}
            </p>
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
