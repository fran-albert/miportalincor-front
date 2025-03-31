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
      doctorName="Dr. Juan Pérez"
      doctorLicense="12345"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1740699262/wrivrtuyqs3yqo299ooo.png"
    />
  </Page>
);

export default ThirdPagePdfDocument;
