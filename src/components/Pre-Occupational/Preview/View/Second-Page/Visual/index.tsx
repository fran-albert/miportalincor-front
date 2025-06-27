// src/components/VisualAcuityHtml.tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

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
    <div className="mt-6">
      <h4 className="font-bold text-base text-greenPrimary">Agudeza Visual</h4>
      <p className="text-muted-foreground mb-4">
        Valores sin corrección (S/C) y con corrección (C/C).
      </p>

      <Table>
        <TableHeader className="text-black">
          <TableRow>
            <TableCell />
            <TableCell className="text-center font-medium">S/C</TableCell>
            <TableCell className="text-center font-medium">C/C</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="text-black">
          <TableRow>
            <TableCell>Ojo Derecho</TableCell>
            <TableCell className="text-center">
              {withoutCorrection.right}
            </TableCell>
            <TableCell className="text-center">
              {withCorrection.right}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Ojo Izquierdo</TableCell>
            <TableCell className="text-center">
              {withoutCorrection.left}
            </TableCell>
            <TableCell className="text-center">{withCorrection.left}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex items-center space-x-4 mt-4">
        <Label className="text-black">Visión Cromática:</Label>
        <span
          className={`font-medium ${
            chromaticVision === "normal"
              ? "text-greenPrimary"
              : "text-redPrimary"
          }`}
        >
          {chromaticVision === "normal" ? "Normal" : "Anormal"}
        </span>
      </div>

      {notes && (
        <div className="mt-3">
          <Label className="mb-1">Observaciones:</Label>
          <p className="text-black">{notes}</p>
        </div>
      )}
    </div>
  );
}
