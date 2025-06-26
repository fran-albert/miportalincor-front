// src/components/pdf/NeurologicoPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface NeurologicoPdfProps {
  sinAlteraciones: boolean;
  observaciones: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { fontSize: 10, fontWeight: "bold", marginRight: 6 },
  checkboxBox: {
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
  checkboxText: { fontSize: 10 },
  obsLabel: { fontSize: 10, fontWeight: "bold", marginTop: 6, marginBottom: 2 },
  obsText: { fontSize: 10 },
});


export default function NeurologicoPdf({
  sinAlteraciones,
  observaciones,
}: NeurologicoPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Neurológico</Text>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <CheckboxPdf checked={sinAlteraciones} />
        <Text style={styles.checkboxText}>Sin alteraciones</Text>
      </View>

      {/* Observaciones */}
      {observaciones.trim() !== "" && (
        <View>
          <Text style={styles.obsLabel}>Observaciones:</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}
    </View>
  );
}
