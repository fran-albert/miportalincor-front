import { Page, StyleSheet, View } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import OsteoarticularPdf from "./Osteoarticular";
import GenitourinarioPdf from "./Genitourinario";
import GastrointestinalPdf from "./Gastrointestinal";

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

const FifthPagePdfDocument = ({ data }: Props) => (
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
      <PdfFooter
        pageNumber={5}
        doctorName="BONIFACIO Ma. CECILIA"
        doctorLicense="M.P. 96533 - M.L. 7299"
        signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
      />
    </View>
  </Page>
);

export default FifthPagePdfDocument;
