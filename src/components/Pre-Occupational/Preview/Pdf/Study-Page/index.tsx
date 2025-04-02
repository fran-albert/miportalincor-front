import { Image, Page, StyleSheet, View } from "@react-pdf/renderer";
import PdfFooter from "../Footer";
import HeaderPreviewPdf from "../Header";

interface Props {
  studyTitle: string;
  studyUrl: string;
  pageNumber: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
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
    maxHeight: 600,
    objectFit: "contain",
  },
});

const StudyPagePdfDocument = ({ studyTitle, studyUrl, pageNumber }: Props) => (
  <Page size="A4" style={styles.page}>
    <HeaderPreviewPdf
      evaluationType={"Preocupacional"}
      examType={`Complementarios - ${studyTitle}`}
    />
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

export default StudyPagePdfDocument;
