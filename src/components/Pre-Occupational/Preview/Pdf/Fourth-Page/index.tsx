import { Page, StyleSheet, View } from "@react-pdf/renderer";
import HeaderPreviewPdf from "../Header";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import NeurologicoPdf from "./Neurologico";
import CirculatorioPdf from "./Circulatorio";
import RespiratorioPdf from "./Respiratorio";
import FooterPdfConditional from "../Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";

interface Props {
  data: IMedicalEvaluation;
  doctorData: DoctorSignatures;
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

const FourthPagePdfDocument = ({ data, doctorData }: Props) => (
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
      <FooterPdfConditional
        pageNumber={4}
        useCustom={true}
        doctorLicense={doctorData.matricula}
        doctorName={doctorData.fullName}
        doctorSpeciality={doctorData.specialty}
        signatureUrl={doctorData.signatureDataUrl}
        sealUrl={doctorData.sealDataUrl}
      />
    </View>
  </Page>
);

export default FourthPagePdfDocument;
