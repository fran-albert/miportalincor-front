import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DoctorInfo {
  name: string;
  license: string;
  signatureUrl: string;
}

interface Props {
  pageNumber: number;
  primaryDoctor: DoctorInfo;
  dualSign?: boolean; // <-- booleano
  secondDoctor?: DoctorInfo; // <-- datos del 2do médico
}

const FooterHtml: React.FC<Props> = ({
  pageNumber,
  primaryDoctor,
  dualSign = false,
  secondDoctor,
}) => {
  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: es });

  const DoctorBlock = ({ doctor }: { doctor: DoctorInfo }) => (
    <div className="flex flex-col items-start">
      <img
        src={doctor.signatureUrl}
        alt={`Firma de ${doctor.name}`}
        className="h-16 object-contain mb-1"
      />
      <p className="font-bold text-sm">{doctor.name}</p>
      <p className="text-sm">{doctor.license}</p>
    </div>
  );

  return (
    <div className="w-full flex flex-row justify-between items-end pt-2 mt-4 text-black">
      {/* Columna izquierda: firmas */}
      <div className="flex flex-row gap-8 items-start">
        <DoctorBlock doctor={primaryDoctor} />
        {dualSign && secondDoctor && <DoctorBlock doctor={secondDoctor} />}
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
