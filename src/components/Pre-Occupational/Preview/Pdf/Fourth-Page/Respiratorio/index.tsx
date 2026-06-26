import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface RespiratorioPdfProps {
  frecuenciaRespiratoria?: string;
  oximetria?: string;
  sinAlteraciones?: boolean;
  observaciones?: string;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  headerWrap: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    color: pdfColors.accentText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  measurements: {
    flexDirection: "row",
    gap: 10,
  },
  measurementCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  label: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  value: {
    fontSize: 10,
    color: pdfColors.ink,
    fontWeight: "bold",
  },
  flagCard: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  flagValue: {
    fontSize: 10,
    color: pdfColors.ink,
    fontWeight: "bold",
  },
  obsLabel: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  obsText: {
    fontSize: 10,
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    color: pdfColors.ink,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Aparato respiratorio</Text>
      </View>
      <View style={styles.body}>
        {hasClinicalData && (
          <>
            <View style={styles.measurements}>
              {frecuenciaRespiratoria?.trim() && (
                <View style={styles.measurementCard}>
                  <Text style={styles.label}>Frecuencia respiratoria</Text>
                  <Text style={styles.value}>
                    {frecuenciaRespiratoria} x minuto
                  </Text>
                </View>
              )}
              {oximetria?.trim() && (
                <View style={styles.measurementCard}>
                  <Text style={styles.label}>Oximetria</Text>
                  <Text style={styles.value}>{oximetria} %</Text>
                </View>
              )}
            </View>
            {sinAlteraciones !== undefined && (
              <View style={styles.flagCard}>
                <Text style={styles.label}>Sin alteraciones</Text>
                <Text style={styles.flagValue}>
                  {sinAlteraciones ? "Sí" : "No"}
                </Text>
              </View>
            )}
          </>
        )}

        {observaciones?.trim() && (
          <View>
            <Text style={styles.obsLabel}>Observaciones</Text>
            <Text style={styles.obsText}>{observaciones}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
