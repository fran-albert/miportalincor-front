import { usePatient } from "@/hooks/Patient/usePatient";
import { useStudy } from "@/hooks/Study/useStudy";
import { useStudyAndImageUrls } from "@/hooks/Study/useStudyAndImageUrls";
import { PatientComponent } from "@/components/Patients/Component";
import { useParams } from "react-router-dom";
import LoadingAnimation from "@/components/Loading/loading";

const PatientPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { isLoading, patient, error } = usePatient({
    auth: true,
    id,
  });

  const { studiesByUserId = [], isLoadingStudiesByUserId } = useStudy({
    idUser: id,
    fetchStudiesByUserId: true,
  });

  const { data: allUrls = {}, isLoading: isLoadingUrls } = useStudyAndImageUrls(
    id,
    studiesByUserId
  );

  return (
    <>
      {error && <div>Hubo un error al cargar los pacientes.</div>}
      {isLoading || isLoadingStudiesByUserId || isLoadingUrls ? (
        <LoadingAnimation />
      ) : (
        <PatientComponent
          patient={patient}
          urls={allUrls}
          studiesByUserId={studiesByUserId}
        />
      )}
    </>
  );
};

export default PatientPage;
