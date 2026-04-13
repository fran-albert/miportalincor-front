import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  ProgramFollowUpSummaryContent,
  ProgramMonthlySummaryMetricsSnapshot,
} from "@/types/Program/ProgramFollowUp";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 32,
    fontSize: 10,
    color: "#111827",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 2,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
  },
  metricLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bodyText: {
    lineHeight: 1.5,
    color: "#1f2937",
  },
  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerRow: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    flexGrow: 1,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 9,
    color: "#6b7280",
  },
});

interface MonthlySummaryPdfDocumentProps {
  patientName: string;
  programName: string;
  periodLabel: string;
  title: string;
  summaryContent: ProgramFollowUpSummaryContent;
  snapshot: ProgramMonthlySummaryMetricsSnapshot;
}

const formatWeight = (value?: number) =>
  value === undefined ? "-" : `${value.toFixed(1)} kg`;

export function MonthlySummaryPdfDocument({
  patientName,
  programName,
  periodLabel,
  title,
  summaryContent,
  snapshot,
}: MonthlySummaryPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Paciente: {patientName}</Text>
          <Text style={styles.subtitle}>Programa: {programName}</Text>
          <Text style={styles.subtitle}>Período: {periodLabel}</Text>
          <Text style={styles.subtitle}>
            Generado: {new Date().toLocaleDateString("es-AR")}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Cumplimiento global</Text>
            <Text style={styles.metricValue}>
              {snapshot.globalCompliance.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Esperado / realizado</Text>
            <Text style={styles.metricValue}>
              {snapshot.totalAttended}/{snapshot.totalExpected}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Registros de asistencia</Text>
            <Text style={styles.metricValue}>{snapshot.totalRecords}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Situación general</Text>
          <Text style={styles.bodyText}>{summaryContent.situation}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolución observada</Text>
          <Text style={styles.bodyText}>{summaryContent.evolution}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivo próximo mes</Text>
          <Text style={styles.bodyText}>{summaryContent.nextObjective}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle por actividad</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, { flexBasis: "40%" }]}>Actividad</Text>
              <Text style={[styles.cell, { flexBasis: "20%" }]}>Esperado</Text>
              <Text style={[styles.cell, { flexBasis: "20%" }]}>Realizado</Text>
              <Text style={[styles.cell, { flexBasis: "20%" }]}>Cumplimiento</Text>
            </View>
            {snapshot.activities.map((activity) => (
              <View style={styles.row} key={activity.activityId}>
                <Text style={[styles.cell, { flexBasis: "40%" }]}>
                  {activity.activityName}
                </Text>
                <Text style={[styles.cell, { flexBasis: "20%" }]}>
                  {activity.expected}
                </Text>
                <Text style={[styles.cell, { flexBasis: "20%" }]}>
                  {activity.attended}
                </Text>
                <Text style={[styles.cell, { flexBasis: "20%" }]}>
                  {activity.compliance.toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {snapshot.nutrition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolución de peso</Text>
            <View style={styles.grid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Peso inicial</Text>
                <Text style={styles.metricValue}>
                  {formatWeight(snapshot.nutrition.firstWeight)}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Peso final</Text>
                <Text style={styles.metricValue}>
                  {formatWeight(snapshot.nutrition.lastWeight)}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Delta</Text>
                <Text style={styles.metricValue}>
                  {formatWeight(snapshot.nutrition.deltaWeight)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
