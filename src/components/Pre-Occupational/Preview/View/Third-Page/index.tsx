import HeaderPreviewHtml from "../../Header";
import FooterHtml from "../Footer";
import PhysicalEvaluationHtml from "../Second-Page/Physical-Evaluationn";

interface Props {
  examenFisico: any;
}
const ThirdPageHTML = ({ examenFisico }: Props) => (
  <>
    <HeaderPreviewHtml examType="Examen" evaluationType="Preocupacional" />
    <PhysicalEvaluationHtml examenFisico={examenFisico} section={2} />
    <FooterHtml
      pageNumber={3}
           doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </>
);

export default ThirdPageHTML;
