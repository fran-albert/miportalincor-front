import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment-timezone";
import { SubmitHandler, useForm } from "react-hook-form";
import { StudyTypeSelect } from "@/components/Select/Study/select";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { StudyType } from "@/types/Study-Type/Study-Type";
import {
  FileText,
  Upload,
  Calendar,
  Building2,
  MessageSquare,
  Plus,
  X,
  File,
  ExternalLink,
} from "lucide-react";
import CustomDatePicker from "@/components/Date-Picker";

interface ExternalStudyDialogProps {
  idUser: number;
}

interface ExternalStudyFormData {
  StudyTypeId?: string;
  StudyTypeName?: string;
  date: Date;
  Note: string;
  ExternalInstitution?: string;
}

export default function ExternalStudyDialog({ idUser }: ExternalStudyDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDialog = () => setIsOpen(!isOpen);
  const [selectedStudy, setSelectedStudy] = useState<StudyType | null>(null);
  const { register, handleSubmit, reset, setValue } =
    useForm<ExternalStudyFormData>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const { uploadExternalStudyMutation } = useStudyMutations();
  const { promiseToast } = useToastContext();

  const onSubmit: SubmitHandler<ExternalStudyFormData> = async (data) => {
    const formData = new FormData();

    if (selectedStudy) {
      formData.append("studyTypeId", String(selectedStudy.id));
    } else if (data.StudyTypeId) {
      formData.append("studyTypeId", data.StudyTypeId);
    }

    if (idUser) {
      formData.append("userId", String(idUser));
    }

    // File is optional for external studies
    if (selectedFile) {
      formData.append("studyFile", selectedFile);
    }

    const date = data.date;
    const formattedDateISO = moment(date).toISOString();
    formData.append("date", formattedDateISO);

    if (data.Note) {
      formData.append("note", data.Note);
    }

    if (data.ExternalInstitution) {
      formData.append("externalInstitution", data.ExternalInstitution);
    }

    try {
      const promise = uploadExternalStudyMutation.mutateAsync(formData);

      await promiseToast(promise, {
        loading: {
          title: "Registrando estudio externo...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Estudio externo registrado!",
          description: "El estudio se ha registrado exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al registrar estudio",
          description:
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      reset();
      setSelectedFile(null);
      setSelectedStudy(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Error al agregar el estudio externo", error);
    }
  };

  const handleStudyChange = (studyType: StudyType) => {
    setSelectedStudy(studyType);
    setValue("StudyTypeId", String(studyType.id));
    setValue("StudyTypeName", studyType.name);
  };

  useEffect(() => {
    if (!isOpen) {
      setValue("StudyTypeId", "");
      setValue("StudyTypeName", "");
      setValue("ExternalInstitution", "");
      setSelectedStudy(null);
      setSelectedFile(null);
      reset();
    }
  }, [isOpen, setValue, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const [noteValue, setNoteValue] = useState("");
  const [institutionValue, setInstitutionValue] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={toggleDialog}
          variant="outline"
          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 shadow-sm"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Estudio Externo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Sticky Gradient Header - Orange for external */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Registrar Estudio Externo</h2>
                <p className="text-sm text-white/80 mt-1">
                  Estudio realizado en otra institución
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
                <FileText className="h-4 w-4 text-orange-500" />
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

            {/* Institución Externa */}
            <div className="space-y-2">
              <Label
                htmlFor="externalInstitution"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Building2 className="h-4 w-4 text-orange-500" />
                Institución de Origen (Opcional)
              </Label>
              <Input
                id="externalInstitution"
                {...register("ExternalInstitution")}
                value={institutionValue}
                onChange={(e) => {
                  setInstitutionValue(e.target.value);
                  setValue("ExternalInstitution", e.target.value);
                }}
                placeholder="Ej: Laboratorio Central, Clínica del Sol..."
                className="focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                maxLength={255}
              />
              <p className="text-xs text-gray-500">
                Nombre del laboratorio o clínica donde se realizó el estudio
              </p>
            </div>

            {/* Archivo (Opcional) */}
            <div className="space-y-2">
              <Label
                htmlFor="file"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Upload className="h-4 w-4 text-orange-500" />
                Archivo del Estudio (Opcional)
              </Label>
              <Input
                type="file"
                className="text-black focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="mt-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[300px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  Puedes subir el PDF del estudio o dejarlo vacío si solo quieres registrar los datos
                </p>
              )}
            </div>

            {/* Fecha del Estudio */}
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4 text-orange-500" />
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

            {/* Comentario */}
            <div className="space-y-2">
              <Label
                htmlFor="comment"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-orange-500" />
                Observaciones (Opcional)
              </Label>
              <Textarea
                id="comment"
                {...register("Note")}
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Notas adicionales sobre el estudio..."
                rows={3}
                className="resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={toggleDialog}
                className="px-6 hover:bg-gray-50"
                disabled={uploadExternalStudyMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploadExternalStudyMutation.isPending || !selectedStudy}
                className="px-6 bg-orange-500 hover:bg-orange-600 text-white shadow-md min-w-[180px]"
              >
                {uploadExternalStudyMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Estudio
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
