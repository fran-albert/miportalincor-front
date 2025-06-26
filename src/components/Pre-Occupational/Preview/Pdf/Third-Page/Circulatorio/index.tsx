// src/components/pdf/CirculatorioPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface CirculatorioPdfProps {
  frecuenciaCardiaca: string;
  presion: string;
  sinAlteraciones: boolean;
  observaciones: string;
  varices: boolean;
  varicesObs: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  cell: { width: "33%", flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { fontSize: 10, fontWeight: "bold", marginRight: 4 },
  value: { fontSize: 10, marginRight: 4 },
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
  obsBlock: { marginBottom: 6 },
  obsLabel: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  obsText: { fontSize: 10 },
  varicesRow: { flexDirection: "row", alignItems: "center" },
  varicesLabel: { fontSize: 10, fontWeight: "bold", marginRight: 4 },
  varicesObs: { fontSize: 10, marginLeft: 6 },
});



export default function CirculatorioPdf({
  frecuenciaCardiaca,
  presion,
  sinAlteraciones,
  observaciones,
  varices,
  varicesObs,
}: CirculatorioPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Circulatorio</Text>

      {/* Grid de 3 */}
      <View style={styles.grid}>
        {/* Frecuencia Cardíaca */}
        <View style={styles.cell}>
          <Text style={styles.label}>Frec. Cardíaca:</Text>
          <Text style={styles.value}>{frecuenciaCardiaca || "—"}</Text>
          <Text style={styles.value}>x minuto</Text>
        </View>
        {/* Tensión Arterial */}
        <View style={styles.cell}>
          <Text style={styles.label}>TA:</Text>
          <Text style={styles.value}>{presion || "—"}</Text>
          <Text style={styles.value}>mmHg</Text>
        </View>
        {/* Sin alteraciones */}
        <View style={styles.cell}>
          <CheckboxPdf checked={sinAlteraciones} />
          <Text style={styles.value}>Sin alteraciones</Text>
        </View>
      </View>

      {/* Observaciones */}
      {observaciones.trim() !== "" && (
        <View style={styles.obsBlock}>
          <Text style={styles.obsLabel}>Observaciones:</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}

      {/* Várices */}
      <View style={styles.varicesRow}>
        <Text style={styles.varicesLabel}>Várices:</Text>
        <CheckboxPdf checked={varices} />
        <Text style={styles.value}>Sí</Text>
        <CheckboxPdf checked={!varices} />
        <Text style={styles.value}>No</Text>
        {varicesObs.trim() !== "" && (
          <Text style={styles.varicesObs}>{varicesObs}</Text>
        )}
      </View>
    </View>
  );
}
