import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface ToraxPdfProps {
  deformaciones?: "si" | "no";
  deformacionesObs?: string;
  cicatrices?: "si" | "no";
  cicatricesObs?: string;
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
  statusCard: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
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
});

export default function ToraxPdf({ deformaciones, deformacionesObs, cicatrices, cicatricesObs }: ToraxPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = deformaciones !== undefined ||
    cicatrices !== undefined;

  if (!hasAnyData) return null;

  const items = [
    deformaciones !== undefined
      ? {
          label: "Deformaciones",
          value: `${deformaciones === "si" ? "Sí" : "No"}${deformacionesObs?.trim() ? ` · ${deformacionesObs}` : ""}`,
        }
      : null,
    cicatrices !== undefined
      ? {
          label: "Cicatrices",
          value: `${cicatrices === "si" ? "Sí" : "No"}${cicatricesObs?.trim() ? ` · ${cicatricesObs}` : ""}`,
        }
      : null,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Tórax</Text>
      </View>
      <View style={styles.body}>
        {items.map((item) => (
          <View key={item!.label} style={styles.statusCard}>
            <Text style={styles.label}>{item!.label}</Text>
            <Text style={styles.value}>{item!.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
