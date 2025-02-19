"use client";
import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eye, Download, Trash2, File, FileUp, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  name: string;
  url: string;
}

interface StudySection {
  id: string;
  title: string;
  files: UploadedFile[];
}

export default function VariousTab() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [sections, setSections] = useState<StudySection[]>([
    { id: "labs", title: "Laboratorios", files: [] },
    { id: "psych", title: "Psicotecnico", files: [] },
    {
      id: "ddjj",
      title: "DDJJ de trabajador",
      files: [
        { name: "ddjj_crocci.jpeg", url: "#" },
        { name: "ddjj_1_crocci.jpeg", url: "#" },
      ],
    },
    { id: "others", title: "Otros", files: [] },
    { id: "urine", title: "Examen de Orina", files: [] },
    { id: "drugs-panel", title: "Panel de Drogas", files: [] },
    { id: "hepatics-test", title: "Pruebas Hepáticas (TGO; TGP)", files: [] },
    { id: "electro", title: "Electrocardiograma", files: [] },
    { id: "rx-torax", title: "RX de Tórax (F)", files: [] },
    {
      id: "rx-columna-lumbosacra",
      title: "RX de Columna Lumbosacra (F y P)",
      files: [],
    },
    { id: "audiometria", title: "Audiometría Total", files: [] },
    { id: "espirometria", title: "Espirometría", files: [] },
    { id: "ergometria", title: "Ergometría", files: [] },
    {
      id: "rmn-columna-lumbosacra",
      title: "RMN de Columna Lumbosacra",
      files: [],
    },
    { id: "electroencefalograma", title: "Electroencefalograma", files: [] },
    {
      id: "examen-equilibriometrico",
      title: "Examen Equilibriométrico",
      files: [],
    },
    { id: "examen-oftalmologico", title: "Examen Oftalmológico", files: [] },
    { id: "encuesta-del-sueño", title: "Encuenstra del Sueño", files: [] },
    { id: "score-framingham", title: "Score de Framingham", files: [] },
  ]);

  const handleDrop = (sectionId: string, e: React.DragEvent) => {
    e.preventDefault();
    console.log(sectionId);
    // Handle file drop logic here
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (sectionId: string, fileName: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            files: section.files.filter((file) => file.name !== fileName),
          };
        }
        return section;
      })
    );
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
              {/* File list */}
              {section.files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-4 p-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors group"
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
                        onClick={() => removeFile(section.id, file.name)}
                        className="p-1 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Upload area */}
              <div
                onDrop={(e) => handleDrop(section.id, e)}
                onDragOver={handleDragOver}
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {isEditing && (
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="destructive"
            onClick={() => {
              // Handle cancel logic here
            }}
          >
            Cancelar
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              // Handle save logic here
            }}
          >
            Guardar
          </Button>
        </div>
      )}
    </TabsContent>
  );
}
