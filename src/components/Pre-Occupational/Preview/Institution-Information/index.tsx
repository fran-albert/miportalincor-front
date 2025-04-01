 

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

interface InstitutionInformationPreviewProps {
  isForPdf?: boolean;
}

export default function InstitutionInformationPreview({ isForPdf = false }: InstitutionInformationPreviewProps) {
  const institutionInfo = useSelector(
    (state: RootState) => state.preOccupational.formData.institutionInformation
  );

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* Institución */}
        <div className="space-y-2">
          <Label>Institución</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{institutionInfo.institucion || "No definido"}</p>
          ) : (
            <Input
              value={institutionInfo.institucion || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <Label>Dirección</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{institutionInfo.direccion || "No definido"}</p>
          ) : (
            <Input
              value={institutionInfo.direccion || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Provincia */}
        <div className="space-y-2">
          <Label>Provincia</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{institutionInfo.provincia || "No definido"}</p>
          ) : (
            <Input
              value={institutionInfo.provincia || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>

        {/* Ciudad */}
        <div className="space-y-2">
          <Label>Ciudad</Label>
          {isForPdf ? (
            <p className="p-2 font-semibold">{institutionInfo.ciudad || "No definido"}</p>
          ) : (
            <Input
              value={institutionInfo.ciudad || "No definido"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
