// src/components/pdf/CirculatorioPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import CheckboxPdf from "@/components/Pdf/CheckBox";

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
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  valueBox: {
    fontSize: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    paddingVertical: 2,
    paddingHorizontal: 4,
    width: 32,
    textAlign: "center",
    borderRadius: 4,
    marginRight: 4,
  },
  unitText: {
    fontSize: 10,
    fontStyle: "italic",
    marginRight: 12,
  },
  checkboxWrapper: {
    width: 16,
    alignItems: "center",
    marginRight: 4,
  },
  optionText: {
    fontSize: 10,
    fontStyle: "italic",
    marginRight: 12,
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
    marginBottom: 8,
  },
  varicesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  varicesObs: {
    fontSize: 10,
    fontStyle: "italic",
    marginLeft: 8,
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Circulatorio</Text>

      {/* Fila única con Frec. Cardíaca, TA y Sin alteraciones - solo si hay datos */}
      {hasClinicalData && (
        <View style={styles.rowInline}>
          {/* Frecuencia Cardíaca */}
          {frecuenciaCardiaca?.trim() && (
            <>
              <Text style={styles.label}>Frec. Cardíaca:</Text>
              <Text style={styles.valueBox}>{frecuenciaCardiaca}</Text>
              <Text style={styles.unitText}>x minuto</Text>
            </>
          )}

          {/* Tensión Arterial */}
          {presion?.trim() && (
            <>
              <Text style={[styles.label, { marginLeft: frecuenciaCardiaca?.trim() ? 12 : 0 }]}>TA:</Text>
              <Text style={styles.valueBox}>{presion}</Text>
              <Text style={styles.unitText}>mmHg</Text>
            </>
          )}

          {/* Sin alteraciones */}
          {sinAlteraciones !== undefined && (
            <>
              <View style={[styles.checkboxWrapper, { marginLeft: 12 }]}>
                <CheckboxPdf checked={sinAlteraciones} />
              </View>
              <Text style={styles.optionText}>Sin alteraciones</Text>
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

      {/* Várices - solo si está definido */}
      {varices !== undefined && (
        <View style={styles.varicesContainer}>
          <Text style={styles.label}>Várices:</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={varices === true} />
          </View>
          <Text style={styles.optionText}>Sí</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={varices === false} />
          </View>
          <Text style={styles.optionText}>No</Text>
          {varicesObs?.trim() && (
            <Text style={styles.varicesObs}>{varicesObs}</Text>
          )}
        </View>
      )}
    </View>
  );
}
