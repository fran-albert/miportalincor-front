import { Page, StyleSheet } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import PdfFooter from "../Footer";
import ClinicalEvaluationPdf from "./Clinical-Evaluation";
import PhysicalEvaluationPdf from "./Physical-Evaluation";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";

interface Props {
  collaborator: Collaborator;
  talla?: string;
  peso?: string;
  imc?: string;
  examenFisico: any;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    flexDirection: "column",
  },
});

const SecondPagePdfDocument = ({
  collaborator,
  peso,
  talla,
  imc,
  examenFisico,
}: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />
    <CollaboratorInformationPdf
      collaborator={collaborator}
      companyData={collaborator.company}
    />

    <ClinicalEvaluationPdf talla={talla} peso={peso} imc={imc} />
    <PhysicalEvaluationPdf examenFisico={examenFisico} section={1} />
    <PdfFooter
      pageNumber={2}
           doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </Page>
);

export default SecondPagePdfDocument;
