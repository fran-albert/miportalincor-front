import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

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
    <div className="space-y-4">
      <ClinicalBlock
        title="Agudeza visual"
        description="Registrá los valores sin corrección y con corrección para cada ojo."
      >
        <Table>
          <TableHeader className="text-black">
            <TableRow>
              <TableCell className="font-medium text-slate-600" />
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
                <TableCell className="text-center">
                  {isEditing ? (
                    <Input
                      value={withoutCorrection[eye]}
                      onChange={e => onScChange(eye, e.currentTarget.value)}
                      disabled={!isEditing}
                      className="mx-auto w-20 bg-white text-center"
                    />
                  ) : (
                    withoutCorrection[eye]
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {isEditing ? (
                    <Input
                      value={withCorrection[eye]}
                      onChange={e => onCcChange(eye, e.currentTarget.value)}
                      disabled={!isEditing}
                      className="mx-auto w-20 bg-white text-center"
                    />
                  ) : (
                    withCorrection[eye]
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ClinicalBlock>

      <ClinicalBlock
        title="Visión cromática"
        description="Indicá si la visión cromática es normal o si requiere observaciones."
      >
        <BooleanChoiceField
          idPrefix="vision-cromatica"
          label="Resultado"
          value={chromaticVision === "normal"}
          disabled={!isEditing}
          positiveLabel="Normal"
          negativeLabel="Anormal"
          onChange={(value) =>
            onChromaticVisionChange(value === true ? "normal" : "anormal")
          }
        />
        <NotesField
          id="visual-notes"
          label="Observaciones"
          value={notes}
          disabled={!isEditing}
          onChange={onNotesChange}
          placeholder="Detalle clínico o aclaraciones"
        />
      </ClinicalBlock>
    </div>
  );
}
