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
  isEditing: boolean;
  withoutCorrection: { right: string; left: string };
  withCorrection:  { right: string; left: string };
  chromaticVision: "normal" | "anormal";
  notes: string;
  onScChange: (eye: "right" | "left", value: string) => void;
  onCcChange: (eye: "right" | "left", value: string) => void;
  onChromaticVisionChange: (value: "normal" | "anormal") => void;
  onNotesChange: (value: string) => void;
}

export function VisualAcuityCard({
  isEditing,
  withoutCorrection,
  withCorrection,
  chromaticVision,
  notes,
  onScChange,
  onCcChange,
  onChromaticVisionChange,
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
            {(["right","left"] as const).map((eye) => (
              <TableRow key={eye}>
                <TableCell>
                  {eye === "right" ? "Ojo Derecho" : "Ojo Izquierdo"}
                </TableCell>

                {/* S/C cell */}
                <TableCell className="text-center">
                  {isEditing ? (
                    <Input
                      value={withoutCorrection[eye]}
                      onChange={e => onScChange(eye, e.currentTarget.value)}
                      disabled={!isEditing}
                      className="w-16 mx-auto text-center"
                    />
                  ) : (
                    withoutCorrection[eye]
                  )}
                </TableCell>

                {/* C/C cell */}
                <TableCell className="text-center">
                  {isEditing ? (
                    <Input
                      value={withCorrection[eye]}
                      onChange={e => onCcChange(eye, e.currentTarget.value)}
                      disabled={!isEditing}
                      className="w-16 mx-auto text-center"
                    />
                  ) : (
                    withCorrection[eye]
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Visión Cromática */}
        <div className="flex items-center space-x-6">
          <Label className="text-black">Visión Cromática:</Label>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vision-normal"
              disabled={!isEditing}
              checked={chromaticVision === "normal"}
              onCheckedChange={chk =>
                onChromaticVisionChange(chk ? "normal" : "anormal")
              }
            />
            <Label htmlFor="vision-normal" className="text-black">
              Normal
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vision-anormal"
              disabled={!isEditing}
              checked={chromaticVision === "anormal"}
              onCheckedChange={chk =>
                onChromaticVisionChange(chk ? "anormal" : "normal")
              }
            />
            <Label htmlFor="vision-anormal" className="text-black">
              Anormal
            </Label>
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-1">
          <Input
            id="visual-notes"
            value={notes}
            disabled={!isEditing}
            onChange={e => onNotesChange(e.currentTarget.value)}
            placeholder="Observaciones..."
            className="text-black"
          />
        </div>
      </div>
    </div>
  );
}
