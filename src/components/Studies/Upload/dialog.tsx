import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaUpload } from "react-icons/fa";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import moment from "moment-timezone";
import { SubmitHandler, useForm } from "react-hook-form";
import { StudyTypeSelect } from "@/components/Select/Study/select";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { DoctorSelect } from "@/components/Select/Doctor/select";

interface AddStudyProps {
  idUser: number;
}

export default function StudyDialog({ idUser }: AddStudyProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const [selectedStudy, setSelectedStudy] = useState<StudyType | null>(null);
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadStudyMutation } = useStudyMutations();

  const onSubmit: SubmitHandler<any> = async (data) => {
    const formData = new FormData();

    if (selectedStudy) {
      formData.append("studyTypeId", String(selectedStudy.id));
      formData.append("studyTypeName", selectedStudy.name);
    } else {
      formData.append("studyTypeId", data.StudyTypeId);
      formData.append("studyTypeName", data.StudyTypeName);
    }

    if (idUser) {
      formData.append("userId", String(idUser));
    }

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("file", file);
      });
    }

    const date = data.date;
    const formattedDateISO = moment(date).toISOString();
    formData.append("date", formattedDateISO);
    formData.append("note", data.Note);

    if (data.DoctorId) {
      formData.append("doctorId", data.DoctorId);
    }

    try {
      toast.promise(uploadStudyMutation.mutateAsync(formData), {
        loading: <LoadingToast message="Subiendo nuevo estudio..." />,
        success: <SuccessToast message="Nuevo estudio subido con exito." />,
        error: (
          <ErrorToast message="Hubo un error al subir el estudio. Por favor intenta de nuevo." />
        ),
      });
      reset();
      setSelectedFiles([]);
      setSelectedStudy(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Error al agregar el estudio", error);
    }
  };

  const handleStudyChange = (studyType: StudyType) => {
    setSelectedStudy(studyType);
    setValue("StudyTypeId", studyType.id);
    setValue("StudyTypeName", studyType.name);
  };

  useEffect(() => {
    if (!isOpen) {
      setValue("DoctorId", "");
      setValue("StudyTypeId", "");
      setValue("StudyTypeName", "");
      setSelectedStudy(null);
      reset();
    }
  }, [isOpen, setValue, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          onClick={toggleDialog}
          className="flex items-center justify-center w-full p-2 border border-dashed border-gray-300 rounded hover:bg-gray-50"
        >
          <FaUpload className="w-4 h-4 mr-2 text-greenPrimary" />
          <span className="text-greenPrimary">Nuevo Estudio</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Estudio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="studyType"
                className="block text-black font-medium mb-2"
              >
                Tipo de Estudio
              </Label>
              <StudyTypeSelect
                selected={selectedStudy || undefined}
                onStudyChange={handleStudyChange}
              />
              <input type="hidden" {...register("StudyTypeId")} />
              <input type="hidden" {...register("StudyTypeName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Archivos</Label>
              <Input
                type="file"
                className="text-black"
                multiple
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm text-gray-700"
                      >
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="comment"
                className="block text-black font-medium mb-2"
              >
                Comentario
              </Label>
              <Input
                {...register("Note", { required: true })}
                placeholder="Ingresar un comentario..."
                className="text-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="mb-2" htmlFor="date">
                Fecha
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="mb-2" htmlFor="date">
                Firma Médico (Opcional)
              </Label>
              <DoctorSelect control={control} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={toggleDialog}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="incor"
              disabled={uploadStudyMutation.isPending}
            >
              Agregar Estudio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
