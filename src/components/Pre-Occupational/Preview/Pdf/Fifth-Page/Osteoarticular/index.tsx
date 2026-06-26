import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

interface OsteoarticularPdfProps {
  mmssSin?: boolean;
  mmssObs?: string;
  mmiiSin?: boolean;
  mmiiObs?: string;
  columnaSin?: boolean;
  columnaObs?: string;
  amputaciones?: boolean;
  amputacionesObs?: string;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 6,
  },
  headerWrap: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    color: pdfColors.accentText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  body: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 8,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  value: {
    fontSize: 9.4,
    color: pdfColors.ink,
    fontWeight: "bold",
  },
});

export default function OsteoarticularPdf({
  mmssSin,
  mmssObs,
  mmiiSin,
  mmiiObs,
  columnaSin,
  columnaObs,
  amputaciones,
  amputacionesObs,
}: OsteoarticularPdfProps) {
  // Verificar si hay algún dato para mostrar
  const hasAnyData = mmssSin !== undefined ||
    mmiiSin !== undefined ||
    columnaSin !== undefined ||
    amputaciones !== undefined;

  if (!hasAnyData) return null;

  const items = [
    mmssSin !== undefined
      ? {
          label: "MMSS",
          value: `${mmssSin ? "Sin alteraciones" : "Con hallazgos"}${mmssObs?.trim() ? ` · ${mmssObs}` : ""}`,
        }
      : null,
    mmiiSin !== undefined
      ? {
          label: "MMII",
          value: `${mmiiSin ? "Sin alteraciones" : "Con hallazgos"}${mmiiObs?.trim() ? ` · ${mmiiObs}` : ""}`,
        }
      : null,
    columnaSin !== undefined
      ? {
          label: "Columna",
          value: `${columnaSin ? "Sin alteraciones" : "Con hallazgos"}${columnaObs?.trim() ? ` · ${columnaObs}` : ""}`,
        }
      : null,
    amputaciones !== undefined
      ? {
          label: "Amputaciones",
          value: `${amputaciones ? "Sí" : "No"}${amputacionesObs?.trim() ? ` · ${amputacionesObs}` : ""}`,
        }
      : null,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Aparato osteoarticular</Text>
      </View>
      <View style={styles.body}>
        {items.map((item) => (
          <View key={item!.label} style={styles.statusCard}>
            <Text style={styles.label}>{item!.label}</Text>
            <Text style={styles.value}>{item!.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
