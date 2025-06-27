// src/components/pdf/VisualAcuityPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface VisualAcuityPdfProps {
  withoutCorrection: { right: string; left: string };
  withCorrection?: { right?: string; left?: string };
  chromaticVision: "normal" | "anormal";
  notes?: string;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#187B80",
    paddingVertical: 4,
    backgroundColor: "#F0F0F0",
    textAlign: "center",
    borderRadius: 4,
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 8,
    color: "#555",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 4,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEE",
    padding: 4,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    backgroundColor: "#F9F9F9",
  },
  bodyCell: {
    fontSize: 10,
    textAlign: "center",
  },
  firstCol: {
    flex: 2,
  },
  chromaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  chromaLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  chromaValue: {
    fontSize: 10,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 4,
    backgroundColor: "#F9F9F9",
  },
});

export default function VisualAcuityPdf({
  withoutCorrection,
  withCorrection = { right: "—", left: "—" },
  chromaticVision,
  notes = "",
}: VisualAcuityPdfProps) {
  const chromaColor = chromaticVision === "normal" ? "#006400" : "#8B0000";
  const chromaText = chromaticVision === "normal" ? "Normal" : "Anormal";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agudeza Visual</Text>
      <Text style={styles.subtitle}>
        Valores sin corrección (S/C) y con corrección (C/C)
      </Text>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.firstCol]}>
            <Text style={styles.headerCell} />
          </View>
          <View style={styles.cell}>
            <Text style={styles.headerCell}>S/C</Text>
          </View>
          <View style={[styles.cell, { borderRightWidth: 0 }]}>
            <Text style={styles.headerCell}>C/C</Text>
          </View>
        </View>
        {/* Ojo Derecho */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.firstCol]}>
            <Text style={styles.bodyCell}>Ojo Derecho</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.bodyCell}>{withoutCorrection.right}</Text>
          </View>
          <View style={[styles.cell, { borderRightWidth: 0 }]}>
            <Text style={styles.bodyCell}>{withCorrection.right}</Text>
          </View>
        </View>
        {/* Ojo Izquierdo */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.firstCol]}>
            <Text style={styles.bodyCell}>Ojo Izquierdo</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.bodyCell}>{withoutCorrection.left}</Text>
          </View>
          <View style={[styles.cell, { borderRightWidth: 0 }]}>
            <Text style={styles.bodyCell}>{withCorrection.left}</Text>
          </View>
        </View>
      </View>

      {/* Visión Cromática */}
      <View style={styles.chromaRow}>
        <Text style={styles.chromaLabel}>Visión Cromática:</Text>
        <Text style={[styles.chromaValue, { color: chromaColor }]}>
          {chromaText}
        </Text>
      </View>

      {/* Observaciones */}
      {notes.trim() !== "" && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Observaciones:</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}
    </View>
  );
}
