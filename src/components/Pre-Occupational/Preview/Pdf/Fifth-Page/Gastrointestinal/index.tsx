// src/components/pdf/GastrointestinalPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface GastrointestinalPdfProps {
  sinAlteraciones?: boolean;
  observaciones?: string;
  cicatrices?: boolean;
  cicatricesObs?: string;
  hernias?: boolean;
  herniasObs?: string;
  eventraciones?: boolean;
  eventracionesObs?: string;
  hemorroides?: boolean;
  hemorroidesObs?: string;
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
    marginRight: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginRight: 4,
  },
  optionText: {
    fontSize: 10,
    fontStyle: "italic",
    marginRight: 12,
  },
  obsInline: {
    fontSize: 10,
    marginLeft: 4,
    marginRight: 12,
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

export default function GastrointestinalPdf({
  sinAlteraciones,
  observaciones,
  cicatrices,
  cicatricesObs,
  hernias,
  herniasObs,
  eventraciones,
  eventracionesObs,
  hemorroides,
  hemorroidesObs,
}: GastrointestinalPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = sinAlteraciones !== undefined ||
    cicatrices !== undefined ||
    hernias !== undefined ||
    eventraciones !== undefined ||
    hemorroides !== undefined ||
    (observaciones?.trim() ?? '') !== '';

  if (!hasAnyData) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Gastrointestinal</Text>

      {/* Sin alteraciones - solo mostrar si está definido */}
      {sinAlteraciones !== undefined && (
        <View style={styles.row}>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={sinAlteraciones} />
          </View>
          <Text style={styles.optionText}>Sin alteraciones</Text>
        </View>
      )}

      {/* Cicatrices - solo mostrar si está definido */}
      {cicatrices !== undefined && (
        <View style={styles.row}>
          <Text style={styles.label}>Cicatrices:</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={cicatrices === true} />
          </View>
          <Text style={styles.optionText}>Sí</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={cicatrices === false} />
          </View>
          <Text style={styles.optionText}>No</Text>
          {cicatricesObs?.trim() && (
            <Text style={styles.obsInline}>{cicatricesObs}</Text>
          )}
        </View>
      )}

      {/* Hernias - solo mostrar si está definido */}
      {hernias !== undefined && (
        <View style={styles.row}>
          <Text style={styles.label}>Hernias:</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={hernias === true} />
          </View>
          <Text style={styles.optionText}>Sí</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={hernias === false} />
          </View>
          <Text style={styles.optionText}>No</Text>
          {herniasObs?.trim() && (
            <Text style={styles.obsInline}>{herniasObs}</Text>
          )}
        </View>
      )}

      {/* Eventraciones - solo mostrar si está definido */}
      {eventraciones !== undefined && (
        <View style={styles.row}>
          <Text style={styles.label}>Eventraciones:</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={eventraciones === true} />
          </View>
          <Text style={styles.optionText}>Sí</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={eventraciones === false} />
          </View>
          <Text style={styles.optionText}>No</Text>
          {eventracionesObs?.trim() && (
            <Text style={styles.obsInline}>{eventracionesObs}</Text>
          )}
        </View>
      )}

      {/* Hemorroides - solo mostrar si está definido */}
      {hemorroides !== undefined && (
        <View style={styles.row}>
          <Text style={styles.label}>Hemorroides:</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={hemorroides === true} />
          </View>
          <Text style={styles.optionText}>Sí</Text>
          <View style={styles.checkboxWrapper}>
            <CheckboxPdf checked={hemorroides === false} />
          </View>
          <Text style={styles.optionText}>No</Text>
          {hemorroidesObs?.trim() && (
            <Text style={styles.obsInline}>{hemorroidesObs}</Text>
          )}
        </View>
      )}

      {/* Observaciones generales */}
      {observaciones?.trim() && (
        <View>
          <Text style={styles.obsLabel}>Observaciones</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}
    </View>
  );
}
