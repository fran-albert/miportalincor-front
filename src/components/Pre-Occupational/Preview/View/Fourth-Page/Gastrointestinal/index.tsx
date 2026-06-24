// src/components/GastrointestinalHtml.tsx
import { Gastrointestinal } from "@/store/Pre-Occupational/preOccupationalSlice";
import { pdfColors } from "../../../Pdf/shared";

interface Props {
  data: Gastrointestinal;
}

export default function GastrointestinalHtml({ data }: Props) {
  // Si no hay ningún dato, no mostrar la sección
  const hasData =
    data.sinAlteraciones !== undefined ||
    data.cicatrices !== undefined ||
    data.hernias !== undefined ||
    data.eventraciones !== undefined ||
    data.hemorroides !== undefined ||
    data.observaciones?.trim();

  if (!hasData) return null;

  const items = [
    data.sinAlteraciones !== undefined
      ? { label: "Sin alteraciones", value: data.sinAlteraciones ? "Sí" : "No" }
      : null,
    data.cicatrices !== undefined
      ? {
          label: "Cicatrices",
          value: `${data.cicatrices ? "Sí" : "No"}${data.cicatricesObs?.trim() ? ` · ${data.cicatricesObs}` : ""}`,
        }
      : null,
    data.hernias !== undefined
      ? {
          label: "Hernias",
          value: `${data.hernias ? "Sí" : "No"}${data.herniasObs?.trim() ? ` · ${data.herniasObs}` : ""}`,
        }
      : null,
    data.eventraciones !== undefined
      ? {
          label: "Eventraciones",
          value: `${data.eventraciones ? "Sí" : "No"}${data.eventracionesObs?.trim() ? ` · ${data.eventracionesObs}` : ""}`,
        }
      : null,
    data.hemorroides !== undefined
      ? {
          label: "Hemorroides",
          value: `${data.hemorroides ? "Sí" : "No"}${data.hemorroidesObs?.trim() ? ` · ${data.hemorroidesObs}` : ""}`,
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
          Aparato gastrointestinal
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
