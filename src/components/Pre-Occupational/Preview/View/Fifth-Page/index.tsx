import HeaderPreviewHtml from "../../Header";
import {
  Gastrointestinal,
  Genitourinario,
  Osteoarticular,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import GastrointestinalHtml from "../Fourth-Page/Gastrointestinal";
import GenitourinarioHtml from "../Fourth-Page/Genitourinario";
import OsteoarticularHtml from "../Fourth-Page/Osteoarticular";
import FooterHtmlConditional from "../Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { hasSectionData } from "@/common/helpers/maps";

interface Props {
  gastrointestinal: Gastrointestinal;
  genitourinario: Genitourinario;
  osteoarticular: Osteoarticular;
  doctorData: DoctorSignatures;
}
const FifthPageHTML = ({
  gastrointestinal,
  genitourinario,
  osteoarticular,
  doctorData,
}: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasGastrointestinal = hasSectionData(gastrointestinal);
  const hasGenitourinario = hasSectionData(genitourinario);
  const hasOsteoarticular = hasSectionData(osteoarticular);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasGastrointestinal && !hasGenitourinario && !hasOsteoarticular) {
    return null;
  }

  return (
    <>
      <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
      <GastrointestinalHtml data={gastrointestinal} />
      <GenitourinarioHtml data={genitourinario} />
      <OsteoarticularHtml data={osteoarticular} />
      <FooterHtmlConditional
        pageNumber={5}
        useCustom
        doctorLicense={doctorData.matricula}
        doctorName={doctorData.fullName}
        doctorSpeciality={doctorData.specialty}
        signatureUrl={doctorData.signatureDataUrl}
      />
    </>
  );
};

export default FifthPageHTML;
