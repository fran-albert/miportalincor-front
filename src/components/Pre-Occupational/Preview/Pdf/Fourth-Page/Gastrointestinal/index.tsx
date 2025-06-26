// src/components/pdf/GastrointestinalPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface GastrointestinalPdfProps {
  sinAlteraciones: boolean;
  observaciones: string;
  cicatrices: boolean;
  cicatricesObs: string;
  hernias: boolean;
  herniasObs: string;
  eventraciones: boolean;
  eventracionesObs: string;
  hemorroides: boolean;
  hemorroidesObs: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { fontSize: 10, fontWeight: "bold", marginRight: 6 },
  checkboxBox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 4,
  },
  tick: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 6,
    height: 6,
    backgroundColor: "#000",
  },
  optionText: { fontSize: 10, marginRight: 12 },
  obsLabel: { fontSize: 10, fontWeight: "bold", marginTop: 6, marginBottom: 2 },
  obsText: { fontSize: 10, marginLeft: 6 },
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Gastrointestinal</Text>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <CheckboxPdf checked={sinAlteraciones} />
        <Text style={styles.optionText}>Sin alteraciones</Text>
      </View>

      {/* Observaciones generales */}
      {observaciones.trim() !== "" && (
        <View style={{ marginBottom: 6 }}>
          <Text style={styles.obsLabel}>Observaciones:</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}

      {/* Cicatrices */}
      <View style={styles.row}>
        <Text style={styles.label}>Cicatrices:</Text>
        <CheckboxPdf checked={cicatrices} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={!cicatrices} />
        <Text style={styles.optionText}>No</Text>
        {cicatricesObs.trim() !== "" && (
          <Text style={styles.obsText}>{cicatricesObs}</Text>
        )}
      </View>

      {/* Hernias */}
      <View style={styles.row}>
        <Text style={styles.label}>Hernias:</Text>
        <CheckboxPdf checked={hernias} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={!hernias} />
        <Text style={styles.optionText}>No</Text>
        {herniasObs.trim() !== "" && (
          <Text style={styles.obsText}>{herniasObs}</Text>
        )}
      </View>

      {/* Eventraciones */}
      <View style={styles.row}>
        <Text style={styles.label}>Eventraciones:</Text>
        <CheckboxPdf checked={eventraciones} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={!eventraciones} />
        <Text style={styles.optionText}>No</Text>
        {eventracionesObs.trim() !== "" && (
          <Text style={styles.obsText}>{eventracionesObs}</Text>
        )}
      </View>

      {/* Hemorroides */}
      <View style={styles.row}>
        <Text style={styles.label}>Hemorroides:</Text>
        <CheckboxPdf checked={hemorroides} />
        <Text style={styles.optionText}>Sí</Text>
        <CheckboxPdf checked={!hemorroides} />
        <Text style={styles.optionText}>No</Text>
        {hemorroidesObs.trim() !== "" && (
          <Text style={styles.obsText}>{hemorroidesObs}</Text>
        )}
      </View>
    </View>
  );
}
