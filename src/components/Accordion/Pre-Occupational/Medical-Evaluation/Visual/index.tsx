import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VisualAcuityProps {
  withoutCorrection: { right: string; left: string };
  withCorrection?: { right?: string; left?: string };
  chromaticVision: "normal" | "anormal";
  onChromaticVisionChange?: (value: "normal" | "anormal") => void;
  notes?: string;
  onNotesChange?: (value: string) => void;
}

export function VisualAcuityCard({
  withoutCorrection,
  withCorrection = { right: "-", left: "-" },
  chromaticVision,
  onChromaticVisionChange,
  notes = "",
  onNotesChange,
}: VisualAcuityProps) {
  return (
    <div>
      <h4 className="font-bold text-base text-greenPrimary">Agudeza Visual</h4>
      <p className="text-muted-foreground">
        Valores sin corrección (S/C) y con corrección (C/C).
      </p>

      <div className="space-y-6">
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
              <TableCell className="text-center">
                {withCorrection.left}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Visión Cromática */}
        <div className="flex items-center space-x-6">
          <Label className="text-black">Visión Cromática:</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vision-normal"
              checked={chromaticVision === "normal"}
              onCheckedChange={(checked) =>
                onChromaticVisionChange?.(checked ? "normal" : "anormal")
              }
              
            />
            <Label htmlFor="vision-normal" className="text-black">Normal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vision-anormal"
              checked={chromaticVision === "anormal"}
              onCheckedChange={(checked) =>
                onChromaticVisionChange?.(checked ? "anormal" : "normal")
              }
            />
            <Label htmlFor="vision-anormal" className="text-black">Anormal</Label>
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-1">
          <Input
            id="visual-notes"
            value={notes}
            onChange={(e) => onNotesChange?.(e.currentTarget.value)}
            placeholder="Observaciones..."
            className="text-black"
          />
        </div>
      </div>
    </div>
  );
}
