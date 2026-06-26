import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface CirculatorioPdfProps {
  frecuenciaCardiaca?: string;
  presion?: string;
  sinAlteraciones?: boolean;
  observaciones?: string;
  varices?: boolean;
  varicesObs?: string;
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
    gap: 8,
    flexWrap: "wrap",
  },
  measurementCard: {
    width: "48%",
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
  statusCard: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
});

export default function CirculatorioPdf({
  frecuenciaCardiaca,
  presion,
  sinAlteraciones,
  observaciones,
  varices,
  varicesObs,
}: CirculatorioPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = sinAlteraciones !== undefined ||
    varices !== undefined ||
    (frecuenciaCardiaca?.trim() ?? '') !== '' ||
    (presion?.trim() ?? '') !== '' ||
    (observaciones?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  const hasClinicalData = (frecuenciaCardiaca?.trim() ?? '') !== '' ||
    (presion?.trim() ?? '') !== '' ||
    sinAlteraciones !== undefined;

  const measurementItems = [
    frecuenciaCardiaca?.trim()
      ? {
          label: "Frecuencia cardíaca",
          value: `${frecuenciaCardiaca} x minuto`,
        }
      : null,
    presion?.trim()
      ? {
          label: "Presión arterial",
          value: `${presion} mmHg`,
        }
      : null,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Aparato circulatorio</Text>
      </View>
      <View style={styles.body}>
        {!!measurementItems.length && (
          <View style={styles.measurements}>
            {measurementItems.map((item) => (
              <View key={item!.label} style={styles.measurementCard}>
                <Text style={styles.label}>{item!.label}</Text>
                <Text style={styles.value}>{item!.value}</Text>
              </View>
            ))}
          </View>
        )}

        {hasClinicalData && sinAlteraciones !== undefined && (
          <View style={styles.statusCard}>
            <Text style={styles.label}>Sin alteraciones</Text>
            <Text style={styles.value}>{sinAlteraciones ? "Sí" : "No"}</Text>
          </View>
        )}

        {varices !== undefined && (
          <View style={styles.statusCard}>
            <Text style={styles.label}>Várices</Text>
            <Text style={styles.value}>
              {varices ? "Sí" : "No"}
              {varicesObs?.trim() ? ` · ${varicesObs}` : ""}
            </Text>
          </View>
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
