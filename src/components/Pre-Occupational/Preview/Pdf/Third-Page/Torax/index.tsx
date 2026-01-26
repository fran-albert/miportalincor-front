import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface ToraxPdfProps {
  deformaciones?: "si" | "no";
  deformacionesObs?: string;
  cicatrices?: "si" | "no";
  cicatricesObs?: string;
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
  groupContainer: {
    marginBottom: 8,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
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
    marginLeft: 2,
    marginRight: 12,
  },
  obsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginTop: 2,
  },
  obsLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  obsText: {
    fontSize: 10,
    fontStyle: "italic",
    flex: 1,
  },
});

export default function ToraxPdf({ deformaciones, deformacionesObs, cicatrices, cicatricesObs }: ToraxPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = deformaciones !== undefined ||
    cicatrices !== undefined;

  if (!hasAnyData) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tórax</Text>

      {/* Deformaciones - solo mostrar si está definido */}
      {deformaciones !== undefined && (
        <View style={styles.groupContainer}>
          <View style={styles.groupRow}>
            <Text style={styles.label}>Deformaciones:</Text>
            <View style={styles.checkboxWrapper}>
              <CheckboxPdf checked={deformaciones === "si"} />
            </View>
            <Text style={styles.optionText}>Sí</Text>
            <View style={styles.checkboxWrapper}>
              <CheckboxPdf checked={deformaciones === "no"} />
            </View>
            <Text style={styles.optionText}>No</Text>
          </View>
          {deformacionesObs?.trim() && (
            <View style={styles.obsContainer}>
              <Text style={styles.obsLabel}>Observaciones:</Text>
              <Text style={styles.obsText}>{deformacionesObs}</Text>
            </View>
          )}
        </View>
      )}

      {/* Cicatrices - solo mostrar si está definido */}
      {cicatrices !== undefined && (
        <View style={styles.groupContainer}>
          <View style={styles.groupRow}>
            <Text style={styles.label}>Cicatrices:</Text>
            <View style={styles.checkboxWrapper}>
              <CheckboxPdf checked={cicatrices === "si"} />
            </View>
            <Text style={styles.optionText}>Sí</Text>
            <View style={styles.checkboxWrapper}>
              <CheckboxPdf checked={cicatrices === "no"} />
            </View>
            <Text style={styles.optionText}>No</Text>
          </View>
          {cicatricesObs?.trim() && (
            <View style={styles.obsContainer}>
              <Text style={styles.obsLabel}>Observaciones:</Text>
              <Text style={styles.obsText}>{cicatricesObs}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
