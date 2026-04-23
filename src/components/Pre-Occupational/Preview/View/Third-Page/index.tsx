import HeaderPreviewHtml from "../../Header";
import BucodentalHtml from "./Bucodental";
import ToraxHtml from "./Torax";
import { Piel, Torax } from "@/store/Pre-Occupational/preOccupationalSlice";
import { PielSection } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/PielSection";
import CabezaCuelloHtml from "../Second-Page/CabezaCuello";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import FooterHtmlConditional from "../Footer";
import { hasSectionData } from "@/common/helpers/maps";

interface Props {
  bucodental: {
    sinAlteraciones?: boolean;
    caries?: boolean;
    faltanPiezas?: boolean;
    observaciones?: string;
  };
  torax: Torax;
  doctorData: DoctorSignatures;
  pielData: Piel;
  cabezaCuello: { sinAlteraciones?: boolean; observaciones?: string };
}
const ThirdPageHTML = ({
  bucodental,
  torax,
  doctorData,
  pielData,
  cabezaCuello,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasPiel = hasSectionData(pielData);
  const hasCabezaCuello = hasSectionData(cabezaCuello);
  const hasBucodental = hasSectionData(bucodental);
  const hasTorax = hasSectionData(torax);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasPiel && !hasCabezaCuello && !hasBucodental && !hasTorax) {
    return null;
  }

  return (
    <>
      <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
      <PielSection isEditing={false} data={pielData} />
      <CabezaCuelloHtml data={cabezaCuello} />
      <BucodentalHtml data={bucodental} />
      <ToraxHtml data={torax} />

      {/* <PhysicalEvaluationHtml examenFisico={examenFisico} section={2} /> */}
      <FooterHtmlConditional
        pageNumber={3}
        useCustom
        doctorLicense={doctorData.matricula}
        doctorName={doctorData.fullName}
        doctorSpeciality={doctorData.specialty}
        signatureUrl={doctorData.signatureDataUrl}
      />
    </>
  );
};

export default ThirdPageHTML;
