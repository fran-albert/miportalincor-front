// NutritionCard.tsx
import React, { useRef, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardPlus } from "lucide-react";
import { NutritionTable } from "../Table/table";
import type {
  CreateNutritionDataDto,
  NutritionData,
  UpdateNutritionDataDto,
} from "@/types/Nutrition-Data/NutritionData";
import { Button } from "@/components/ui/button";
import { useNutritionDataMutations } from "@/hooks/Nutrition-Data/useNutritionDataMutation";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import ExcelUploader from "../Upload-Excel";
import WeightEvolutionCard from "../Weight-Evolution";
import { pdf } from "@react-pdf/renderer";
import { NutritionPdfDocument } from "../Pdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { capitalizeWords } from "@/common/helpers/helpers";
import { toPng } from "html-to-image";

interface Props {
  nutritionData: NutritionData[];
  userId: number;
  userName: string;
  userLastname: string;
}

const NutritionCard: React.FC<Props> = ({
  nutritionData: initialNutritionData,
  userId,
  userName,
  userLastname,
}) => {
  // — Datos y mutaciones
  const [nutritionData, setNutritionData] =
    useState<NutritionData[]>(initialNutritionData);
  const {
    addNutritionDataMutation,
    updateNutritionDataMutation,
    deleteNutritionDataMutation,
  } = useNutritionDataMutations();

  // — Estados para el chart / PDF
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const chartRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);
  // — Nombre de archivo
  const nameCap = capitalizeWords(userName);
  const surnameCap = capitalizeWords(userLastname);
  const today = format(new Date(), "dd-MM-yyyy", { locale: es });
  const fileName = `${nameCap}-${surnameCap}-Control-Nutricional-Incor-${today}.pdf`;

  // — Sincronización inicial de datos
  useEffect(() => {
    setNutritionData(initialNutritionData);
  }, [initialNutritionData]);

  // — Handlers de tabla
  const handleAddEntry = (newEntry: CreateNutritionDataDto) => {
    toast.promise(addNutritionDataMutation.mutateAsync(newEntry), {
      loading: <LoadingToast message="Agregando nueva entrada..." />,
      success: (data) => {
        setNutritionData((prev) => [...prev, data]);
        return <SuccessToast message="Nueva entrada agregada con éxito" />;
      },
      error: <ErrorToast message="Error al agregar nueva entrada" />,
    });
  };

  const handleUpdateEntry = (updatedEntry: NutritionData) => {
    const { id, ...data } = updatedEntry;
    toast.promise(
      updateNutritionDataMutation.mutateAsync({ id, data } as {
        id: number;
        data: UpdateNutritionDataDto;
      }),
      {
        loading: <LoadingToast message="Actualizando entrada..." />,
        success: () => {
          setNutritionData((prev) =>
            prev.map((e) => (e.id === id ? updatedEntry : e))
          );
          return <SuccessToast message="Entrada actualizada con éxito" />;
        },
        error: <ErrorToast message="Error al actualizar entrada" />,
      }
    );
  };

  const handleDeleteEntry = (ids: number[]) => {
    toast.promise(deleteNutritionDataMutation.mutateAsync(ids), {
      loading: <LoadingToast message="Eliminando entradas..." />,
      success: () => {
        setNutritionData((prev) => prev.filter((e) => !ids.includes(e.id)));
        return <SuccessToast message="Entradas eliminadas con éxito" />;
      },
      error: <ErrorToast message="Error al eliminar entradas" />,
    });
  };

  // — Preparar PDF (captura + blob)
  const preparePdf = async () => {
    if (!chartRef.current) return;
    setLoadingPdf(true);
    await new Promise((r) => setTimeout(r, 100)); // espera render
    try {
      const img = await toPng(chartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const doc = (
        <NutritionPdfDocument
          data={nutritionData}
          patientName={userName}
          patientSurname={userLastname}
          logoSrc="https://res.cloudinary.com/dfoqki8kt/image/upload/v1747680733/jzpshzgbcrtne9fbkhxm.png"
          chartSrc={img}
          dateFrom={startDate?.toLocaleDateString("es-AR") ?? "-"}
          dateTo={endDate?.toLocaleDateString("es-AR") ?? "-"}
        />
      );
      const blob = await pdf(doc).toBlob();
      setPdfUrl(URL.createObjectURL(blob));
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-greenPrimary">
            <ClipboardPlus className="mr-2" />
            Control Nutricional
          </CardTitle>
          <div className="div">
            <Button onClick={() => setIsAddingNewEntry(true)} variant="link" className="text-greenPrimary">
              Nueva Fila
            </Button>
            <ExcelUploader userId={userId} />
            {!pdfUrl ? (
              <Button onClick={preparePdf} disabled={loadingPdf} className="bg-teal-800 hover:bg-teal-950">
                {loadingPdf ? "Generando…" : "Generar PDF"}
              </Button>
            ) : (
              <a href={pdfUrl} download={fileName}>
                <Button variant="outline" className="text-greenPrimary hover:text-teal-950">Descargar PDF</Button>
              </a>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <NutritionTable
            userId={userId}
            nutritionData={nutritionData}
            isAddingNewEntry={isAddingNewEntry}
            setIsAddingNewEntry={setIsAddingNewEntry}
            setNutritionData={setNutritionData}
            onAddEntry={handleAddEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </CardContent>
      </Card>

      {/* Chart para captura */}
      <WeightEvolutionCard
        ref={chartRef}
        nutritionData={nutritionData}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
    </>
  );
};

export default NutritionCard;
