import { Image, Page, StyleSheet, View, Text } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";
import { ExamResults } from "@/common/helpers/examsResults.maps";

interface Props {
  studyTitle: string;
  studyUrl: string;
  pageNumber: number;
  examResults: ExamResults;
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
        evaluationType={"Preocupacional"}
        examType={`Complementarios - ${studyTitle}`}
      />
      {studiesConInforme.includes(normalizedTitle) && (
        <Text style={styles.informeText}>INFORME: {resultTexto}</Text>
      )}
      <View style={styles.content}>
        <Image src={studyUrl} style={styles.studyImage} />
      </View>
      <PdfFooter
        pageNumber={pageNumber}
        doctorName="BONIFACIO Ma. CECILIA"
        doctorLicense="M.P. 96533 - M.L. 7299"
        signatureUrl="https://res.cloudinary.com/dfoqki8kt/image/upload/v1743624646/aw6shqkcieys3flbrn0c.png"
      />
    </Page>
  );
};

export default StudyPagePdfDocument;
