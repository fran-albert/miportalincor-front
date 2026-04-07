import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface PielPdfProps {
  normocoloreada?: "si" | "no";
  tatuajes?: "si" | "no";
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
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionItem: {
    width: "48%",
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    gap: 4,
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
});

export default function PielPdf({
  normocoloreada,
  tatuajes,
  observaciones,
}: PielPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = normocoloreada !== undefined ||
    tatuajes !== undefined ||
    (observaciones?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  const items = [
    normocoloreada !== undefined
      ? {
          label: "Normocoloreada",
          value: normocoloreada === "si" ? "Sí" : "No",
        }
      : null,
    tatuajes !== undefined
      ? {
          label: "Tatuajes",
          value: tatuajes === "si" ? "Sí" : "No",
        }
      : null,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Piel</Text>
      </View>
      <View style={styles.body}>
        {!!items.length && (
          <View style={styles.optionsContainer}>
            {items.map((item) => (
              <View key={item!.label} style={styles.optionItem}>
                <Text style={styles.label}>{item!.label}</Text>
                <Text style={styles.value}>{item!.value}</Text>
              </View>
            ))}
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
