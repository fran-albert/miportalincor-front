import { BreadcrumbComponentGenerator } from "@/components/Breadcrumb/Component-Generator";
import LoadingAnimation from "@/components/Loading/loading";
import LabCard from "../Card/card";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";
import { Study } from "@/types/Study/Study";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";

interface LaboratoriesPageWrapperProps {
  isLoading: boolean;
  error?: Error | null;
  studiesByUserId: Study[];
  entity: Patient | Doctor | undefined;
  role: "paciente" | "doctor";
  idUser: number;
  bloodTests: BloodTest[];
  bloodTestsData: BloodTestData[];
}

const LaboratoriesPageWrapper = ({
  isLoading,
  error,
  studiesByUserId,
  entity,
  role,
  idUser,
  bloodTests,
  bloodTestsData,
}: LaboratoriesPageWrapperProps) => {
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
