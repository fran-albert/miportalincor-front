// src/components/VisualAcuityHtml.tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { pdfColors } from "../../../Pdf/shared";

interface VisualAcuityHtmlProps {
  withoutCorrection: { right: string; left: string };
  withCorrection?: { right?: string; left?: string };
  chromaticVision: "normal" | "anormal";
  notes?: string;
}

export default function VisualAcuityHtml({
  withoutCorrection,
  withCorrection = { right: "-", left: "-" },
  chromaticVision,
  notes = "",
}: VisualAcuityHtmlProps) {
  return (
    <div
      className="mb-2.5 overflow-hidden rounded-[8px] border"
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
          Agudeza visual
        </p>
      </div>

      <div className="space-y-2.5 px-3 py-[9px]">
        <div
          className="overflow-hidden rounded-[6px] border"
          style={{ borderColor: pdfColors.line }}
        >
          <Table>
            <TableHeader className="text-black">
              <TableRow>
                <TableCell />
                <TableCell
                  className="text-center text-[8px] font-medium uppercase"
                  style={{ color: pdfColors.muted }}
                >
                  S/C
                </TableCell>
                <TableCell
                  className="text-center text-[8px] font-medium uppercase"
                  style={{ color: pdfColors.muted }}
                >
                  C/C
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="text-black">
              <TableRow>
                <TableCell>Ojo derecho</TableCell>
                <TableCell className="text-center">
                  {withoutCorrection.right}
                </TableCell>
                <TableCell className="text-center">
                  {withCorrection.right}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ojo izquierdo</TableCell>
                <TableCell className="text-center">
                  {withoutCorrection.left}
                </TableCell>
                <TableCell className="text-center">
                  {withCorrection.left}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center gap-2">
          <p
            className="text-[8px] uppercase tracking-[0.08em]"
            style={{ color: pdfColors.muted }}
          >
            Vision cromatica
          </p>
          <span
            className={`text-[10px] font-semibold ${
              chromaticVision === "normal"
                ? "text-greenPrimary"
                : "text-redPrimary"
            }`}
          >
            {chromaticVision === "normal" ? "Normal" : "Anormal"}
          </span>
        </div>

        {notes && (
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
              <p className="text-[10px] text-slate-900">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
