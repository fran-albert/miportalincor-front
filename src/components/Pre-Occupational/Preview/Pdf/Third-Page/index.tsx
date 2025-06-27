import { Page, View, StyleSheet } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";
import BucodentalPdf from "./Bucodental";
import ToraxPdf from "./Torax";
import {
  IMedicalEvaluation,
  Piel,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import PielPdf from "./Piel";
import CabezaCuelloPdf from "./CabezaCuello";

interface Props {
  data: IMedicalEvaluation;
  pielData: Piel;
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

const ThirdPagePdfDocument = ({ data, pielData }: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />

    <View style={styles.content}>
      <View style={styles.sectionWrapper}>
        <PielPdf
          normocoloreada={pielData.normocoloreada!}
          tatuajes={pielData.tatuajes!}
          observaciones={pielData.observaciones}
        />
      </View>
      <View style={styles.sectionWrapper}>
        <CabezaCuelloPdf
          sinAlteraciones={data.cabezaCuello?.sinAlteraciones ?? false}
          observaciones={data.cabezaCuello?.observaciones ?? ""}
        />
      </View>
      <View style={styles.sectionWrapper}>
        <BucodentalPdf
          sinAlteraciones={data.bucodental?.sinAlteraciones ?? false}
          caries={data.bucodental?.caries ?? false}
          faltanPiezas={data.bucodental?.faltanPiezas ?? false}
          observaciones={data.bucodental?.observaciones ?? ""}
        />
      </View>
      <View style={styles.sectionWrapper}>
        <ToraxPdf
          deformaciones={data.torax?.deformaciones ?? "no"}
          deformacionesObs={data.torax?.deformacionesObs ?? ""}
          cicatrices={data.torax?.cicatrices ?? "no"}
          cicatricesObs={data.torax?.cicatricesObs ?? ""}
        />
      </View>
    </View>
    <View style={styles.footer}>
      <PdfFooter
        pageNumber={3}
        doctorName="BONIFACIO Ma. CECILIA"
        doctorLicense="M.P. 96533 - M.L. 7299"
        signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
      />
    </View>
  </Page>
);

export default ThirdPagePdfDocument;
