import HeaderPreviewHtml from "../../Header";
import FooterHtml from "../Footer";
import BucodentalHtml from "./Bucodental";
import ToraxHtml from "./Torax";
import {
  Piel,
  Torax,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { PielSection } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/PielSection";
import CabezaCuelloHtml from "../Second-Page/CabezaCuello";

interface Props {
  bucodental: {
    sinAlteraciones: boolean;
    caries: boolean;
    faltanPiezas: boolean;
    observaciones: string;
  };
  torax: Torax;
  
  pielData: Piel;
  cabezaCuello: { sinAlteraciones: boolean; observaciones: string };
}
const ThirdPageHTML = ({
  bucodental,
  torax,

  pielData,
  cabezaCuello,
}: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
    <PielSection isEditing={false} data={pielData} />
    <CabezaCuelloHtml data={cabezaCuello} />
    <BucodentalHtml data={bucodental} />
    <ToraxHtml data={torax} />
    
    {/* <PhysicalEvaluationHtml examenFisico={examenFisico} section={2} /> */}
    <FooterHtml
      pageNumber={3}
      primaryDoctor={{
        name: "BONIFACIO Ma. CECILIA",
        license: "M.P. 96533 - M.L. 7299",
        signatureUrl:
          "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png",
      }}
    />
  </>
);

export default ThirdPageHTML;
