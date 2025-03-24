import { RootState } from "@/store/store";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import React from "react";
import { useSelector } from "react-redux";
import PdfFooter from "../Pdf-Footer";
import HeaderPreview from "../Header";

interface FirstPagePreviewProps {
  collaborator: Collaborator;
}

const FirstPagePreview: React.FC<FirstPagePreviewProps> = ({
  collaborator,
}) => {
  const examResults = useSelector(
    (state: RootState) => state.preOccupational.formData.examResults
  );

  const { conclusion, conclusionOptions } = useSelector(
    (state: RootState) => state.preOccupational.formData
  );

  const options = [
    {
      value: "apto-001",
      label: "Apto para desempeñar el cargo sin patología aparente",
    },
    {
      value: "apto-002",
      label:
        "Apto para desempeñar el cargo con patología que no limite lo laboral",
    },
    { value: "apto-003", label: "Apto con restricciones" },
    { value: "no-apto", label: "No apto" },
    { value: "aplazado", label: "Aplazado" },
  ];

  const selectedOptions = options.filter(
    (option) =>
      conclusionOptions &&
      conclusionOptions[option.value as keyof typeof conclusionOptions]
  );

  return (
    <div className="w-[210mm] min-h-[297mm] p-4 text-black font-sans text-sm flex flex-col justify-between">
      <HeaderPreview
        collaborator={collaborator}
        companyData={collaborator.company}
      />
      {/* Sección Resultados del Examen */}
      <div className="mb-4">
        <div className="p-2">
          {/* Contenedor con border que ocupa todo el ancho y centra el texto */}
          <div className="flex items-center justify-center">
            <div className="relative px-2 py-1">
              <div className="absolute inset-0 opacity-20 rounded-md pointer-events-none" />
              <h1 className="relative text-base font-bold text-center text-gray-800 z-10">
                Resultados del Examen
              </h1>
            </div>
          </div>
          <div className="space-y-2">
            {/* Examen: Clínico */}
            <div>
              <p className="font-bold text-sm">CLÍNICO</p>
              <p className="ml-4 text-sm">
                {examResults?.clinico || "No definido"}
              </p>
            </div>
            {/* Examen: Audiometría */}
            <div>
              <p className="font-bold text-sm">AUDIOMETRÍA</p>
              <p className="ml-4 text-sm">
                {examResults?.psicotecnico || "No definido"}
              </p>
            </div>
            {/* Examen: RX Tórax */}
            <div>
              <p className="font-bold text-sm">RX TÓRAX FRENTE</p>
              <p className="ml-4 text-sm">
                {examResults?.["rx-torax"] || "No definido"}
              </p>
            </div>
            <div>
              <p className="font-bold text-sm">ELECTROCARDIOGRAMA</p>
              <p className="ml-4 text-sm">
                {examResults?.["electrocardiograma-result"] || "No definido"}
              </p>
            </div>
            <div>
              <p className="font-bold text-sm">
                LABORATORIO BÁSICO LEY (RUTINA)
              </p>
              <p className="ml-4 text-sm">
                {examResults?.laboratorio || "No definido"}
              </p>
            </div>
            <div>
              <p className="font-bold text-sm">ELECTROENCEFALOGRAMA</p>
              <p className="ml-4 text-sm">
                {examResults?.electroencefalograma || "No definido"}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Espacio adicional para Conclusión y Firma de Médicos */}
      <div className="mt-4">
        <div className="flex items-center justify-center">
          <div className="relative px-2 py-1">
            <div className="absolute inset-0 opacity-20 rounded-md pointer-events-none" />
            <h1 className="relative text-base font-bold text-center text-gray-800 z-10">
              Conclusión
            </h1>
          </div>
        </div>
        {/* Aquí puedes agregar el contenido de la conclusión */}
        <div className="mt-2 space-y-2">
          {selectedOptions.length > 0 && (
            <p>{selectedOptions.map((option) => option.label).join(", ")}</p>
          )}
          <p>{conclusion || "No definido"}</p>
        </div>

        <hr className="my-4 border-t border-gray-900" />
        <p className="text-xs text-center">
          Ley Nacional 19.587, Dto. 1338/96, Ley Nacional 24.557 y Res. 37/10
        </p>
      </div>
      <PdfFooter
        pageNumber={1}
        doctorName="Dr. Juan Pérez"
        doctorLicense="12345"
        signatureUrl="https://your-url-to-signature.com/firma.png"
      />
    </div>
  );
};

export default FirstPagePreview;
