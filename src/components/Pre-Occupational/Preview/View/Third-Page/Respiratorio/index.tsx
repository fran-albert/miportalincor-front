// src/components/RespiratorioHtml.tsx
import { Respiratorio } from "@/store/Pre-Occupational/preOccupationalSlice";
import { pdfColors } from "../../../Pdf/shared";


interface Props {
  data: Respiratorio;
}

export default function RespiratorioHtml({ data }: Props) {
  const hasData =
    data.frecuenciaRespiratoria?.trim() ||
    data.oximetria?.trim() ||
    data.sinAlteraciones !== undefined ||
    data.observaciones?.trim();

  if (!hasData) return null;

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
          Aparato respiratorio
        </p>
      </div>

      <div className="space-y-3 px-3 py-[10px]">
        <div className="grid grid-cols-2 gap-[10px]">
          {data.frecuenciaRespiratoria?.trim() && (
            <div
              className="rounded-[6px] border bg-white px-[10px] py-[8px]"
              style={{ borderColor: pdfColors.line }}
            >
              <p
                className="mb-1 text-[8px] uppercase tracking-[0.08em]"
                style={{ color: pdfColors.muted }}
              >
                Frecuencia respiratoria
              </p>
              <p className="text-[10px] font-semibold text-slate-900">
                {data.frecuenciaRespiratoria} x minuto
              </p>
            </div>
          )}

          {data.oximetria?.trim() && (
            <div
              className="rounded-[6px] border bg-white px-[10px] py-[8px]"
              style={{ borderColor: pdfColors.line }}
            >
              <p
                className="mb-1 text-[8px] uppercase tracking-[0.08em]"
                style={{ color: pdfColors.muted }}
              >
                Oximetria
              </p>
              <p className="text-[10px] font-semibold text-slate-900">
                {data.oximetria} %
              </p>
            </div>
          )}
        </div>

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
              <p className="text-[10px] text-slate-900">
                {data.observaciones}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
