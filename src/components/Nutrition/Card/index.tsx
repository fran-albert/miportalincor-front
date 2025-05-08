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

interface Props {
  nutritionData: NutritionData[];
  userId: number;
}

const NutritionCard = ({
  nutritionData: initialNutritionData,
  userId,
}: Props) => {
  const [nutritionData, setNutritionData] = useState(initialNutritionData);
  const {
    addNutritionDataMutation,
    updateNutritionDataMutation,
    deleteNutritionDataMutation,
  } = useNutritionDataMutations();
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false);

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

  const handleDeleteEntry = (id: number) => {
    toast.promise(deleteNutritionDataMutation.mutateAsync(id), {
      loading: <LoadingToast message="Eliminando entrada..." />,
      success: () => {
        setNutritionData(nutritionData.filter((entry) => entry.id !== id));
        return <SuccessToast message="Entrada eliminada con éxito" />;
      },
      error: <ErrorToast message="Error al eliminar entrada" />,
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
      <WeightEvolutionCard nutritionData={nutritionData} />
    </>
  );
};

export default NutritionCard;
