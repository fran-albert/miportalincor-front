import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";

interface OccupationalHistoryPreviewProps {
  isForPdf?: boolean;
}

export default function OccupationalHistoryPreview({ isForPdf = false }: OccupationalHistoryPreviewProps) {
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
          {occupationalHistory.map((item) =>
            isForPdf ? (
              <p key={item.id} className="p-2 font-semibold border-b">{item.description || "Sin descripción"}</p>
            ) : (
              <Input
                key={item.id}
                value={item.description || "Sin descripción"}
                readOnly
                className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
              />
            )
          )}
        </div>
      ) : isForPdf ? (
        <p className="p-2 font-semibold">No se encontraron antecedentes ocupacionales.</p>
      ) : (
        <Input
          value={"No se encontraron antecedentes ocupacionales."}
          readOnly
          className="bg-background text-foreground cursor-default focus:ring-0 focus:ring-offset-0"
        />
      )}
    </div>
  );
}
