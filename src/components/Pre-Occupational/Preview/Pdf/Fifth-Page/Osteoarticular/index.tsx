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
  container: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#187B80",
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkboxWrapper: {
    width: 16,
    alignItems: "center",
    marginRight: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  optionText: {
    fontSize: 10,
    fontStyle: "italic",
    marginRight: 12,
  },
  obsInline: {
    fontSize: 10,
    marginLeft: 4,
  },
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
        <Text style={styles.label}>MMSS Sin alteraciones:</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={mmssSin} />
        </View>
        <Text style={styles.optionText}>{mmssSin ? "Sí" : "No"}</Text>
        <Text style={styles.obsInline}>
          {mmssObs.trim() !== "" ? mmssObs : "—"}
        </Text>
      </View>

      {/* MMII */}
      <View style={styles.row}>
        <Text style={styles.label}>MMII Sin alteraciones:</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={mmiiSin} />
        </View>
        <Text style={styles.optionText}>{mmiiSin ? "Sí" : "No"}</Text>
        <Text style={styles.obsInline}>
          {mmiiObs.trim() !== "" ? mmiiObs : "—"}
        </Text>
      </View>

      {/* Columna */}
      <View style={styles.row}>
        <Text style={styles.label}>Columna Sin alteraciones:</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={columnaSin} />
        </View>
        <Text style={styles.optionText}>{columnaSin ? "Sí" : "No"}</Text>
        <Text style={styles.obsInline}>
          {columnaObs.trim() !== "" ? columnaObs : "—"}
        </Text>
      </View>

      {/* Amputaciones */}
      <View style={styles.row}>
        <Text style={styles.label}>Amputaciones:</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={amputaciones} />
        </View>
        <Text style={styles.optionText}>{amputaciones ? "Sí" : "No"}</Text>
        <Text style={styles.obsInline}>
          {amputacionesObs.trim() !== "" ? amputacionesObs : "—"}
        </Text>
      </View>
    </View>
  );
}
