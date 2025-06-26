import { Page, StyleSheet } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import PdfFooter from "../Footer";
import ClinicalEvaluationPdf from "./Clinical-Evaluation";
import CollaboratorInformationPdf from "../Collaborator-Information";
import HeaderPreviewPdf from "../Header";
import { DataValue } from "@/types/Data-Value/Data-Value";
import VisualAcuityPdf from "./Visual";
import PielPdf from "./Piel";
import { Piel } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/PielSection";
import CabezaCuelloPdf from "./CabezaCuello";
import { IMedicalEvaluation } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  collaborator: Collaborator;
  talla: string;
  peso: string;
  imc: string;
  pielData: Piel;
  antecedentes: DataValue[] | undefined;
  aspectoGeneral: "Bueno" | "Regular" | "Malo";
  data: IMedicalEvaluation;
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
  talla,
  peso,
  imc,
  aspectoGeneral,
  antecedentes,
  data,
  pielData,
}: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType="Examen Clínico"
    />
    <CollaboratorInformationPdf
      antecedentes={antecedentes}
      collaborator={collaborator}
      companyData={collaborator.company}
    />
    <ClinicalEvaluationPdf
      talla={talla}
      peso={peso}
      imc={imc}
      aspectoGeneral={aspectoGeneral}
    />
    <VisualAcuityPdf
      withCorrection={data.agudezaCc}
      chromaticVision={data.visionCromatica!}
      withoutCorrection={data.agudezaSc}
      notes= {data.notasVision}
    />
    <PielPdf
      normocoloreada={pielData.normocoloreada!}
      tatuajes={pielData.tatuajes!}
      observaciones={pielData.observaciones}
    />
    <CabezaCuelloPdf
      sinAlteraciones={data.cabezaCuello?.sinAlteraciones ?? false}
      observaciones={data.cabezaCuello?.observaciones ?? ""}
    />
    <PdfFooter
      pageNumber={2}
      doctorName="BONIFACIO Ma. CECILIA"
      doctorLicense="M.P. 96533 - M.L. 7299"
      signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
    />
  </Page>
);

export default SecondPagePdfDocument;
