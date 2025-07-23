import HeaderPreviewHtml from "../../Header";
import FooterHtml from "../Footer";
import {
  Gastrointestinal,
  Genitourinario,
  Osteoarticular,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import GastrointestinalHtml from "../Fourth-Page/Gastrointestinal";
import GenitourinarioHtml from "../Fourth-Page/Genitourinario";
import OsteoarticularHtml from "../Fourth-Page/Osteoarticular";


interface Props {
  gastrointestinal: Gastrointestinal;
  genitourinario: Genitourinario;
  osteoarticular: Osteoarticular;
}
const FifthPageHTML = ({
  gastrointestinal,
  genitourinario,
  osteoarticular,
}: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
    <GastrointestinalHtml data={gastrointestinal} />
    <GenitourinarioHtml data={genitourinario} />
    <OsteoarticularHtml data={osteoarticular} />
    <FooterHtml
      pageNumber={5}
      primaryDoctor={{
        name: "BONIFACIO Ma. CECILIA",
        license: "M.P. 96533 - M.L. 7299",
        signatureUrl:
          "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png",
      }}
      dualSign={true}
      secondDoctor={{
        name: "DR. JUAN PÉREZ",
        license: "M.P. 12345 - M.L. 6789",
        signatureUrl:
          "https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png",
      }}
    />
  </>
);

export default FifthPageHTML;
