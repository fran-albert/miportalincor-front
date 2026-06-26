import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface BucodentalPdfProps {
  sinAlteraciones?: boolean;
  caries?: boolean;
  faltanPiezas?: boolean;
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
  optionLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  optionText: {
    fontSize: 10,
    color: pdfColors.ink,
    fontWeight: "bold",
  },
  obsContainer: {
    gap: 4,
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

export default function BucodentalPdf({ sinAlteraciones, caries, faltanPiezas, observaciones }: BucodentalPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = sinAlteraciones !== undefined ||
    caries !== undefined ||
    faltanPiezas !== undefined ||
    (observaciones?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  const hasCheckboxData = sinAlteraciones !== undefined ||
    caries !== undefined ||
    faltanPiezas !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Examen bucodental</Text>
      </View>
      <View style={styles.body}>

        {hasCheckboxData && (
          <View style={styles.optionsContainer}>
            {sinAlteraciones !== undefined && (
              <View style={styles.optionItem}>
                <Text style={styles.optionLabel}>Sin alteraciones</Text>
                <Text style={styles.optionText}>
                  {sinAlteraciones ? "Sí" : "No"}
                </Text>
              </View>
            )}

            {caries !== undefined && (
              <View style={styles.optionItem}>
                <Text style={styles.optionLabel}>Caries</Text>
                <Text style={styles.optionText}>{caries ? "Sí" : "No"}</Text>
              </View>
            )}

            {faltanPiezas !== undefined && (
              <View style={styles.optionItem}>
                <Text style={styles.optionLabel}>Faltan piezas</Text>
                <Text style={styles.optionText}>
                  {faltanPiezas ? "Sí" : "No"}
                </Text>
              </View>
            )}
          </View>
        )}

        {observaciones?.trim() && (
          <View style={styles.obsContainer}>
            <Text style={styles.obsLabel}>Observaciones</Text>
            <Text style={styles.obsText}>{observaciones}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
