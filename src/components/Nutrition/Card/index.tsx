import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { ClipboardPlus } from "lucide-react";
import { NutritionTable } from "../Table/table";
import type {
  CreateNutritionDataDto,
  NutritionData,
  UpdateNutritionDataDto,
} from "@/types/Nutrition-Data/NutritionData";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNutritionDataMutations } from "@/hooks/Nutrition-Data/useNutritionDataMutation";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import ExcelUploader from "../Upload-Excel";
import WeightEvolutionCard from "../Weight-Evolution";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { NutritionPdfDocument } from "../Pdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { capitalizeWords } from "@/common/helpers/helpers";

interface Props {
  nutritionData: NutritionData[];
  userId: number;
  userName: string;
  userLastname: string;
}

const NutritionCard = ({
  nutritionData: initialNutritionData,
  userId,
  userLastname,
  userName,
}: Props) => {
  const [nutritionData, setNutritionData] = useState(initialNutritionData);
  const {
    addNutritionDataMutation,
    updateNutritionDataMutation,
    deleteNutritionDataMutation,
  } = useNutritionDataMutations();
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [chartBase64, setChartBase64] = useState<string>();
  const today = format(new Date(), "dd-MM-yyyy", { locale: es });

  const nameCap = capitalizeWords(userName);
  const surnameCap = capitalizeWords(userLastname);
  
  const fileName = `${nameCap}-${surnameCap}-Control-Nutricional-Incor-${today}.pdf`;
  const handleAddNewEntry = () => {
    setIsAddingNewEntry(true);
  };

  useEffect(() => {
    setNutritionData(initialNutritionData);
  }, [initialNutritionData]);

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
          setNutritionData(
            nutritionData.map((entry) =>
              entry.id === id ? updatedEntry : entry
            )
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
              onClick={handleAddNewEntry}
              className="text-greenPrimary"
              variant="link"
            >
              Nueva Fila
            </Button>
            <ExcelUploader userId={userId} />
            <PDFDownloadLink
              document={
                <NutritionPdfDocument
                  data={nutritionData}
                  patientName={userName}
                  patientSurname={userLastname}
                  logoSrc="https://res.cloudinary.com/dfoqki8kt/image/upload/v1747680733/jzpshzgbcrtne9fbkhxm.png"
                  chartSrc={chartBase64}
                  dateFrom={
                    startDate ? startDate.toLocaleDateString("es-AR") : "-"
                  }
                  dateTo={endDate ? endDate.toLocaleDateString("es-AR") : "-"}
                />
              }
              fileName={fileName}
            >
              {({ loading }) => (
                <Button variant="outline" disabled={loading}>
                  Exportar a PDF
                </Button>
              )}
            </PDFDownloadLink>
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
      <WeightEvolutionCard
        nutritionData={nutritionData}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onChartReady={setChartBase64}
      />
    </>
  );
};

export default NutritionCard;
