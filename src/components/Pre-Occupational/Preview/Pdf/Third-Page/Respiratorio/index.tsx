// src/components/pdf/RespiratorioPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface RespiratorioPdfProps {
  frecuenciaRespiratoria: string;
  oximetria: string;
  sinAlteraciones: boolean;
  observaciones: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  fieldLabel: { fontSize: 10, fontWeight: "bold", marginRight: 4 },
  inputBox: {
    fontSize: 10,
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: 30,
    textAlign: "center",
    marginRight: 4,
  },
  unitText: { fontSize: 10, marginRight: 12 },
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
  checkboxLabel: { fontSize: 10 },
  obsLabel: { fontSize: 10, fontWeight: "bold", marginTop: 6, marginBottom: 2 },
  obsText: { fontSize: 10 },
});

export default function RespiratorioPdf({
  frecuenciaRespiratoria,
  oximetria,
  sinAlteraciones,
  observaciones,
}: RespiratorioPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Respiratorio</Text>

      {/* Frecuencia Respiratoria */}
      <View style={styles.row}>
        <Text style={styles.fieldLabel}>Frecuencia Resp.:</Text>
        <Text style={styles.inputBox}>{frecuenciaRespiratoria || "—"}</Text>
        <Text style={styles.unitText}>x minuto</Text>
      </View>

      {/* Oximetría */}
      <View style={styles.row}>
        <Text style={styles.fieldLabel}>Oximetría:</Text>
        <Text style={styles.inputBox}>{oximetria || "—"}</Text>
        <Text style={styles.unitText}>%</Text>
      </View>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <CheckboxPdf checked={sinAlteraciones} />
        <Text style={styles.checkboxLabel}>Sin alteraciones</Text>
      </View>

      {/* Observaciones */}
      <Text style={styles.obsLabel}>Observaciones:</Text>
      <Text style={styles.obsText}>
        {observaciones.trim() !== "" ? observaciones : "—"}
      </Text>
    </View>
  );
}
