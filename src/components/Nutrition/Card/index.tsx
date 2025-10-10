// NutritionCard.tsx
import React, { useRef, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardPlus, Plus, FileDown } from "lucide-react";
import { NutritionTable } from "../Table/table";
import type {
  CreateNutritionDataDto,
  NutritionData,
  UpdateNutritionDataDto,
} from "@/types/Nutrition-Data/NutritionData";
import { Button } from "@/components/ui/button";
import { useNutritionDataMutations } from "@/hooks/Nutrition-Data/useNutritionDataMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
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
  const { promiseToast } = useToastContext();

  // — Estados para el chart / PDF
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const chartRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);
  const nameCap = capitalizeWords(userName);
  const surnameCap = capitalizeWords(userLastname);
  const today = format(new Date(), "dd-MM-yyyy", { locale: es });
  const fileName = `${nameCap}-${surnameCap}-Control-Nutricional-Incor-${today}.pdf`;

  useEffect(() => {
    setNutritionData(initialNutritionData);
  }, [initialNutritionData]);

  useEffect(() => {
    setPdfUrl(undefined);
  }, [startDate, endDate]);

  const handleAddEntry = async (newEntry: CreateNutritionDataDto) => {
    try {
      const data = await promiseToast(
        addNutritionDataMutation.mutateAsync(newEntry),
        {
          loading: {
            title: "Agregando nueva entrada",
            description: "Por favor espera mientras procesamos tu solicitud",
          },
          success: {
            title: "Nueva entrada agregada",
            description: "La entrada se agregó exitosamente",
          },
          error: (error: any) => ({
            title: "Error al agregar nueva entrada",
            description:
              error.response?.data?.message ||
              "Ha ocurrido un error inesperado",
          }),
        }
      );
      setNutritionData((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  const handleUpdateEntry = async (updatedEntry: NutritionData) => {
    const { id, ...data } = updatedEntry;
    try {
      await promiseToast(
        updateNutritionDataMutation.mutateAsync({ id, data } as {
          id: number;
          data: UpdateNutritionDataDto;
        }),
        {
          loading: {
            title: "Actualizando entrada",
            description: "Por favor espera mientras procesamos tu solicitud",
          },
          success: {
            title: "Entrada actualizada",
            description: "La entrada se actualizó exitosamente",
          },
          error: (error: any) => ({
            title: "Error al actualizar entrada",
            description:
              error.response?.data?.message ||
              "Ha ocurrido un error inesperado",
          }),
        }
      );
      setNutritionData((prev) =>
        prev.map((e) => (e.id === id ? updatedEntry : e))
      );
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleDeleteEntry = async (ids: number[]) => {
    try {
      await promiseToast(deleteNutritionDataMutation.mutateAsync(ids), {
        loading: {
          title: "Eliminando entradas",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Entradas eliminadas",
          description: "Las entradas se eliminaron exitosamente",
        },
        error: (error: any) => ({
          title: "Error al eliminar entradas",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
      setNutritionData((prev) => prev.filter((e) => !ids.includes(e.id)));
    } catch (error) {
      console.error("Error deleting entries:", error);
    }
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
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Hero Background con Gradiente */}
        <div className="relative bg-gradient-to-r from-greenPrimary to-teal-600 px-8 py-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center text-white text-2xl font-bold">
              <ClipboardPlus className="mr-3 h-7 w-7" />
              Control Nutricional
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setIsAddingNewEntry(true)}
                className="bg-white hover:bg-white/90 text-greenPrimary font-medium shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Fila
              </Button>
              <ExcelUploader userId={userId} />
              {!pdfUrl ? (
                <Button
                  onClick={preparePdf}
                  disabled={loadingPdf}
                  className="bg-white hover:bg-white/90 text-greenPrimary font-medium shadow-md disabled:opacity-50"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {loadingPdf ? "Generando…" : "Generar PDF"}
                </Button>
              ) : (
                <a href={pdfUrl} download={fileName}>
                  <Button className="bg-white text-greenPrimary hover:bg-gray-100 shadow-md font-medium">
                    <FileDown className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <CardHeader className="sr-only"></CardHeader>

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
            onCancelNewEntry={() => setIsAddingNewEntry(false)}
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
