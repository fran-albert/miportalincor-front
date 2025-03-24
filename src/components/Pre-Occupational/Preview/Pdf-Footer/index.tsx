import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  pageNumber: number;
  doctorName: string;
  doctorLicense: string;
  signatureUrl: string;
}

const PdfFooter: React.FC<Props> = ({
  pageNumber,
  doctorName,
  doctorLicense,
  signatureUrl,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });

  return (
    <div className="w-full flex justify-between items-end pt-8 mt-12 text-xs text-gray-900">
      <div className="flex flex-col items-start">
        <img
          src={signatureUrl}
          alt="Firma del médico"
          className="h-10 object-contain mb-1"
        />
        <p className="font-semibold">{doctorName}</p>
        <p>M.P. {doctorLicense}</p>
      </div>
      <div className="text-center">
        <p>Fecha {currentDate}</p>
      </div>
      <div className="text-right">
        <p>Página {pageNumber}</p>
      </div>
    </div>
  );
};

export default PdfFooter;
