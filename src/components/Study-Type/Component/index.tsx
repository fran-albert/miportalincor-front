import LoadingAnimation from "@/components/Loading/loading";
import { useStudyType } from "@/hooks/Study-Type/useStudyType";
import { StudyTypeTable } from "../Table/table";
import useUserRole from "@/hooks/useRoles";

const StudyTypeComponent = () => {
  const { isDoctor, isSecretary } = useUserRole();
  const { StudyType, isLoadingStudyType, errorStudyType } = useStudyType({
    studyTypeAuth: isDoctor || isSecretary,
  });

  if (isLoadingStudyType) {
    return <LoadingAnimation />;
  }

  if (errorStudyType) {
    return <div>Error al cargar los tipos de estudios</div>;
  }

  return <StudyTypeTable studyTypes={StudyType || []} />;
};

export default StudyTypeComponent;
