import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const COLORS = {
  primary: "#187B80",
  secondary: "#0C484A",
  light: "#9FD5D8",
  text: "#1F2937",
  muted: "#6B7280",
  background: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
  },
  topBar: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    objectFit: "contain",
  },
  programName: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  activityName: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  qrContainer: {
    alignSelf: "center",
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  qrImage: {
    width: 280,
    height: 280,
  },
  scanTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  steps: {
    marginHorizontal: 30,
    gap: 10,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 6,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "center",
  },
});

const STEPS = [
  "Escaneá el código con la cámara de tu celular",
  "Ingresá tu DNI",
  "¡Listo! Tu asistencia queda registrada",
];

interface ActivityQrPosterPdfProps {
  programName: string;
  activityName: string;
  qrDataUrl: string;
  logoSrc: string;
}

export const ActivityQrPosterPdf = ({
  programName,
  activityName,
  qrDataUrl,
  logoSrc,
}: ActivityQrPosterPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.topBar} />
      <View style={styles.header}>
        <Image style={styles.logo} src={logoSrc} />
      </View>
      <Text style={styles.programName}>{programName}</Text>
      <Text style={styles.activityName}>{activityName}</Text>
      <View style={styles.qrContainer}>
        <Image style={styles.qrImage} src={qrDataUrl} />
      </View>
      <Text style={styles.scanTitle}>Registrá tu asistencia en 3 pasos</Text>
      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          INCOR Centro Médico — Si tenés algún problema, acercate a recepción.
        </Text>
      </View>
    </Page>
  </Document>
);
