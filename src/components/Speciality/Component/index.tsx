import { useSpeciality } from "@/hooks/Speciality/useSpeciality";
import { SpecialityTable } from "../Table/table";
import LoadingAnimation from "@/components/Loading/loading";

function SpecialityComponent() {
  const { specialities, isLoading, error } = useSpeciality({});

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div>Error al cargar las especialidades</div>;
  }

  return <SpecialityTable specialities={specialities} />;
}

export default SpecialityComponent;
