// src/components/pdf/PielPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
interface PielPdfProps {
  normocoloreada: "si" | "no";
  tatuajes: "si" | "no";
  observaciones: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { fontSize: 10, fontWeight: "bold", marginRight: 6 },
  box: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 4,
  },
  tick: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 6,
    height: 6,
    backgroundColor: "#000",
  },
  optionText: { fontSize: 10, marginRight: 12 },
  obsLabel: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  obsText: { fontSize: 10 },
});

export default function PielPdf({
  normocoloreada,
  tatuajes,
  observaciones,
}: PielPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Piel</Text>

      {/* Normocoloreada */}
      <View style={styles.row}>
        <Text style={styles.label}>Normocoloreada:</Text>
        <CheckboxPdf checked={normocoloreada === "si"} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={normocoloreada === "no"} />
        <Text style={styles.optionText}>No</Text>
      </View>

      {/* Tatuajes */}
      <View style={styles.row}>
        <Text style={styles.label}>Tatuajes:</Text>
        <CheckboxPdf checked={tatuajes === "si"} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={tatuajes === "no"} />
        <Text style={styles.optionText}>No</Text>
      </View>

      {/* Observaciones */}
      <View style={{ marginTop: 6 }}>
        <Text style={styles.obsLabel}>Observaciones:</Text>
        <Text style={styles.obsText}>
          {observaciones.trim() !== "" ? observaciones : "—"}
        </Text>
      </View>
    </View>
  );
}
