import { useState, useEffect, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eye, Download, Trash2, File, FileUp, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import { DataType } from "@/types/Data-Type/Data-Type";
import { StudySection, UploadedFile } from "@/types/Study/Study";
import { useUploadStudyFileMutation } from "@/hooks/Study/useUploadStudyFileCollaborator";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  studiesCategory: DataType[];
  collaborator: Collaborator;
  medicalEvaluationId: number;
  urls: GetUrlsResponseDto[];
}

export default function VariousTab({
  isEditing,
  setIsEditing,
  collaborator,
  studiesCategory,
  medicalEvaluationId,
  urls,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allowedCategories = [
    "Laboratorios",
    "Psicotecnico",
    "DDJJ de trabajador",
    "Otros",
    "Examen de Orina",
    "Panel de Drogas",
    "Pruebas Hepáticas (TGO; TGP)",
    "Electrocardiograma",
    "RX de Tórax (F)",
    "RX de Columna Lumbosacra (F y P)",
    "Audiometría Total",
    "Espirometría",
    "Ergometría",
    "RMN de Columna Lumbosacra",
    "Electroencefalograma",
    "Examen Equilibriométrico",
    "Examen Oftalmológico",
    "Escala de Somnolencia Epworth",
    "Score de Framingham",
  ];

  const initialSections = studiesCategory
    .filter((study) => allowedCategories.includes(study.name))
    .map((study) => ({
      id: study.name.toLowerCase().replace(/\s/g, "-"),
      title: study.name,
      files: [] as UploadedFile[],
    }));

  const [sections, setSections] = useState<StudySection[]>(initialSections);

  const updateSectionsWithUrls = (
    urls: { id: number; url: string; dataTypeName: string }[]
  ) => {
    setSections(
      initialSections.map((section) => {
        const sectionFiles: UploadedFile[] = urls
          .filter(
            (urlObj) =>
              urlObj.dataTypeName.toLowerCase() === section.title.toLowerCase()
          )
          .map((urlObj) => {
            const urlParts = urlObj.url.split("/");
            const fileName = urlParts[urlParts.length - 1].split("?")[0];
            return { id: urlObj.id, name: fileName, url: urlObj.url };
          });
        return { ...section, files: sectionFiles };
      })
    );
  };

  useEffect(() => {
    updateSectionsWithUrls(urls);
  }, [urls]);

  const uploadStudyMutation = useUploadStudyFileMutation({
    collaboratorId: collaborator.id,
    setSections,
  });
  const { deleteDataValuesMutation } = useDataValuesMutations();
  const handleDrop = (sectionId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    uploadFile(sectionId, files[0]);
  };

  const handleFileChange = (
    sectionId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isEditing || !e.target.files || e.target.files.length === 0) return;
    uploadFile(sectionId, e.target.files[0]);
  };

  const uploadFile = (sectionId: string, file: File) => {
    const section = sections.find((sec) => sec.id === sectionId);
    if (!section) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("studyType", section.title);
    formData.append("userName", collaborator.userName);
    formData.append("collaboratorId", String(collaborator.id));
    formData.append("medicalEvaluationId", String(medicalEvaluationId));

    uploadStudyMutation.mutate({ collaboratorId: collaborator.id, formData });
  };

  const removeFile = (sectionId: string, file: UploadedFile) => {
    // Llamamos al hook para eliminar el registro en la base de datos.
    deleteDataValuesMutation.mutate(Number(file.id), {
      onSuccess: () => {
        // Actualizamos el estado local eliminando el archivo de la sección correspondiente.
        setSections((prev) =>
          prev.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  files: section.files.filter((f) => f.id !== file.id),
                }
              : section
          )
        );
      },
      onError: (error) => {
        console.error("Error eliminando el archivo:", error);
      },
    });
  };

  return (
    <TabsContent value="various" className="mt-4 space-y-4">
      {!isEditing && (
        <p
          className="font-medium text-greenPrimary cursor-pointer hover:underline flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-4 h-4" /> Habilitar Edición
        </p>
      )}
      <Accordion type="multiple" className="w-full space-y-4">
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="font-bold text-greenPrimary text-lg">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-3 space-y-2">
              {section.files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-4 p-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <File className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-sm text-gray-600 truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => window.open(file.url, "_blank")}
                      title="Ver archivo"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = file.url;
                        link.download = file.name;
                        link.click();
                      }}
                      title="Descargar archivo"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => removeFile(section.id, file)}
                        className="p-1 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div
                onDrop={(e) => handleDrop(section.id, e)}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => isEditing && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4",
                  "flex flex-col items-center justify-center gap-2",
                  "text-sm text-gray-500",
                  "cursor-pointer transition-colors",
                  "hover:bg-gray-50",
                  !isEditing && "opacity-50 cursor-not-allowed"
                )}
              >
                <FileUp className="h-6 w-6" />
                <p>Arrastra el archivo o haz click aquí</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(section.id, e)}
                style={{ display: "none" }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </TabsContent>
  );
}
