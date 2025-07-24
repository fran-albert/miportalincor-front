import { Page, StyleSheet, View } from "@react-pdf/renderer";
import HeaderPreviewPdf from "../Header";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import OsteoarticularPdf from "./Osteoarticular";
import GenitourinarioPdf from "./Genitourinario";
import GastrointestinalPdf from "./Gastrointestinal";
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

const FifthPagePdfDocument = ({ data, doctorData }: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />
    <View style={styles.content}>
      <View style={styles.sectionWrapper}>
        <GastrointestinalPdf
          sinAlteraciones={data.gastrointestinal?.sinAlteraciones ?? false}
          observaciones={data.gastrointestinal?.observaciones ?? ""}
          cicatrices={data.gastrointestinal?.cicatrices ?? false}
          cicatricesObs={data.gastrointestinal?.cicatricesObs ?? ""}
          hernias={data.gastrointestinal?.hernias ?? false}
          herniasObs={data.gastrointestinal?.herniasObs ?? ""}
          eventraciones={data.gastrointestinal?.eventraciones ?? false}
          eventracionesObs={data.gastrointestinal?.eventracionesObs ?? ""}
          hemorroides={data.gastrointestinal?.hemorroides ?? false}
          hemorroidesObs={data.gastrointestinal?.hemorroidesObs ?? ""}
        />
      </View>
      <View style={styles.sectionWrapper}>
        <GenitourinarioPdf
          sinAlteraciones={data.genitourinario?.sinAlteraciones ?? false}
          observaciones={data.genitourinario?.observaciones ?? ""}
          varicocele={data.genitourinario?.varicocele ?? false}
          varicoceleObs={data.genitourinario?.varicoceleObs ?? ""}
          fum={data.genitourinario?.fum ?? ""}
          partos={data.genitourinario?.partos ?? ""}
          cesarea={data.genitourinario?.cesarea ?? ""}
          embarazos={data.genitourinario?.embarazos ?? ""}
        />
      </View>
      <View style={styles.sectionWrapper}>
        <OsteoarticularPdf
          mmssSin={data.osteoarticular?.mmssSin ?? false}
          mmssObs={data.osteoarticular?.mmssObs ?? ""}
          mmiiSin={data.osteoarticular?.mmiiSin ?? false}
          mmiiObs={data.osteoarticular?.mmiiObs ?? ""}
          columnaSin={data.osteoarticular?.columnaSin ?? false}
          columnaObs={data.osteoarticular?.columnaObs ?? ""}
          amputaciones={data.osteoarticular?.amputaciones ?? false}
          amputacionesObs={data.osteoarticular?.amputacionesObs ?? ""}
        />
      </View>
    </View>

    <View style={styles.footer}>
      <FooterPdfConditional
        pageNumber={5}
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

export default FifthPagePdfDocument;
