"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

export default function OccupationalHistoryPreview() {
  const occupationalHistory = useSelector(
    (state: RootState) => state.preOccupational.formData.occupationalHistory
  );

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4 font-bold text-greenPrimary text-lg">
        Antecedentes Ocupacionales
      </h3>
      {occupationalHistory.length > 0 ? (
        <div className="space-y-2">
          {occupationalHistory.map((item) => (
            <Input
              id="puesto"
              key={item.id}
              value={item.description || "Sin descripción"}
              readOnly
              className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
            />
          ))}
        </div>
      ) : (
        <Input
          id="puesto"
          value={"No se encontraron antecedentes ocupacionales."}
          readOnly
          className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
        />
      )}
    </div>
  );
}
