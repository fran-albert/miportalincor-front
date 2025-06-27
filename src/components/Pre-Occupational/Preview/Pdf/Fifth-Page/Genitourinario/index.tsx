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
    marginBottom: 4,
  },
  checkboxWrapper: {
    width: 16,
    alignItems: "center",
    marginRight: 6,
  },
  optionText: {
    fontSize: 10,
    fontStyle: "italic",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  obsGeneral: {
    fontSize: 10,
    marginTop: 4,
    marginLeft: 22, // align under text, indented past checkbox
  },
  obsInline: {
    fontSize: 10,
    marginLeft: 12,
  },
  obsLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 4,
  },
  obsText: {
    fontSize: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 4,
    backgroundColor: "#F9F9F9",
  },
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
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={sinAlteraciones} />
        </View>
        <Text style={styles.optionText}>Sin alteraciones</Text>
      </View>
      {observaciones.trim() !== "" && (
        <View>
          <Text style={styles.obsLabel}>Observaciones</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}

      {/* Varicocele */}
      <View style={[styles.row, { marginTop: 8 }]}>
        <Text style={styles.label}>Varicocele:</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={varicocele} />
        </View>
        <Text style={styles.optionText}>Sí</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={!varicocele} />
        </View>
        <Text style={styles.optionText}>No</Text>
        {varicoceleObs.trim() !== "" && (
          <Text style={styles.obsInline}>{varicoceleObs}</Text>
        )}
      </View>
    </View>
  );
}
