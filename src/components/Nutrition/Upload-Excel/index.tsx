import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNutritionDataMutations } from "@/hooks/Nutrition-Data/useNutritionDataMutation";

interface Props {
  userId: number;
}

export default function ExcelUploader({ userId }: Props) {
  const { uploadExcelNutritionDataMutation } = useNutritionDataMutations();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const isExcelFile = file?.name.match(/\.(xlsx|xls|csv)$/i);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setUploadSuccess(false);
  };

  const downloadExample = () => {
    const url =
      "https://res.cloudinary.com/dfoqki8kt/raw/upload/v1741311204/Plantilla_Nutricion.xlsx";
    const a = document.createElement("a");
    a.href = url;
    a.download = "Planilla_Nutricion.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    uploadExcelNutritionDataMutation.mutate(
      { formData, userId },
      {
        onSuccess: () => {
          setIsUploading(false);
          setUploadSuccess(true);
        },
        onError: (error) => {
          console.error("Error subiendo archivo:", error);
          setIsUploading(false);
        },
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="gap-2 text-greenPrimary">
          Subir archivo Excel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir archivo Excel</DialogTitle>
          <DialogDescription>
            Sube tu archivo Excel con los datos requeridos. Asegúrate de que el
            formato sea correcto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={downloadExample}
              className="gap-2 w-full sm:w-auto"
            >
              <Download size={16} />
              Descargar archivo de ejemplo
            </Button>
            <p className="text-sm text-muted-foreground">
              Descarga primero un archivo de ejemplo para ver el formato
              requerido.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excel-file">Archivo Excel</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && !isExcelFile && (
              <p className="text-sm text-destructive">
                Por favor selecciona un archivo Excel válido (.xlsx, .xls, .csv)
              </p>
            )}
          </div>

          {uploadSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                ¡Archivo subido exitosamente!
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || !isExcelFile || isUploading}
            className="w-full sm:w-auto sm:ml-auto bg-greenPrimary hover:bg-teal-800"
          >
            {isUploading ? "Subiendo..." : "Subir archivo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
