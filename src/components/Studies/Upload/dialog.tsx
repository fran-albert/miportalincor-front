import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment-timezone";
import { SubmitHandler, useForm } from "react-hook-form";
import { StudyTypeSelect } from "@/components/Select/Study/select";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { DoctorSelect } from "@/components/Select/Doctor/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Upload,
  Calendar,
  User,
  MessageSquare,
  Plus,
  X,
  File,
} from "lucide-react";
import CustomDatePicker from "@/components/Date-Picker";

interface AddStudyProps {
  idUser: number;
}

export default function StudyDialog({ idUser }: AddStudyProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const [selectedStudy, setSelectedStudy] = useState<StudyType | null>(null);
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const { uploadStudyMutation } = useStudyMutations();
  const { promiseToast } = useToastContext();

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
      const promise = uploadStudyMutation.mutateAsync(formData);

      await promiseToast(promise, {
        loading: {
          title: "Subiendo estudio...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Estudio subido!",
          description: "El estudio se ha subido exitosamente",
        },
        error: (error: any) => ({
          title: "Error al subir estudio",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      // Only close the modal and reset form upon successful submission
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

  const [noteValue, setNoteValue] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={toggleDialog}
          className="w-full bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Estudio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Sticky Gradient Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Agregar Nuevo Estudio</h2>
                <p className="text-sm text-white/80 mt-1">
                  Complete los datos del estudio médico
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Tipo de Estudio */}
            <div className="space-y-2">
              <Label
                htmlFor="studyType"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-greenPrimary" />
                Tipo de Estudio *
              </Label>
              <StudyTypeSelect
                selected={selectedStudy || undefined}
                onStudyChange={handleStudyChange}
              />
              <input type="hidden" {...register("StudyTypeId")} />
              <input type="hidden" {...register("StudyTypeName")} />
              <p className="text-xs text-gray-500">
                Selecciona el tipo de estudio médico
              </p>
            </div>

            {/* Archivos */}
            <div className="space-y-2">
              <Label
                htmlFor="file"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Upload className="h-4 w-4 text-greenPrimary" />
                Archivos del Estudio *
              </Label>
              <Input
                type="file"
                className="text-black focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
                multiple
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Archivos seleccionados ({selectedFiles.length})
                  </p>
                  <ScrollArea className="max-h-32">
                    <ul className="space-y-2 pr-2">
                      {selectedFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-200"
                        >
                          <File className="h-4 w-4 text-greenPrimary flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Puedes seleccionar múltiples archivos
              </p>
            </div>

            {/* Comentario */}
            <div className="space-y-2">
              <Label
                htmlFor="comment"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-greenPrimary" />
                Comentario
              </Label>
              <Textarea
                id="comment"
                {...register("Note", { required: true })}
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Describe detalles adicionales del estudio..."
                rows={4}
                className="resize-none focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
                maxLength={500}
              />
              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-500">
                  Observaciones o notas adicionales
                </p>
                <span className="text-gray-400">
                  {noteValue?.length || 0} / 500
                </span>
              </div>
            </div>

            {/* Fecha del Estudio */}
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4 text-greenPrimary" />
                Fecha del Estudio *
              </Label>
              <CustomDatePicker
                setStartDate={setStartDate}
                setValue={setValue}
                fieldName="date"
                initialDate={startDate}
              />
              <p className="text-xs text-gray-500">
                Fecha en la que se realizó el estudio
              </p>
            </div>

            {/* Médico Responsable */}
            <div className="space-y-2">
              <Label
                htmlFor="doctor"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <User className="h-4 w-4 text-greenPrimary" />
                Médico Responsable (Opcional)
              </Label>
              <DoctorSelect control={control} />
              <p className="text-xs text-gray-500">
                Selecciona el médico que solicitó el estudio
              </p>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={toggleDialog}
                className="px-6 hover:bg-gray-50"
                disabled={uploadStudyMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploadStudyMutation.isPending}
                className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px]"
              >
                {uploadStudyMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Estudio
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
