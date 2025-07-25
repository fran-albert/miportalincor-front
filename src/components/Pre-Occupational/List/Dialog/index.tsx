"use client";

import type React from "react";

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
import { useDispatch } from "react-redux";
import { resetForm } from "@/store/Pre-Occupational/preOccupationalSlice";
import { DoctorSelect } from "@/components/Select/Doctor/select";
import { useForm } from "react-hook-form";

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
  const { control, watch, reset } = useForm<{ DoctorId: string }>({
    defaultValues: { DoctorId: "" },
  });
  const selectedDoctor = watch("DoctorId");
  const handleCheckboxChange = (optionId: number) => {
    setSelectedOption(optionId === selectedOption ? null : optionId);
    reset({ DoctorId: "" }); // Reset doctor selection when changing evaluation type
  };

  const dispatch = useDispatch();

  const handleConfirm = () => {
    if (selectedOption && selectedDoctor) {
      setIsOpen(false);
      const mutationPromise =
        addCollaboratorMedicalEvaluationMutation.mutateAsync({
          evaluationTypeId: selectedOption,
          collaboratorId: id,
          doctorId: Number.parseInt(selectedDoctor), // Asumiendo que el doctorId es número
        });

      toast.promise(mutationPromise, {
        loading: <LoadingToast message="Creando examen..." />,
        success: <SuccessToast message="Examen creado con éxito" />,
        error: <ErrorToast message="Error al crear el examen" />,
      });

      mutationPromise.then((response) => {
        if (response?.medicalEvaluation?.id) {
          dispatch(resetForm());
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
    dispatch(resetForm());
    setIsOpen(false);
  };

  // Determinar si se puede mostrar el select de doctores
  const showDoctorSelect = selectedOption !== null;

  // Determinar si se puede confirmar
  const canConfirm = selectedOption !== null && selectedDoctor !== "";

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Examen</DialogTitle>
          <DialogDescription>
            Complete los siguientes pasos para crear el examen médico.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Paso 1: Selección del tipo de evaluación */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Paso 1: Seleccione el Tipo de Evaluación
            </Label>
            <div className="grid gap-3">
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
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paso 2: Selección del doctor */}
          {showDoctorSelect && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Paso 2: Seleccione el Doctor
              </Label>
              <DoctorSelect control={control} disabled={!showDoctorSelect} />
            </div>
          )}

          {/* Indicador de progreso */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div
              className={`w-2 h-2 rounded-full ${
                selectedOption ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span>Tipo de evaluación</span>
            <div
              className={`w-2 h-2 rounded-full ${
                selectedDoctor ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span>Doctor asignado</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !canConfirm || addCollaboratorMedicalEvaluationMutation.isPending
            }
            variant={"incor"}
          >
            {addCollaboratorMedicalEvaluationMutation.isPending
              ? "Creando..."
              : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
