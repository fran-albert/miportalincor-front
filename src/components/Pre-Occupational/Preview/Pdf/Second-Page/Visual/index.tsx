// src/components/pdf/VisualAcuityPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface VisualAcuityPdfProps {
  withoutCorrection: { right: string; left: string };
  withCorrection?: { right?: string; left?: string };
  chromaticVision: "normal" | "anormal";
  notes?: string;
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
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: pdfColors.line,
    padding: 6,
  },
  headerCell: {
    fontSize: 8,
    fontWeight: "500",
    textAlign: "center",
    color: pdfColors.muted,
    textTransform: "uppercase",
  },
  bodyCell: {
    fontSize: 10,
    textAlign: "center",
    color: pdfColors.ink,
  },
  firstCol: {
    flex: 2,
  },
  chromaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chromaLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  chromaValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  notesContainer: {
    gap: 4,
  },
  notesLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  notesText: {
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
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Agudeza visual</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.table}>
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
          <View style={styles.row}>
            <View style={[styles.cell, styles.firstCol]}>
              <Text style={styles.bodyCell}>Ojo derecho</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.bodyCell}>{withoutCorrection.right}</Text>
            </View>
            <View style={[styles.cell, { borderRightWidth: 0 }]}>
              <Text style={styles.bodyCell}>{withCorrection.right}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.cell, styles.firstCol, { borderBottomWidth: 0 }]}>
              <Text style={styles.bodyCell}>Ojo izquierdo</Text>
            </View>
            <View style={[styles.cell, { borderBottomWidth: 0 }]}>
              <Text style={styles.bodyCell}>{withoutCorrection.left}</Text>
            </View>
            <View
              style={[
                styles.cell,
                { borderRightWidth: 0, borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.bodyCell}>{withCorrection.left}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chromaRow}>
          <Text style={styles.chromaLabel}>Vision cromatica</Text>
          <Text style={[styles.chromaValue, { color: chromaColor }]}>
            {chromaText}
          </Text>
        </View>

        {notes.trim() !== "" && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Observaciones</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
