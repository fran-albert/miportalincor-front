import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useStudy } from "@/hooks/Study/useStudy";
import { useStudyAndImageUrls } from "@/hooks/Study/useStudyAndImageUrls";
import { DoctorComponent } from "@/components/Doctors/Component";
import { useParams } from "react-router-dom";
import LoadingAnimation from "@/components/Loading/loading";

function DoctorPage() {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);
  const { isLoading, doctor, error } = useDoctor({
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
      {error && (
        <div className="text-center font-bold">
          Hubo un error al cargos los datos del Doctor.
        </div>
      )}
      {(isLoading || isLoadingStudiesByUserId || isLoadingUrls) ?? (
        <LoadingAnimation />
      )}
      <DoctorComponent
        doctor={doctor}
        urls={allUrls}
        studiesByUserId={studiesByUserId}
      />
    </>
  );
}

export default DoctorPage;
