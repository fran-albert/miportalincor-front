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
      doctorName="Dr. Juan Pérez"
      doctorLicense="12345"
      signatureUrl="https://imgs.search.brave.com/KgtC37nJ8FZd7vidGl8lipdmUm1Ll4Lmi2NlJDafTQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy9h/L2ExL0pvcyVDMyVB/OV9NaWd1ZWxfSW5z/dWx6YV9maXJtYS5w/bmc"
    />
  </>
);

export default ThirdPageHTML;
