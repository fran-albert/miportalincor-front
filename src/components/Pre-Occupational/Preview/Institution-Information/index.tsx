"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

export default function InstitutionInformationPreview() {
  const institutionInfo = useSelector(
    (state: RootState) => state.preOccupational.formData.institutionInformation
  );

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">

        <div className="space-y-2">
          <Label>Institución</Label>
          <Input
            id="puesto"
            value={institutionInfo.institucion || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Dirección</Label>
          <Input
            id="puesto"
            value={institutionInfo.direccion || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Provincia</Label>
          <Input
            id="puesto"
            value={institutionInfo.provincia || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>

        <div className="space-y-2">
          <Label>Ciudad</Label>
          <Input
            id="puesto"
            value={institutionInfo.ciudad || "No definido"}
            readOnly
            className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
          />
        </div>
      </div>
    </div>
  );
}
