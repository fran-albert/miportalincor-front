import HeaderPreviewHtml from "../../Header";
import {
  Circulatorio,
  Neurologico,
  Respiratorio,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import NeurologicoHtml from "./Neurologico";
import RespiratorioHtml from "../Third-Page/Respiratorio";
import CirculatorioHtml from "../Third-Page/Circulatorio";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import FooterHtmlConditional from "../Footer";
import { hasSectionData } from "@/common/helpers/maps";

interface Props {
  neurologico: Neurologico;
  respiratorio: Respiratorio;
  circulatorio: Circulatorio;
  doctorData: DoctorSignatures;
}
const FourthPageHTML = ({ neurologico, respiratorio, circulatorio, doctorData }: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasRespiratorio = hasSectionData(respiratorio);
  const hasCirculatorio = hasSectionData(circulatorio);
  const hasNeurologico = hasSectionData(neurologico);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasRespiratorio && !hasCirculatorio && !hasNeurologico) {
    return null;
  }

  return (
    <>
      <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
      <RespiratorioHtml data={respiratorio} />
      <CirculatorioHtml data={circulatorio} />
      <NeurologicoHtml data={neurologico} />
      <FooterHtmlConditional
        pageNumber={4}
        useCustom
        doctorLicense={doctorData.matricula}
        doctorName={doctorData.fullName}
        doctorSpeciality={doctorData.specialty}
        signatureUrl={doctorData.signatureDataUrl}
      />
    </>
  );
};

export default FourthPageHTML;
