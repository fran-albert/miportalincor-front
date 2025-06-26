// src/components/pdf/BucodentalPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface BucodentalPdfProps {
  sinAlteraciones: boolean;
  caries: boolean;
  faltanPiezas: boolean;
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
  obsLabel: { fontSize: 10, fontWeight: "bold", marginBottom: 2, marginTop: 6 },
  obsText: { fontSize: 10 },
});

export default function BucodentalPdf({
  sinAlteraciones,
  caries,
  faltanPiezas,
  observaciones,
}: BucodentalPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Examen Bucodental</Text>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <Text style={styles.label}>Sin alteraciones:</Text>
        <CheckboxPdf checked={sinAlteraciones} />
        <Text style={styles.optionText}>{sinAlteraciones ? "Sí" : "No"}</Text>
      </View>

      {/* Caries */}
      <View style={styles.row}>
        <Text style={styles.label}>Caries:</Text>
        <CheckboxPdf checked={caries} />
        <Text style={styles.optionText}>{caries ? "Sí" : "No"}</Text>
      </View>

      {/* Faltan piezas */}
      <View style={styles.row}>
        <Text style={styles.label}>Faltan piezas:</Text>
        <CheckboxPdf checked={faltanPiezas} />
        <Text style={styles.optionText}>{faltanPiezas ? "Sí" : "No"}</Text>
      </View>

      {/* Observaciones */}
      <Text style={styles.obsLabel}>Observaciones:</Text>
      <Text style={styles.obsText}>
        {observaciones.trim() !== "" ? observaciones : "—"}
      </Text>
    </View>
  );
}
