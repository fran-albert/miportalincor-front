// src/components/pdf/VisualAcuityPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface VisualAcuityPdfProps {
  withoutCorrection: { right: string; left: string };
  withCorrection?: { right?: string; left?: string };
  chromaticVision: "normal" | "anormal";
  notes?: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, marginBottom: 6, color: "#555" },
  table: { width: "100%", borderWidth: 1, borderColor: "#000", borderCollapse: "collapse" },
  row: { flexDirection: "row" },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
  },
  headerCell: { fontSize: 10, fontWeight: "bold", textAlign: "center" },
  bodyCell: { fontSize: 10, textAlign: "center" },
  firstCol: { flex: 2 },
  otherCol: { flex: 1 },
  chromaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  chromaLabel: { fontSize: 10, fontWeight: "bold", marginRight: 4 },
  chromaValue: { fontSize: 10 },
  notesContainer: { marginTop: 6 },
  notesLabel: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  notesText: { fontSize: 10 },
});

export default function VisualAcuityPdf({
  withoutCorrection,
  withCorrection = { right: "-", left: "-" },
  chromaticVision,
  notes = "",
}: VisualAcuityPdfProps) {
  const chromaColor = chromaticVision === "normal" ? "#006400" : "#8B0000"; // verde/rojo
  const chromaText = chromaticVision === "normal" ? "Normal" : "Anormal";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agudeza Visual</Text>
      <Text style={styles.subtitle}>
        Valores sin corrección (S/C) y con corrección (C/C).
      </Text>

      {/* Tabla */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.firstCol]}>
            <Text style={styles.headerCell}>&nbsp;</Text>
          </View>
          <View style={[styles.cell, styles.otherCol]}>
            <Text style={styles.headerCell}>S/C</Text>
          </View>
          <View style={[styles.cell, styles.otherCol, { borderRightWidth: 0 }]}>
            <Text style={styles.headerCell}>C/C</Text>
          </View>
        </View>

        {/* Ojo Derecho */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.firstCol]}>
            <Text style={styles.bodyCell}>Ojo Derecho</Text>
          </View>
          <View style={[styles.cell, styles.otherCol]}>
            <Text style={styles.bodyCell}>{withoutCorrection.right}</Text>
          </View>
          <View style={[styles.cell, styles.otherCol, { borderRightWidth: 0 }]}>
            <Text style={styles.bodyCell}>{withCorrection.right}</Text>
          </View>
        </View>

        {/* Ojo Izquierdo */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.firstCol]}>
            <Text style={styles.bodyCell}>Ojo Izquierdo</Text>
          </View>
          <View style={[styles.cell, styles.otherCol]}>
            <Text style={styles.bodyCell}>{withoutCorrection.left}</Text>
          </View>
          <View style={[styles.cell, styles.otherCol, { borderRightWidth: 0 }]}>
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
