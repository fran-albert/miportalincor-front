import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface CabezaCuelloPdfProps {
  sinAlteraciones?: boolean;
  observaciones?: string;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  headerWrap: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingVertical: 10,
    gap: 8,
  },
  label: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
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
    paddingVertical: 8,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});

export default function CabezaCuelloPdf({
  sinAlteraciones,
  observaciones,
}: CabezaCuelloPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = sinAlteraciones !== undefined ||
    (observaciones?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Cabeza y cuello</Text>
      </View>
      <View style={styles.body}>
        {sinAlteraciones !== undefined && (
          <View style={styles.statusCard}>
            <Text style={styles.label}>Sin alteraciones</Text>
            <Text style={styles.value}>{sinAlteraciones ? "Sí" : "No"}</Text>
          </View>
        )}

        {observaciones?.trim() && (
          <View>
            <Text style={styles.obsLabel}>Observaciones</Text>
            <Text style={styles.obsText}>{observaciones}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
