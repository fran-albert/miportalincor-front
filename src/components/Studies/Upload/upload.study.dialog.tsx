import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUploadStudy } from "@/hooks/Study/probando.study";
import { StudyTypeSelect } from "@/components/Select/Study/select";
import { StudyType } from "@/types/Study-Type/Study-Type";

// Definición de tipos
interface StudyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
}

interface StudyTypeSelectProps {
  onStudyChange: (studyTypeId: string) => void;
}

interface DoctorSelectProps {
  control: any; // Tipo para control de react-hook-form
}

interface FormValues {
  date: string;
  Note: string;
  doctorId?: string;
}

interface StudyResponse {
  id: number;
  locationS3: string;
  studyTypeId: number;
  studyType: null | string;
  date: string;
  note: string;
  created: string;
  signedUrl: string;
  ultrasoundImages: null | any[];
}

const DoctorSelect: React.FC<DoctorSelectProps> = ({ control }) => {
  // Implementación del componente de selección de médico
  return (
    <select className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
      <option value="">Seleccione un médico (opcional)</option>
      <option value="1">Dr. García</option>
      <option value="2">Dra. Rodríguez</option>
    </select>
  );
};

// Hook personalizado para manejar la carga de estudios

const StudyUploadModal: React.FC<StudyUploadModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedStudyType, setSelectedStudyType] = useState<StudyType | null>(
    null
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      Note: "",
    },
  });

  const { toast } = useToast();
  const uploadStudyMutation = useUploadStudy();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleStudyChange = (studyType: StudyType) => {
    setSelectedStudyType(studyType);
    console.log("Selected study type:", studyType);
  };

  const onSubmit = async (formData: FormValues) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Archivos requeridos",
        description: "Por favor seleccione al menos un archivo para subir.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();

    // Agregar cada archivo al FormData
    selectedFiles.forEach((file) => {
      data.append("StudyFiles", file);
    });

    // Agregar los datos del formulario
    data.append("UserId", patientId.toString());
    data.append("StudyTypeId", String(selectedStudyType?.id));
    data.append("Date", format(new Date(formData.date), "dd/MM/yyyy"));
    data.append("Note", formData.Note);

    // Agregar el ID del doctor si se seleccionó uno
    if (formData.doctorId) {
      data.append("DoctorUserId", formData.doctorId);
    } else {
      data.append("DoctorUserId", "");
    }

    try {
      await uploadStudyMutation.mutateAsync(data);
      reset();
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error("Error handling submission:", error);
    }
  };

  const toggleDialog = () => {
    reset();
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
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
                selected={selectedStudyType || undefined}
                onStudyChange={handleStudyChange}
              />
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
              {errors.Note && (
                <p className="text-red-500 text-sm mt-1">
                  Este campo es requerido
                </p>
              )}
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
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  Este campo es requerido
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="mb-2" htmlFor="doctorId">
                Médico (Opcional)
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
              {uploadStudyMutation.isPending
                ? "Subiendo..."
                : "Agregar Estudio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudyUploadModal;
