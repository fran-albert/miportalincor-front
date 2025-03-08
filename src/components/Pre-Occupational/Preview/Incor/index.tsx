import { formatCuilCuit } from "@/common/helpers/helpers";
import { Company } from "@/types/Company/Company";

interface Props {
  company: Company;
}

export default function AptitudeCertificateHeader({ company }: Props) {
  return (
    <div className="text-center border-b pb-4">
      {/* Logo */}
      <div className="flex justify-center mb-2">
        <img
          src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1740699262/wrivrtuyqs3yqo299ooo.png" 
          alt="Sesil Medicina Laboral"
          width={400}
          height={100}
        />
      </div>

      {/* Título */}
      <h2 className="text-xl font-bold">
        Certificado médico de aptitud ocupacional
      </h2>

      {/* Legislación */}
      <p className="text-sm text-gray-600">
        Ley Nacional 19.587, Dto. 1338/96, Ley Nacional 24.557 y Res. 37/10
      </p>

      {/* Información de la empresa */}
      <p className="font-semibold mt-1">
        Empresa: {company.name} - CUIT {formatCuilCuit(company.taxId)}
      </p>
    </div>
  );
}
