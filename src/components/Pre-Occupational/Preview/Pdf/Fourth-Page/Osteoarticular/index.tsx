// src/components/pdf/OsteoarticularPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface OsteoarticularPdfProps {
  mmssSin: boolean;
  mmssObs: string;
  mmiiSin: boolean;
  mmiiObs: string;
  columnaSin: boolean;
  columnaObs: string;
  amputaciones: boolean;
  amputacionesObs: string;
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
  obsText: { fontSize: 10, marginLeft: 6 },
});


export default function OsteoarticularPdf({
  mmssSin,
  mmssObs,
  mmiiSin,
  mmiiObs,
  columnaSin,
  columnaObs,
  amputaciones,
  amputacionesObs,
}: OsteoarticularPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Osteoarticular</Text>

      {/* MMSS */}
      <View style={styles.row}>
        <Text style={styles.label}>MMSS Sin Alteraciones:</Text>
        <CheckboxPdf checked={mmssSin} />
        <Text style={styles.obsText}>{mmssObs.trim() || "—"}</Text>
      </View>

      {/* MMII */}
      <View style={styles.row}>
        <Text style={styles.label}>MMII Sin Alteraciones:</Text>
        <CheckboxPdf checked={mmiiSin} />
        <Text style={styles.obsText}>{mmiiObs.trim() || "—"}</Text>
      </View>

      {/* Columna */}
      <View style={styles.row}>
        <Text style={styles.label}>Columna Sin Alteraciones:</Text>
        <CheckboxPdf checked={columnaSin} />
        <Text style={styles.obsText}>{columnaObs.trim() || "—"}</Text>
      </View>

      {/* Amputaciones */}
      <View style={styles.row}>
        <Text style={styles.label}>Amputaciones:</Text>
        <CheckboxPdf checked={amputaciones} />
        <Text style={styles.obsText}>{amputacionesObs.trim() || "—"}</Text>
      </View>
    </View>
  );
}
