import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface BucodentalPdfProps {
  sinAlteraciones: boolean;
  caries: boolean;
  faltanPiezas: boolean;
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
    paddingVertical: 4,
    color: "#187B80",
    paddingHorizontal: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 4,
  },
  checkboxWrapper: {
    width: 16,
    alignItems: "center",
    marginRight: 6,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  optionText: {
    fontSize: 10,
    fontStyle: "italic",
    marginLeft: 4,
  },
  obsContainer: {
    marginTop: 8,
  },
  obsLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 2,
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

export default function BucodentalPdf({ sinAlteraciones, caries, faltanPiezas, observaciones }: BucodentalPdfProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Examen Bucodental</Text>

      <View style={styles.optionsContainer}>
        <View style={styles.optionItem}>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={sinAlteraciones} />
          </View>
          <Text style={styles.optionLabel}>Sin alteraciones</Text>
        </View>

        <View style={styles.optionItem}>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={caries} />
          </View>
          <Text style={styles.optionLabel}>Caries</Text>
        </View>

        <View style={styles.optionItem}>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={faltanPiezas} />
          </View>
          <Text style={styles.optionLabel}>Faltan piezas</Text>
        </View>
      </View>

      <View style={styles.obsContainer}>
        <Text style={styles.obsLabel}>Observaciones</Text>
        <Text style={styles.obsText}>
          {observaciones.trim() !== "" ? observaciones : "—"}
        </Text>
      </View>
    </View>
  );
}
