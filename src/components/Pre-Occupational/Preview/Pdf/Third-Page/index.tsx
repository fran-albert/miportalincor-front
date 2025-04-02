import { Page, StyleSheet } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import PhysicalEvaluationPdf from "../Second-Page/Physical-Evaluation";
import HeaderPreviewPdf from "../Header";

interface Props {
  examenFisico: any;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    flexDirection: "column",
    justifyContent: "space-between",
  },
});

const ThirdPagePdfDocument = ({ examenFisico }: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />
    <PhysicalEvaluationPdf examenFisico={examenFisico} section={2} />
    <PdfFooter
      pageNumber={3}
           doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </Page>
);

export default ThirdPagePdfDocument;
