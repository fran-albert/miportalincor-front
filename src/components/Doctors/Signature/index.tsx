import React from "react";
import { useDoctor } from "@/hooks/Doctor/useDoctor";

interface Props {
  doctorId: number;
}

export const DoctorSignature: React.FC<Props> = ({ doctorId }) => {
  const { doctor, isLoading, isError } = useDoctor({
    auth: true,
    id: doctorId,
  });

  if (isLoading) return <div>Cargando...</div>;
  if (isError || !doctor) return null;

  return (
    <div className="flex flex-col items-center space-y-1 mt-4">
      {doctor.firma && (
        <img
          src={doctor.firma}
          alt={`Firma Dr. ${doctor.lastName}`}
          className="h-16 object-contain"
        />
      )}
      {doctor.sello && (
        <img
          src={doctor.sello}
          alt={`Sello Dr. ${doctor.lastName}`}
          className="h-12 object-contain"
        />
      )}
    </div>
  );
};
