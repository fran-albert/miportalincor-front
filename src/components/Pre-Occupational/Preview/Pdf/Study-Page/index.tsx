import { Image, Page, StyleSheet, View, Text } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";
import { ExamResults } from "@/common/helpers/examsResults.maps";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import {
  getPresentationModeForSection,
  getInstitutionalSignerForSection,
  usesExamDoctorSignature,
} from "../../signature-policy";
import { LaborReportBrandingConfig } from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";

interface Props {
  studyTitle: string;
  studyUrl: string;
  pageNumber: number;
  examResults: ExamResults;
  medicalEvaluationType: string;
  doctorData: DoctorSignatures;
  brandingConfig?: LaborReportBrandingConfig;
}

// Definimos los estudios que deben mostrar "INFORME:"
const studiesConInforme = [
  "laboratorios",
  "laboratorio", // Incluimos ambas variantes
  "psicotecnico",
  "rx de tórax (f)",
  "rx de columna lumbosacra (f y p)",
  "audiometria total",
  "electrocardiograma",
  "electroencefalograma",
  "audiometria",
];

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: "Helvetica",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  studyImage: {
    width: "100%",
    maxHeight: 500,
    objectFit: "contain",
  },
  informeText: {
    fontSize: 11,
    textAlign: "center",
  },
});

const StudyPagePdfDocument = ({
  studyTitle,
  studyUrl,
  pageNumber,
  examResults,
  medicalEvaluationType,
  doctorData,
  brandingConfig,
}: Props) => {
  let resultTexto = "";
  // Normalizamos para comparar sin problemas de mayúsculas o acentos
  const normalizedTitle = studyTitle.toLowerCase();

  // Solo asignamos el resultado si el estudio debe mostrar informe
  if (studiesConInforme.includes(normalizedTitle)) {
    switch (normalizedTitle) {
      case "electrocardiograma":
        resultTexto = examResults["electrocardiograma-result"];
        break;
      case "laboratorio":
      case "laboratorios":
        resultTexto = examResults.laboratorio;
        break;
      case "rx de tórax (f)":
        resultTexto = examResults["rx-torax"];
        break;
      case "psicotecnico":
        resultTexto = examResults.psicotecnico;
        break;
      case "audiometria total":
        resultTexto = examResults.audiometria;
        break;
      case "audiometria":
        resultTexto = examResults.audiometria;
        break;
      case "electroencefalograma":
        resultTexto = examResults.electroencefalograma;
        break;
      case "rx de columna lumbosacra (f y p)":
        // Si tienes un campo específico para este estudio, lo asignas aquí.
        resultTexto =
          examResults["rx-torax"] || "Resultado no disponible";
        break;
      case "rx-torax":
        // Si tienes un campo específico para este estudio, lo asignas aquí.
        resultTexto =
          examResults["rx-columna-lumbosacra"] || "Resultado no disponible";
        break;
      default:
        resultTexto = "Resultado no disponible";
    }
  }

  return (
    <Page size="A4" style={styles.page}>
      <HeaderPreviewPdf
        evaluationType={medicalEvaluationType}
        examType={`Complementarios - ${studyTitle}`}
        brandingConfig={brandingConfig}
      />
      {studiesConInforme.includes(normalizedTitle) && (
        <Text style={styles.informeText}>INFORME: {resultTexto}</Text>
      )}
      <View style={styles.content}>
        <Image src={studyUrl} style={styles.studyImage} />
      </View>
      <PdfFooter
        pageNumber={pageNumber}
        useCustom={usesExamDoctorSignature(
          "studies",
          brandingConfig,
          medicalEvaluationType
        )}
        presentationMode={getPresentationModeForSection(
          "studies",
          brandingConfig,
          medicalEvaluationType
        )}
        institutionalSigner={getInstitutionalSignerForSection(
          "studies",
          brandingConfig,
          medicalEvaluationType
        )}
        doctorName={doctorData.fullName}
        doctorLicense={doctorData.matricula}
        doctorSpeciality={doctorData.specialty}
        doctorStampText={doctorData.stampText}
        signatureUrl={doctorData.signatureDataUrl}
        sealUrl={doctorData.sealDataUrl}
      />
    </Page>
  );
};

export default StudyPagePdfDocument;
