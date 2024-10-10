import { BreadcrumbComponentGenerator } from "@/components/Breadcrumb/Component-Generator";
import LoadingAnimation from "@/components/Loading/loading";
import LabCard from "../Card/card";

const LaboratoriesPageWrapper = ({
  isLoading,
  error,
  labsDetails,
  studiesByUserId,
  entity,
  role,
  idUser,
}: any) => {
  if (error) {
    return (
      <div className="text-red-500">
        Hubo un error al cargar los laboratorios del {role}.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponentGenerator role={role} entity={entity} />
      <LabCard
        labsDetails={labsDetails}
        studiesByUserId={studiesByUserId}
        role={role}
        idUser={idUser}
      />
    </div>
  );
};

export default LaboratoriesPageWrapper;
