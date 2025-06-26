// src/components/pdf/GenitourinarioPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface GenitourinarioPdfProps {
  sinAlteraciones: boolean;
  observaciones: string;
  varicocele: boolean;
  varicoceleObs: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
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
  label: { fontSize: 10, fontWeight: "bold", marginRight: 6 },
  optionText: { fontSize: 10, marginRight: 12 },
  obsLabel: { fontSize: 10, fontWeight: "bold", marginTop: 6, marginBottom: 2 },
  obsText: { fontSize: 10, marginLeft: 6 },
});

export default function GenitourinarioPdf({
  sinAlteraciones,
  observaciones,
  varicocele,
  varicoceleObs,
}: GenitourinarioPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Genitourinario</Text>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <CheckboxPdf checked={sinAlteraciones} />
        <Text style={styles.optionText}>Sin alteraciones</Text>
      </View>

      {/* Observaciones generales */}
      {observaciones.trim() !== "" && (
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.obsLabel}>Observaciones:</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}

      {/* Varicocele */}
      <View style={styles.row}>
        <Text style={styles.label}>Varicocele:</Text>
        <CheckboxPdf checked={varicocele} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={!varicocele} />
        <Text style={styles.optionText}>No</Text>
        {varicoceleObs.trim() !== "" && (
          <Text style={styles.obsText}>{varicoceleObs}</Text>
        )}
      </View>
    </View>
  );
}
