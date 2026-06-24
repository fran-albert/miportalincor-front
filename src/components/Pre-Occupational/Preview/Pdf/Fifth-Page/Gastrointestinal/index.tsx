// src/components/pdf/GastrointestinalPdf.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors } from "../../shared";

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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
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
    paddingVertical: 6,
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

  const items = [
    sinAlteraciones !== undefined
      ? { label: "Sin alteraciones", value: sinAlteraciones ? "Sí" : "No" }
      : null,
    cicatrices !== undefined
      ? {
          label: "Cicatrices",
          value: `${cicatrices ? "Sí" : "No"}${cicatricesObs?.trim() ? ` · ${cicatricesObs}` : ""}`,
        }
      : null,
    hernias !== undefined
      ? {
          label: "Hernias",
          value: `${hernias ? "Sí" : "No"}${herniasObs?.trim() ? ` · ${herniasObs}` : ""}`,
        }
      : null,
    eventraciones !== undefined
      ? {
          label: "Eventraciones",
          value: `${eventraciones ? "Sí" : "No"}${eventracionesObs?.trim() ? ` · ${eventracionesObs}` : ""}`,
        }
      : null,
    hemorroides !== undefined
      ? {
          label: "Hemorroides",
          value: `${hemorroides ? "Sí" : "No"}${hemorroidesObs?.trim() ? ` · ${hemorroidesObs}` : ""}`,
        }
      : null,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Aparato gastrointestinal</Text>
      </View>
      <View style={styles.body}>
        {items.map((item) => (
          <View key={item!.label} style={styles.statusCard}>
            <Text style={styles.label}>{item!.label}</Text>
            <Text style={styles.value}>{item!.value}</Text>
          </View>
        ))}

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
