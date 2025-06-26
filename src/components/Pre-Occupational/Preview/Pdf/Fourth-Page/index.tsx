import { Page, StyleSheet } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";
import NeurologicoPdf from "./Neurologico";
import GastrointestinalPdf from "./Gastrointestinal";
import GenitourinarioPdf from "./Genitourinario";
import OsteoarticularPdf from "./Osteoarticular";

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

const FourthPagePdfDocument = ({ data }: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />
    <NeurologicoPdf
      sinAlteraciones={data.neurologico?.sinAlteraciones ?? false}
      observaciones={data.neurologico?.observaciones ?? ""}
    />
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
    <GenitourinarioPdf
      sinAlteraciones={data.genitourinario?.sinAlteraciones ?? false}
      observaciones={data.genitourinario?.observaciones ?? ""}
      varicocele={data.genitourinario?.varicocele ?? false}
      varicoceleObs={data.genitourinario?.varicoceleObs ?? ""}
    />
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
    <PdfFooter
      pageNumber={4}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </Page>
);

export default FourthPagePdfDocument;
