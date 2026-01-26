// src/components/pdf/NeurologicoPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface NeurologicoPdfProps {
  sinAlteraciones?: boolean;
  observaciones?: string;
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
    marginBottom: 8,
  },
  checkboxWrapper: {
    width: 16,
    alignItems: "center",
    marginRight: 6,
  },
  checkboxLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  obsLabel: {
    fontSize: 10,
    fontWeight: "500",
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

export default function NeurologicoPdf({
  sinAlteraciones,
  observaciones,
}: NeurologicoPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = sinAlteraciones !== undefined ||
    (observaciones?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Neurológico</Text>

      {/* Sin alteraciones - solo mostrar si está definido */}
      {sinAlteraciones !== undefined && (
        <View style={styles.row}>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={sinAlteraciones} />
          </View>
          <Text style={styles.checkboxLabel}>Sin alteraciones</Text>
        </View>
      )}

      {/* Observaciones - solo si hay */}
      {observaciones?.trim() && (
        <View>
          <Text style={styles.obsLabel}>Observaciones</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}
    </View>
  );
}
