// components/FooterHtmlConditional.tsx
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  pageNumber: number;
  useCustom?: boolean;
  doctorName?: string;
  doctorLicense?: string;
  doctorSpeciality?: string;
  signatureUrl?: string;
  sealUrl?: string;
}

const DEFAULT_DOCTOR = {
  name: "BONIFACIO Ma. CECILIA",
  license: "M.P. 96533 - M.L. 7299",
  speciality: "Especialista en Medicina del Trabajo",
  signatureUrl:
    "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png",
};

const FooterHtmlConditional: React.FC<Props> = ({
  pageNumber,
  useCustom = false,
  doctorName,
  doctorLicense,
  doctorSpeciality,
  signatureUrl,
  sealUrl,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });

  // Decidir datos
  const name = useCustom && doctorName ? doctorName : DEFAULT_DOCTOR.name;
  const licence =
    useCustom && doctorLicense ? doctorLicense : DEFAULT_DOCTOR.license;
  const speciality = useCustom && doctorSpeciality ? doctorSpeciality : DEFAULT_DOCTOR.speciality;
  const sigUrl =
    useCustom && signatureUrl ? signatureUrl : DEFAULT_DOCTOR.signatureUrl;
  const sealImageUrl = useCustom && sealUrl ? sealUrl : undefined;

  return (
    <div className="w-full flex flex-row justify-between items-end pt-2 mt-4 text-black">
      {/* Izquierda: Firma y datos */}
      <div className="flex flex-col items-start relative">
        <img
          src={sigUrl}
          alt={`Firma ${name}`}
          className="h-16 object-contain mb-1"
        />
        {sealImageUrl && (
          <img
            src={sealImageUrl}
            alt={`Sello ${name}`}
            className="h-12 object-contain mb-1"
            style={{ position: "absolute", bottom: 0, left: 0 }}
          />
        )}
        <p className="font-bold text-sm">{name}</p>
        <p className="italic text-xs mb-1">{speciality}</p>
        <p className="text-sm">{licence}</p>
      </div>

      {/* Centro: Fecha */}
      <div className="flex-grow flex items-center justify-center text-center">
        <p>Fecha {currentDate}</p>
      </div>

      {/* Derecha: Página */}
      <div className="text-right">
        <p>Página {pageNumber}</p>
      </div>
    </div>
  );
};

export default FooterHtmlConditional;
