import HeaderPreviewHtml from "../../Header";
import FooterHtml from "../Footer";
import { Gastrointestinal, Genitourinario, Neurologico, Osteoarticular } from "@/store/Pre-Occupational/preOccupationalSlice";
import NeurologicoHtml from "./Neurologico";
import GastrointestinalHtml from "./Gastrointestinal";
import GenitourinarioHtml from "./Genitourinario";
import OsteoarticularHtml from "./Osteoarticular";

interface Props {
  neurologico: Neurologico;
  gastrointestinal: Gastrointestinal;
  genitourinario: Genitourinario;
  osteoarticular: Osteoarticular;
}
const FourthPageHTML = ({
  neurologico,
  gastrointestinal,
  genitourinario,
  osteoarticular,
}: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
    <NeurologicoHtml data={neurologico} />
    <GastrointestinalHtml data={gastrointestinal} />
    <GenitourinarioHtml data={genitourinario} />
    <OsteoarticularHtml data={osteoarticular} />
    <FooterHtml
      pageNumber={4}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </>
);

export default FourthPageHTML;
