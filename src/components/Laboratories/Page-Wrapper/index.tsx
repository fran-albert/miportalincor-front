import { BreadcrumbComponentGenerator } from "@/components/Breadcrumb/Component-Generator";
import LoadingAnimation from "@/components/Loading/loading";
import LabCard from "../Card/card";

const LaboratoriesPageWrapper = ({
  isLoading,
  error,
  studiesByUserId,
  entity,
  role,
  idUser,
  bloodTests,
  bloodTestsData,
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
    <div className="space-y-4 p-6">
      <BreadcrumbComponentGenerator role={role} entity={entity} />
      <LabCard
        bloodTests={bloodTests}
        studiesByUserId={studiesByUserId}
        bloodTestsData={bloodTestsData}
        role={role}
        idUser={idUser}
      />
    </div>
  );
};

export default LaboratoriesPageWrapper;
