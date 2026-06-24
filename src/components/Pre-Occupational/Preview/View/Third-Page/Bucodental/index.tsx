// src/components/BucodentalHtml.tsx
import { pdfColors } from "../../../Pdf/shared";

export interface Bucodental {
  sinAlteraciones?: boolean;
  caries?: boolean;
  faltanPiezas?: boolean;
  observaciones?: string;
}

interface Props {
  data: Bucodental;
}

export default function BucodentalHtml({ data }: Props) {
  // Si no hay ningún dato, no mostrar la sección
  const hasData =
    data.sinAlteraciones !== undefined ||
    data.caries !== undefined ||
    data.faltanPiezas !== undefined ||
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
          Examen bucodental
        </p>
      </div>

      <div className="space-y-3 px-3 py-[10px]">
        <div className="grid grid-cols-2 gap-[8px]">
          {[
            data.sinAlteraciones !== undefined
              ? { label: "Sin alteraciones", value: data.sinAlteraciones }
              : null,
            data.caries !== undefined
              ? { label: "Caries", value: data.caries }
              : null,
            data.faltanPiezas !== undefined
              ? { label: "Faltan piezas", value: data.faltanPiezas }
              : null,
          ]
            .filter(Boolean)
            .map((item) => (
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
                  {item!.value ? "Sí" : "No"}
                </p>
              </div>
            ))}
        </div>

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
