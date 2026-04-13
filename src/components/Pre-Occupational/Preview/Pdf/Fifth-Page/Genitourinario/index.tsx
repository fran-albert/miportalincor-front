import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface GenitourinarioPdfProps {
  sinAlteraciones?: boolean;
  observaciones?: string;
  varicocele?: boolean;
  varicoceleObs?: string;
  fum?: string;
  partos?: string;
  cesarea?: string;
  embarazos?: string;
  showGinecoData?: boolean;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 6,
  },
  headerWrap: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    color: pdfColors.accentText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  label: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  value: {
    fontSize: 9.4,
    color: pdfColors.ink,
    fontWeight: "bold",
  },
  obsLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  obsText: {
    fontSize: 10,
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    color: pdfColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dataBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

export default function GenitourinarioPdf({
  sinAlteraciones,
  observaciones,
  varicocele,
  varicoceleObs,
  fum,
  partos,
  cesarea,
  embarazos,
  showGinecoData = true,
}: GenitourinarioPdfProps) {
  const hasCoreData =
    sinAlteraciones !== undefined ||
    varicocele !== undefined ||
    (observaciones?.trim() ?? '') !== '' ||
    (varicoceleObs?.trim() ?? '') !== '';
  const hasGinecoData = showGinecoData && ((fum?.trim() ?? '') !== '' ||
    (partos?.trim() ?? '') !== '' ||
    (cesarea?.trim() ?? '') !== '' ||
    (embarazos?.trim() ?? '') !== '');
  const hasAnyData = hasCoreData || hasGinecoData;

  if (!hasAnyData) return null;

  const coreItems = [
    sinAlteraciones !== undefined
      ? {
          label: "Sin alteraciones",
          value: sinAlteraciones ? "Sí" : "No",
        }
      : null,
    varicocele !== undefined
      ? {
          label: "Varicocele",
          value: `${varicocele ? "Sí" : "No"}${varicoceleObs?.trim() ? ` · ${varicoceleObs}` : ""}`,
        }
      : null,
  ].filter(Boolean);

  const gynItems = [
    fum?.trim() ? { label: "F.U.M.", value: fum } : null,
    embarazos?.trim() ? { label: "Embarazos", value: embarazos } : null,
    partos?.trim() ? { label: "Partos", value: partos } : null,
    cesarea?.trim() ? { label: "Cesárea", value: cesarea } : null,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Aparato genitourinario</Text>
      </View>
      <View style={styles.body}>
        {coreItems.map((item) => (
          <View key={item!.label} style={styles.statusCard}>
            <Text style={styles.label}>{item!.label}</Text>
            <Text style={styles.value}>{item!.value}</Text>
          </View>
        ))}

        {observaciones?.trim() && (
          <View>
            <Text style={styles.obsLabel}>Observaciones</Text>
            <Text style={styles.obsText}>{observaciones}</Text>
          </View>
        )}

        {hasGinecoData && (
          <View style={styles.dataBlock}>
            {gynItems.map((item) => (
              <View key={item!.label} style={styles.statusCard}>
                <Text style={styles.label}>{item!.label}</Text>
                <Text style={styles.value}>{item!.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
