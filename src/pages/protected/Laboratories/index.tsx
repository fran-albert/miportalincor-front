import { useParams } from "react-router-dom";
import { useCommonLaboratoryData } from "@/hooks/useCommonLaboratoryData";
import LaboratoriesPageWrapper from "@/components/Laboratories/Page-Wrapper";
import { Helmet } from "react-helmet-async";
import { useBlodTest } from "@/hooks/Blod-Test/useBlodTest";

const LaboratoriesPage = ({ role }: { role: "paciente" | "medico" }) => {
  const params = useParams();
  const slug = String(params.slug);
  const slugParts = slug.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { blodTests, isLoading: isLoadingBloodTests } = useBlodTest({
    auth: true,
  });

  const {
    patient,
    doctor,
    studiesByUserId,
    bloodTestsData,
    isLoading,
    error,
  } = useCommonLaboratoryData({ id, role });

  const entity = role === "paciente" ? patient : doctor;
  const isAllLoading = isLoading || isLoadingBloodTests;
  const hasEntityData = entity?.firstName && entity?.lastName;
  const displayRole = role === "medico" ? "doctor" : role;

  return (
    <>
      <Helmet>
        <title>
          {isAllLoading || !hasEntityData
            ? "Cargando laboratorios..."
            : `${entity.firstName} ${entity.lastName} - Laboratorios`}
        </title>
      </Helmet>
      <LaboratoriesPageWrapper
        isLoading={isLoading}
        error={error}
        studiesByUserId={studiesByUserId}
        bloodTestsData={bloodTestsData}
        bloodTests={blodTests}
        entity={entity}
        idUser={id}
        role={displayRole}
      />
    </>
  );
};

export default LaboratoriesPage;
