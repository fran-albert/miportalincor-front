import { Page, View, StyleSheet } from "@react-pdf/renderer";
import HeaderPreviewPdf from "../Header";
import BucodentalPdf from "./Bucodental";
import ToraxPdf from "./Torax";
import {
  IMedicalEvaluation,
  Piel,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import PielPdf from "./Piel";
import CabezaCuelloPdf from "./CabezaCuello";
import FooterPdfConditional from "../Footer";
import { DoctorSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { hasSectionData } from "@/common/helpers/maps";

interface Props {
  data: IMedicalEvaluation;
  pielData: Piel;
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

const ThirdPagePdfDocument = ({ data, pielData, doctorData }: Props) => {
  // Verificar si hay datos en alguna sección de esta página
  const hasPiel = hasSectionData(pielData);
  const hasCabezaCuello = hasSectionData(data.cabezaCuello);
  const hasBucodental = hasSectionData(data.bucodental);
  const hasTorax = hasSectionData(data.torax);

  // Si no hay datos en ninguna sección, no mostrar la página
  if (!hasPiel && !hasCabezaCuello && !hasBucodental && !hasTorax) {
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      <HeaderPreviewPdf
        evaluationType={"Preocupacional"}
        examType="Examen Clínico"
      />

      <View style={styles.content}>
        <View style={styles.sectionWrapper}>
          <PielPdf
            normocoloreada={pielData?.normocoloreada}
            tatuajes={pielData?.tatuajes}
            observaciones={pielData?.observaciones}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <CabezaCuelloPdf
            sinAlteraciones={data.cabezaCuello?.sinAlteraciones}
            observaciones={data.cabezaCuello?.observaciones}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <BucodentalPdf
            sinAlteraciones={data.bucodental?.sinAlteraciones}
            caries={data.bucodental?.caries}
            faltanPiezas={data.bucodental?.faltanPiezas}
            observaciones={data.bucodental?.observaciones}
          />
        </View>
        <View style={styles.sectionWrapper}>
          <ToraxPdf
            deformaciones={data.torax?.deformaciones}
            deformacionesObs={data.torax?.deformacionesObs}
            cicatrices={data.torax?.cicatrices}
            cicatricesObs={data.torax?.cicatricesObs}
          />
        </View>
      </View>
      <View style={styles.footer}>
        <FooterPdfConditional
          pageNumber={3}
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
};

export default ThirdPagePdfDocument;
