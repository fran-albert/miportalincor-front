import { useParams } from "react-router-dom";
import { useCommonLaboratoryData } from "@/hooks/useCommonLaboratoryData";
import LaboratoriesPageWrapper from "@/components/Laboratories/Page-Wrapper";

const LaboratoriesPage = ({ role }: { role: "paciente" | "medico" }) => {
  const params = useParams();
  const slug = String(params.slug);
  const slugParts = slug.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { patient, doctor, labsDetails, studiesByUserId, isLoading, error } =
    useCommonLaboratoryData({ id, role });

  const entity = role === "paciente" ? patient : doctor;

  return (
    <LaboratoriesPageWrapper
      isLoading={isLoading}
      error={error}
      labsDetails={labsDetails}
      studiesByUserId={studiesByUserId}
      entity={entity}
      idUser={id}
      role={role}
    />
  );
};

export default LaboratoriesPage;
