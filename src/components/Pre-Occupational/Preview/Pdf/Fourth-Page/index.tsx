import { Page, StyleSheet, View } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import NeurologicoPdf from "./Neurologico";
import CirculatorioPdf from "./Circulatorio";
import RespiratorioPdf from "./Respiratorio";

interface Props {
  data: IMedicalEvaluation;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 60,
    fontSize: 9,
    fontFamily: "Helvetica",
    position: "relative",
  },
  content: {
    flexDirection: "column",
  },
  sectionWrapper: {
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
  },
});

const FourthPagePdfDocument = ({ data }: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />
    <View style={styles.content}>
      <View style={styles.sectionWrapper}>
        <RespiratorioPdf
          frecuenciaRespiratoria={
            data.respiratorio?.frecuenciaRespiratoria ?? ""
          }
          oximetria={data.respiratorio?.oximetria ?? ""}
          sinAlteraciones={data.respiratorio?.sinAlteraciones ?? false}
          observaciones={data.respiratorio?.observaciones ?? ""}
        />
      </View>
      <View style={styles.sectionWrapper}>
        <CirculatorioPdf
          frecuenciaCardiaca={data.circulatorio?.frecuenciaCardiaca ?? ""}
          presion={data.circulatorio?.presion ?? ""}
          sinAlteraciones={data.circulatorio?.sinAlteraciones ?? false}
          observaciones={data.circulatorio?.observaciones ?? ""}
          varices={data.circulatorio?.varices ?? false}
          varicesObs={data.circulatorio?.varicesObs ?? ""}
        />
      </View>
      <View style={styles.sectionWrapper}>
        <NeurologicoPdf
          sinAlteraciones={data.neurologico?.sinAlteraciones ?? false}
          observaciones={data.neurologico?.observaciones ?? ""}
        />
      </View>
    </View>
    <View style={styles.footer}>
      <PdfFooter
        pageNumber={4}
        doctorName="BONIFACIO Ma. CECILIA"
        doctorLicense="M.P. 96533 - M.L. 7299"
        signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
      />
    </View>
  </Page>
);

export default FourthPagePdfDocument;
