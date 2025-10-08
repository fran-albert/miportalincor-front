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
      const data = await promiseToast(addNutritionDataMutation.mutateAsync(newEntry), {
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
          description: error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
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
            description: error.response?.data?.message || "Ha ocurrido un error inesperado",
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
          description: error.response?.data?.message || "Ha ocurrido un error inesperado",
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-greenPrimary">
            <ClipboardPlus className="mr-2" />
            Control Nutricional
          </CardTitle>
          <div className="div">
            <Button
              onClick={() => setIsAddingNewEntry(true)}
              variant="link"
              className="text-greenPrimary"
            >
              Nueva Fila
            </Button>
            <ExcelUploader userId={userId} />
            {!pdfUrl ? (
              <Button
                onClick={preparePdf}
                disabled={loadingPdf}
                className="bg-teal-800 hover:bg-teal-950"
              >
                {loadingPdf ? "Generando…" : "Generar PDF"}
              </Button>
            ) : (
              <a href={pdfUrl} download={fileName}>
                <Button
                  variant="outline"
                  className="text-greenPrimary hover:text-teal-950"
                >
                  Descargar PDF
                </Button>
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
