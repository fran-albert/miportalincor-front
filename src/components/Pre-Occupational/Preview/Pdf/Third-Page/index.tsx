import { Page, StyleSheet } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";
import BucodentalPdf from "./Bucodental";
import ToraxPdf from "./Torax";
import RespiratorioPdf from "./Respiratorio";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import CirculatorioPdf from "./Circulatorio";

interface Props {
  data: IMedicalEvaluation;
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

const ThirdPagePdfDocument = ({ data }: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />
    <BucodentalPdf
      sinAlteraciones={data.bucodental?.sinAlteraciones ?? false}
      caries={data.bucodental?.caries ?? false}
      faltanPiezas={data.bucodental?.faltanPiezas ?? false}
      observaciones={data.bucodental?.observaciones ?? ""}
    />
    <ToraxPdf
      deformaciones={data.torax?.deformaciones ?? "no"}
      deformacionesObs={data.torax?.deformacionesObs ?? ""}
      cicatrices={data.torax?.cicatrices ?? "no"}
      cicatricesObs={data.torax?.cicatricesObs ?? ""}
    />
    <RespiratorioPdf
      frecuenciaRespiratoria={data.respiratorio?.frecuenciaRespiratoria ?? ""}
      oximetria={data.respiratorio?.oximetria ?? ""}
      sinAlteraciones={data.respiratorio?.sinAlteraciones ?? false}
      observaciones={data.respiratorio?.observaciones ?? ""}
    />
    <CirculatorioPdf
      frecuenciaCardiaca={data.circulatorio?.frecuenciaCardiaca ?? ""}
      presion={data.circulatorio?.presion ?? ""}
      sinAlteraciones={data.circulatorio?.sinAlteraciones ?? false}
      observaciones={data.circulatorio?.observaciones ?? ""}
      varices={data.circulatorio?.varices ?? false}
      varicesObs={data.circulatorio?.varicesObs ?? ""}
    />
    <PdfFooter
      pageNumber={3}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </Page>
);

export default ThirdPagePdfDocument;
