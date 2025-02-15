"use client";

import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function InstitutionInformationPreview() {
  const institutionInfo = useSelector(
    (state: RootState) => state.preOccupational.formData.institutionInformation
  );

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Institución */}
        <div className="space-y-2">
          <Label>Institución</Label>
          <div className="p-2 border rounded bg-gray-50">
            {institutionInfo.institucion || "No definido"}
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <Label>Dirección</Label>
          <div className="p-2 border rounded bg-gray-50">
            {institutionInfo.direccion || "No definido"}
          </div>
        </div>

        {/* Provincia */}
        <div className="space-y-2">
          <Label>Provincia</Label>
          <div className="p-2 border rounded bg-gray-50">
            {institutionInfo.provincia || "No definido"}
          </div>
        </div>

        {/* Ciudad */}
        <div className="space-y-2">
          <Label>Ciudad</Label>
          <div className="p-2 border rounded bg-gray-50">
            {institutionInfo.ciudad || "No definido"}
          </div>
        </div>
      </div>
    </div>
  );
}
