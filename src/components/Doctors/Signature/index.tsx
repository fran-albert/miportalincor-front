import React from "react";
import { useDoctorWithSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { DoctorSignatureAsset } from "@/components/Doctors/SignatureAsset";

interface Props {
  doctorId: string;
}

export const DoctorSignature: React.FC<Props> = ({ doctorId }) => {
  const { data, isLoading, isError } = useDoctorWithSignatures({
    auth: true,
    id: doctorId,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (isError || !data) return null;

  return (
    <div className="mt-4 grid gap-2">
      <DoctorSignatureAsset
        label="Firma"
        src={data.signatureDataUrl}
        status={data.signatureStatus}
        className="min-h-20"
      />
      <DoctorSignatureAsset
        label="Sello"
        src={data.sealDataUrl}
        status={data.sealStatus}
        className="min-h-20"
      />
    </div>
  );
};
