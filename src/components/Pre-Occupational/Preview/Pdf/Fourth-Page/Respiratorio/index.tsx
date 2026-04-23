import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

interface RespiratorioPdfProps {
  frecuenciaRespiratoria?: string;
  oximetria?: string;
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
  rowAll: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  inputBox: {
    fontSize: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    paddingVertical: 2,
    paddingHorizontal: 4,
    width: 32,
    textAlign: "center",
    borderRadius: 4,
    marginRight: 8,
  },
  unitText: {
    fontSize: 10,
    fontStyle: "italic",
    marginRight: 12,
  },
  checkboxWrapper: {
    width: 16,
    alignItems: "center",
    marginLeft: 12,
    marginRight: 4,
  },
  checkboxLabel: {
    fontSize: 10,
    fontWeight: "500",
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

export default function RespiratorioPdf({
  frecuenciaRespiratoria,
  oximetria,
  sinAlteraciones,
  observaciones,
}: RespiratorioPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = sinAlteraciones !== undefined ||
    (frecuenciaRespiratoria?.trim() ?? '') !== '' ||
    (oximetria?.trim() ?? '') !== '' ||
    (observaciones?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  const hasClinicalData = (frecuenciaRespiratoria?.trim() ?? '') !== '' ||
    (oximetria?.trim() ?? '') !== '' ||
    sinAlteraciones !== undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Respiratorio</Text>

      {/* Frecuencia, Oximetría y Sin Alteraciones en una misma fila - solo si hay datos */}
      {hasClinicalData && (
        <View style={styles.rowAll}>
          {frecuenciaRespiratoria?.trim() && (
            <>
              <Text style={styles.label}>Frecuencia Resp.:</Text>
              <Text style={styles.inputBox}>{frecuenciaRespiratoria}</Text>
              <Text style={styles.unitText}>x minuto</Text>
            </>
          )}

          {oximetria?.trim() && (
            <>
              <Text style={[styles.label, { marginLeft: frecuenciaRespiratoria?.trim() ? 12 : 0 }]}>Oximetría:</Text>
              <Text style={styles.inputBox}>{oximetria}</Text>
              <Text style={styles.unitText}>%</Text>
            </>
          )}

          {sinAlteraciones !== undefined && (
            <>
              <View style={styles.checkboxWrapper}>
                <CheckboxPdf checked={sinAlteraciones} />
              </View>
              <Text style={styles.checkboxLabel}>Sin alteraciones</Text>
            </>
          )}
        </View>
      )}

      {/* Observaciones - solo si hay */}
      {observaciones?.trim() && (
        <>
          <Text style={styles.obsLabel}>Observaciones</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </>
      )}
    </View>
  );
}
