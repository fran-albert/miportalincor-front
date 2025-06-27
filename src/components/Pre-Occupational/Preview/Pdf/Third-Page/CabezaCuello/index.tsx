// src/components/pdf/CabezaCuelloPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface CabezaCuelloPdfProps {
  sinAlteraciones: boolean;
  observaciones: string;
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

export default function CabezaCuelloPdf({
  sinAlteraciones,
  observaciones,
}: CabezaCuelloPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cabeza y Cuello</Text>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={sinAlteraciones} />
        </View>
        <Text style={styles.optionText}>
          Sin alteraciones: {sinAlteraciones ? "Sí" : "No"}
        </Text>
      </View>

      {/* Observaciones */}
      <Text style={styles.obsLabel}>Observaciones</Text>
      <Text style={styles.obsText}>
        {observaciones.trim() !== "" ? observaciones : "—"}
      </Text>
    </View>
  );
}
