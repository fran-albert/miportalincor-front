import { useParams } from "react-router-dom";
import { useCommonLaboratoryData } from "@/hooks/useCommonLaboratoryData";
import LaboratoriesPageWrapper from "@/components/Laboratories/Page-Wrapper";
import { Helmet } from "react-helmet-async";

const LaboratoriesPage = ({ role }: { role: "paciente" | "medico" }) => {
  const params = useParams();
  const slug = String(params.slug);
  const slugParts = slug.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { patient, doctor, labsDetails, studiesByUserId, isLoading, error } =
    useCommonLaboratoryData({ id, role });

  const entity = role === "paciente" ? patient : doctor;

  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? ""
            : `${patient?.firstName} ${patient?.lastName} - Laboratorios`}
        </title>
      </Helmet>
      <LaboratoriesPageWrapper
        isLoading={isLoading}
        error={error}
        labsDetails={labsDetails}
        studiesByUserId={studiesByUserId}
        entity={entity}
        idUser={id}
        role={role}
      />
    </>
  );
};

export default LaboratoriesPage;
