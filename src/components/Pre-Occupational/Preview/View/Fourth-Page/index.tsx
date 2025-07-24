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

interface Props {
  neurologico: Neurologico;
  respiratorio: Respiratorio;
  circulatorio: Circulatorio;
  doctorData: DoctorSignatures;
}
const FourthPageHTML = ({ neurologico, respiratorio, circulatorio, doctorData }: Props) => (
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

export default FourthPageHTML;
