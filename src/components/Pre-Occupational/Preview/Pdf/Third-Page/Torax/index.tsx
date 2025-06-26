// src/components/pdf/ToraxPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface ToraxPdfProps {
  deformaciones: "si" | "no";
  deformacionesObs: string;
  cicatrices: "si" | "no";
  cicatricesObs: string;
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

export default function ToraxPdf({
  deformaciones,
  deformacionesObs,
  cicatrices,
  cicatricesObs,
}: ToraxPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tórax</Text>

      {/* Deformaciones */}
      <View style={styles.row}>
        <Text style={styles.label}>Deformaciones:</Text>
        <CheckboxPdf checked={deformaciones === "si"} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={deformaciones === "no"} />
        <Text style={styles.optionText}>No</Text>
        <Text style={[styles.label, { marginLeft: 12 }]}>Obs.:</Text>
        <Text style={styles.obsText}>
          {deformacionesObs.trim() !== "" ? deformacionesObs : "—"}
        </Text>
      </View>

      {/* Cicatrices */}
      <View style={styles.row}>
        <Text style={styles.label}>Cicatrices:</Text>
        <CheckboxPdf checked={cicatrices === "si"} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={cicatrices === "no"} />
        <Text style={styles.optionText}>No</Text>
        <Text style={[styles.label, { marginLeft: 12 }]}>Obs.:</Text>
        <Text style={styles.obsText}>
          {cicatricesObs.trim() !== "" ? cicatricesObs : "—"}
        </Text>
      </View>
    </View>
  );
}
