// src/components/pdf/GenitourinarioPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface GenitourinarioPdfProps {
  sinAlteraciones?: boolean;
  observaciones?: string;
  varicocele?: boolean;
  varicoceleObs?: string;
  fum?: string;
  partos?: string;
  cesarea?: string;
  embarazos?: string;
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
    marginRight: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
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

  obsInlineInline: {
    fontSize: 10,
    marginLeft: 8,
    flex: 1, // que use el espacio restante
  },

  // Bloque vertical para FUM / Embarazos / Partos / Cesárea
  dataBlock: {
    marginTop: 8,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  dataLabel: {
    width: 90, // ancho fijo para alinear todas las etiquetas
    fontSize: 10,
    fontWeight: "500",
  },
  dataValue: {
    flex: 1,
    fontSize: 10,
  },
});

export default function GenitourinarioPdf({
  sinAlteraciones,
  observaciones,
  varicocele,
  varicoceleObs,
  fum,
  partos,
  cesarea,
  embarazos,
}: GenitourinarioPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = sinAlteraciones !== undefined ||
    varicocele !== undefined ||
    (observaciones?.trim() ?? '') !== '' ||
    (fum?.trim() ?? '') !== '' ||
    (partos?.trim() ?? '') !== '' ||
    (cesarea?.trim() ?? '') !== '' ||
    (embarazos?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  // Verificar si hay datos gineco-obstétricos
  const hasGinecoData = (fum?.trim() ?? '') !== '' ||
    (partos?.trim() ?? '') !== '' ||
    (cesarea?.trim() ?? '') !== '' ||
    (embarazos?.trim() ?? '') !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Genitourinario</Text>

      {/* Sin alteraciones - solo mostrar si está definido */}
      {sinAlteraciones !== undefined && (
        <View style={styles.row}>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={sinAlteraciones} />
          </View>
          <Text style={styles.optionText}>Sin alteraciones</Text>
        </View>
      )}

      {/* Observaciones generales */}
      {observaciones?.trim() && (
        <View>
          <Text style={styles.obsLabel}>Observaciones:</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}

      {/* Varicocele - solo mostrar si está definido */}
      {varicocele !== undefined && (
        <>
          <View style={[styles.row, { marginTop: 8, alignItems: "flex-start" }]}>
            <Text style={styles.label}>Varicocele:</Text>
            <View style={styles.checkboxWrapper}>
              <CheckboxPdf checked={varicocele === true} />
            </View>
            <Text style={styles.optionText}>Sí</Text>
            <View style={styles.checkboxWrapper}>
              <CheckboxPdf checked={varicocele === false} />
            </View>
            <Text style={styles.optionText}>No</Text>
          </View>
          {varicoceleObs?.trim() && (
            <Text style={styles.obsInlineInline}>{varicoceleObs}</Text>
          )}
        </>
      )}

      {/* Datos gineco-obstétricos - solo mostrar si hay alguno completado */}
      {hasGinecoData && (
        <View style={styles.dataBlock}>
          {fum?.trim() && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Fecha F.U.M:</Text>
              <Text style={styles.dataValue}>{fum}</Text>
            </View>
          )}
          {embarazos?.trim() && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Embarazos:</Text>
              <Text style={styles.dataValue}>{embarazos}</Text>
            </View>
          )}
          {partos?.trim() && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Partos:</Text>
              <Text style={styles.dataValue}>{partos}</Text>
            </View>
          )}
          {cesarea?.trim() && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Cesárea:</Text>
              <Text style={styles.dataValue}>{cesarea}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
