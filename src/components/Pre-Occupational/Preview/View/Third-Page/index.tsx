import { Torax } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/ToraxSection";
import HeaderPreviewHtml from "../../Header";
import FooterHtml from "../Footer";
import BucodentalHtml from "./Bucodental";
import ToraxHtml from "./Torax";
import { Respiratorio } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/RespiratorioSection";
import RespiratorioHtml from "./Respiratorio";
import CirculatorioHtml from "./Circulatorio";
import { Circulatorio } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/CirculatorioSection";

interface Props {
  bucodental: {
    sinAlteraciones: boolean;
    caries: boolean;
    faltanPiezas: boolean;
    observaciones: string;
  };
  torax: Torax;
  respiratorio: Respiratorio;
  circulatorio: Circulatorio;
}
const ThirdPageHTML = ({
  bucodental,
  torax,
  respiratorio,
  circulatorio,
}: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
    <BucodentalHtml data={bucodental} />
    <ToraxHtml data={torax} />
    <RespiratorioHtml data={respiratorio} />
    <CirculatorioHtml data={circulatorio} />
    {/* <PhysicalEvaluationHtml examenFisico={examenFisico} section={2} /> */}
    <FooterHtml
      pageNumber={3}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </>
);

export default ThirdPageHTML;
