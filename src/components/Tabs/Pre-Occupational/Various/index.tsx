import { useState, useEffect, useCallback, useMemo } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Eye, Download, Trash2, File, Pencil, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import { DataType } from "@/types/Data-Type/Data-Type";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { StudySection, UploadedFile } from "@/types/Study/Study";
import { useUploadStudyFileMutation } from "@/hooks/Study/useUploadStudyFileCollaborator";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { parseBoolean } from "@/common/helpers/helpers";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  studiesCategory: DataType[];
  collaborator: Collaborator;
  medicalEvaluationId: number;
  urls: GetUrlsResponseDto[];
  dataValues?: DataValue[];
  standalone?: boolean;
}

const ALLOWED_CATEGORIES = [
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
] as const;

const normalizeStudyName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const EXCLUDED_STUDY_NAMES = ["preocupacional"];
const TEST_TO_STUDY_SECTION: Record<string, string[]> = {
  "Glucemia en Ayuna": ["Laboratorios"],
  Hemograma: ["Laboratorios"],
  "Examen orina": ["Examen de Orina"],
  Electrocardiograma: ["Electrocardiograma"],
  "Panel de drogas (COC, THC, etc.)": ["Panel de Drogas"],
  "Pruebas hepáticas (TGO, TGP)": ["Pruebas Hepáticas (TGO; TGP)"],
  Psicotecnico: ["Psicotecnico"],
  Audiometría: ["Audiometría Total"],
  Espirometría: ["Espirometría"],
  "Examen visual (Agudeza, campo, profundidad, cromatismo)": [
    "Examen Oftalmológico",
  ],
  "Radiografía tórax y lumbar": ["RX de Tórax (F)"],
  Otros: ["Otros"],
};

export default function VariousTab({
  isEditing,
  setIsEditing,
  collaborator,
  studiesCategory,
  medicalEvaluationId,
  urls,
  dataValues,
  standalone = false,
}: Props) {
  const initialSections = useMemo(
    () => {
      const allowedCategorySet = new Set(
        ALLOWED_CATEGORIES.map((category) => normalizeStudyName(category))
      );

      const urlStudyNames = urls
        .map((url) => url.dataTypeName)
        .filter(
          (name) => !EXCLUDED_STUDY_NAMES.includes(normalizeStudyName(name))
        );
      const expectedStudyNamesFromTests = (dataValues ?? [])
        .filter(
          (dataValue) =>
            dataValue.dataType.category === "GENERAL" &&
            dataValue.dataType.dataType === "BOOLEAN" &&
            parseBoolean(dataValue.value)
        )
        .flatMap(
          (dataValue) => TEST_TO_STUDY_SECTION[dataValue.dataType.name] ?? []
        );
      const expectedStudyNames = [
        ...urlStudyNames,
        ...expectedStudyNamesFromTests,
      ];

      const prioritizedStudies = studiesCategory.filter((study) => {
        const normalizedName = normalizeStudyName(study.name);
        return (
          allowedCategorySet.has(normalizedName) ||
          expectedStudyNames.some(
            (expectedStudyName) =>
              normalizeStudyName(expectedStudyName) === normalizedName
          )
        );
      });

      const effectiveStudies =
        prioritizedStudies.length > 0
          ? prioritizedStudies
          : studiesCategory.length > 0
            ? studiesCategory
            : ALLOWED_CATEGORIES.map((name, index) => ({
                id: -(index + 1),
                name,
                category: "ESTUDIOS" as const,
                dataType: "STRING" as const,
              }));

      const mergedNames = [
        ...effectiveStudies.map((study) => study.name),
        ...expectedStudyNames,
      ].filter(
        (name, index, array) =>
          !EXCLUDED_STUDY_NAMES.includes(normalizeStudyName(name)) &&
          array.findIndex(
            (currentName) =>
              normalizeStudyName(currentName) === normalizeStudyName(name)
          ) === index
      );

      return mergedNames.map((studyName) => ({
        id: normalizeStudyName(studyName).replace(/\s+/g, "-"),
        title: studyName,
        files: [] as UploadedFile[],
      }));
    },
    [dataValues, studiesCategory, urls]
  );

  const [sections, setSections] = useState<StudySection[]>(initialSections);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const visibleSections =
    sections.length > 0
      ? sections
      : ALLOWED_CATEGORIES.map((studyName) => ({
          id: normalizeStudyName(studyName).replace(/\s+/g, "-"),
          title: studyName,
          files: [] as UploadedFile[],
        }));

  const updateSectionsWithUrls = useCallback(
    (sectionUrls: { id: number; url: string; dataTypeName: string }[]) => {
      setSections(
        initialSections.map((section) => {
          const sectionFiles: UploadedFile[] = sectionUrls
            .filter(
              (urlObj) =>
                normalizeStudyName(urlObj.dataTypeName) ===
                normalizeStudyName(section.title)
            )
            .map((urlObj) => {
              const urlParts = urlObj.url.split("/");
              const fileName = urlParts[urlParts.length - 1].split("?")[0];
              return { id: urlObj.id, name: fileName, url: urlObj.url };
            });
          return { ...section, files: sectionFiles };
        })
      );
    },
    [initialSections]
  );

  useEffect(() => {
    updateSectionsWithUrls(urls);
  }, [updateSectionsWithUrls, urls]);

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

  const clearFileInput = (sectionId: string) => {
    const input = document.getElementById(
      `file-input-${sectionId}`
    ) as HTMLInputElement | null;
    if (input) input.value = "";
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

    uploadStudyMutation.mutate(
      { collaboratorId: collaborator.id, formData },
      {
        onSettled: () => clearFileInput(sectionId),
      }
    );
  };

  const removeFile = (sectionId: string, file: UploadedFile) => {
    setDeletingIds((prev) => [...prev, Number(file.id)]);
    deleteDataValuesMutation.mutate(Number(file.id), {
      onSuccess: () => {
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
        setDeletingIds((prev) => prev.filter((id) => id !== file.id));
      },
      onError: (error) => {
        console.error("Error eliminando el archivo:", error);
        setDeletingIds((prev) => prev.filter((id) => id !== file.id));
      },
    });
  };

  const content = (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h4 className="text-base font-semibold text-greenPrimary">
            Estudios y archivos
          </h4>
          <p className="text-sm leading-6 text-slate-600">
            Subí la documentación del examen y mantené cada estudio ordenado
            por categoría.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-greenPrimary/15 bg-white px-4 py-2 text-sm font-medium text-greenSecondary shadow-sm transition hover:border-greenPrimary/30 hover:bg-greenPrimary/5"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-4 h-4" /> Habilitar edición
          </button>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleSections.map((section) => (
          <section
            key={section.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-greenPrimary">
                  {section.title}
                </h5>
                <p className="text-xs leading-5 text-slate-500">
                  {section.files.length > 0
                    ? `${section.files.length} archivo${section.files.length === 1 ? "" : "s"} cargado${section.files.length === 1 ? "" : "s"}`
                    : "Sin archivos cargados por ahora."}
                </p>
              </div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {section.files.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {section.files.length > 0 ? (
                <div className="space-y-2">
                  {section.files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <File className="h-4 w-4 shrink-0 text-greenPrimary" />
                        <span className="truncate text-sm text-slate-700">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                          onClick={() => window.open(file.url, "_blank")}
                          title="Ver archivo"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
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
                        {isEditing &&
                          (deletingIds.includes(Number(file.id)) ? (
                            <span className="px-1 text-xs italic text-slate-500">
                              Eliminando...
                            </span>
                          ) : (
                            <button
                              onClick={() => removeFile(section.id, file)}
                              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Eliminar archivo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-3 py-3 text-sm text-slate-500">
                  Sin archivos cargados por ahora.
                </div>
              )}

              <label
                htmlFor={`file-input-${section.id}`}
                onDrop={(e) => handleDrop(section.id, e)}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm transition-colors",
                  "border-slate-300 bg-white text-greenSecondary hover:border-greenPrimary/30 hover:bg-slate-50",
                  !isEditing && "cursor-not-allowed opacity-50"
                )}
              >
                <Upload className="h-4 w-4" />
                <span className="font-medium">Subir archivo</span>
                <span className="text-xs text-slate-500">
                  o arrastrarlo acá
                </span>
              </label>
              <input
                id={`file-input-${section.id}`}
                type="file"
                onChange={(e) => handleFileChange(section.id, e)}
                className="hidden"
                disabled={!isEditing}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {content}
      </div>
    );
  }

  return (
    <TabsContent value="various" className="mt-4 space-y-4">
      {content}
    </TabsContent>
  );
}
