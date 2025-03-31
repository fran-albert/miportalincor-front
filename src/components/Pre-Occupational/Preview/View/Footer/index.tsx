import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  pageNumber: number;
  doctorName: string;
  doctorLicense: string;
  signatureUrl: string;
}

const FooterHtml: React.FC<Props> = ({
  pageNumber,
  doctorName,
  doctorLicense,
  signatureUrl,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });

  return (
    <div className="w-full flex flex-row justify-between items-end pt-2 mt-4 text-black">
      {/* Columna izquierda: Firma y datos del médico */}
      <div className="flex flex-col items-start">
        <img
          src={signatureUrl}
          alt="Firma del médico"
          className="h-16 object-contain mb-1"
        />
        <p className="font-bold">{doctorName}</p>
        <p>M.P. {doctorLicense}</p>
      </div>

      {/* Columna central: Fecha */}
      <div className="flex-grow flex items-center justify-center text-center">
        <p>Fecha {currentDate}</p>
      </div>

      {/* Columna derecha: Número de página */}
      <div className="text-right">
        <p>Página {pageNumber}</p>
      </div>
    </div>
  );
};

export default FooterHtml;
