"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
            <div key={item.id} className="p-2 border rounded bg-gray-50">
              {item.description || "Sin descripción"}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2 border rounded bg-gray-50">
          No se encontraron antecedentes ocupacionales.
        </div>
      )}
    </div>
  );
}
