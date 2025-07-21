// src/components/pdf/GenitourinarioPdf.tsx
import CheckboxPdf from "@/components/Pdf/CheckBox";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

interface GenitourinarioPdfProps {
  sinAlteraciones: boolean;
  observaciones: string;
  varicocele: boolean;
  varicoceleObs: string;
  fum: string;
  partos: string;
  cesarea: string;
  embarazos: string;
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
  obsInlineRow: {
    flexDirection: "row",
    marginLeft: 22,
    marginBottom: 4,
  },
  obsInlineText: {
    fontSize: 10,
    marginLeft: 4,
  },

  // --- Estilos para F.U.M / Embarazos / Partos / Cesárea ---
  rowFour: {
    flexDirection: "row",
    marginTop: 8,
  },
  cell: {
    flex: 1,
  },
  cellMargin: {
    marginRight: 12,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 10,
    textAlign: "right",
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aparato Genitourinario</Text>

      {/* Sin alteraciones */}
      <View style={styles.row}>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={sinAlteraciones} />
        </View>
        <Text style={styles.optionText}>Sin alteraciones</Text>
      </View>

      {/* Observaciones generales */}
      {observaciones.trim() !== "" && (
        <View>
          <Text style={styles.obsLabel}>Observaciones:</Text>
          <Text style={styles.obsText}>{observaciones}</Text>
        </View>
      )}

      {/* Varicocele */}
      <View style={[styles.row, { marginTop: 8 }]}>
        <Text style={styles.label}>Varicocele:</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={varicocele} />
        </View>
        <Text style={styles.optionText}>Sí</Text>
        <View style={styles.checkboxWrapper}>
          <CheckboxPdf checked={!varicocele} />
        </View>
        <Text style={styles.optionText}>No</Text>
      </View>
      {varicoceleObs.trim() !== "" && (
        <View style={styles.obsInlineRow}>
          <Text style={styles.label} />
          <Text style={styles.obsInlineText}>{varicoceleObs}</Text>
        </View>
      )}

      {/* F.U.M | Embarazos | Partos | Cesárea */}
      <View style={styles.rowFour}>
        <View style={[styles.cell, styles.cellMargin]}>
          <Text style={styles.cellLabel}>Fecha F.U.M:</Text>
          <Text style={styles.cellValue}>{fum || "-"}</Text>
        </View>
        <View style={[styles.cell, styles.cellMargin]}>
          <Text style={styles.cellLabel}>Embarazos:</Text>
          <Text style={styles.cellValue}>{embarazos || "-"}</Text>
        </View>
        <View style={[styles.cell, styles.cellMargin]}>
          <Text style={styles.cellLabel}>Partos:</Text>
          <Text style={styles.cellValue}>{partos || "-"}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Cesárea:</Text>
          <Text style={styles.cellValue}>{cesarea || "-"}</Text>
        </View>
      </View>
    </View>
  );
}
