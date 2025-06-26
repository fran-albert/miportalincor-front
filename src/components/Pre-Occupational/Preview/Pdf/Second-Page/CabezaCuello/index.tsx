// src/components/pdf/CabezaCuelloPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface CabezaCuelloPdfProps {
  sinAlteraciones: boolean;
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
  optionText: { fontSize: 10 },
  obsLabel: { fontSize: 10, fontWeight: "bold", marginBottom: 2, marginTop: 6 },
  obsText: { fontSize: 10 },
});


export default function CabezaCuelloPdf({
  sinAlteraciones,
  observaciones,
}: CabezaCuelloPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cabeza y Cuello</Text>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <Text style={styles.label}>Sin alteraciones:</Text>
        <CheckboxPdf checked={sinAlteraciones} />
        <Text style={styles.optionText}>
          {sinAlteraciones ? "Sí" : "No"}
        </Text>
      </View>

      {/* Observaciones */}
      <Text style={styles.obsLabel}>Observaciones:</Text>
      <Text style={styles.obsText}>
        {observaciones.trim() !== "" ? observaciones : "—"}
      </Text>
    </View>
  );
}
