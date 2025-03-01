import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEvaluationType } from "@/hooks/Evaluation-Type/useEvaluationTypes";
import { Label } from "@/components/ui/label";
import { useCollaboratorMedicalEvaluationMutations } from "@/hooks/Collaborator-Medical-Evaluation/useCollaboratorMedicalEvaluationMutations";
import { useNavigate } from "react-router-dom";
import { parseSlug } from "@/common/helpers/helpers";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  slug: string;
}

export default function CreateExamDialog({ isOpen, setIsOpen, slug }: Props) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { id } = parseSlug(slug);
  const { addCollaboratorMedicalEvaluationMutation } =
    useCollaboratorMedicalEvaluationMutations();
  const toggleDialog = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  const { evaluationTypes } = useEvaluationType({ auth: true });
  const handleCheckboxChange = (optionId: number) => {
    setSelectedOption(optionId === selectedOption ? null : optionId);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      const mutationPromise =
        addCollaboratorMedicalEvaluationMutation.mutateAsync({
          evaluationTypeId: selectedOption,
          collaboratorId: id,
        });

      toast.promise(mutationPromise, {
        loading: <LoadingToast message="Creando examen..." />,
        success: <SuccessToast message="Examen creado con éxito" />,
        error: <ErrorToast message="Error al crear el examen" />,
      });

      mutationPromise.then((response) => {
        if (response?.medicalEvaluation?.id) {
          setIsOpen(false);
          navigate(
            `/incor-laboral/colaboradores/${slug}/examen/${response.medicalEvaluation.id}`
          );
        }
      });
    }
  };

  const handleCancel = () => {
    setSelectedOption(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Seleccione el Tipo de Evaluación</DialogTitle>
          <DialogDescription>
            Por favor seleccione el tipo de evalución para el exámen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {evaluationTypes.map((option) => (
            <div key={option.id} className="flex items-start space-x-2">
              <Checkbox
                id={String(option.id)}
                checked={selectedOption === option.id}
                onCheckedChange={() => handleCheckboxChange(option.id)}
              />
              <div>
                <Label
                  htmlFor={String(option.id)}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.name}
                </Label>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !selectedOption ||
              addCollaboratorMedicalEvaluationMutation.isPending
            }
            variant={"incor"}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
