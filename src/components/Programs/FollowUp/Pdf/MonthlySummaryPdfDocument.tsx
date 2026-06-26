import {
  Document,
  Image,
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
    paddingTop: 28,
    paddingBottom: 34,
    paddingHorizontal: 30,
    fontSize: 10,
    color: "#163243",
    backgroundColor: "#ffffff",
  },
  headerShell: {
    marginBottom: 22,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D8E7EC",
    paddingBottom: 12,
    marginBottom: 16,
  },
  logo: {
    width: 162,
    height: 52,
    objectFit: "contain",
  },
  pill: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#E9F7FA",
    fontSize: 9,
    color: "#0F6B7B",
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#163243",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#4F6B78",
    lineHeight: 1.5,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  infoCard: {
    width: "48%",
    borderRadius: 10,
    backgroundColor: "#F8FBFC",
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6A8793",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 11,
    color: "#163243",
    fontWeight: "bold",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flexGrow: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F5FBFC",
  },
  metricCardPrimary: {
    backgroundColor: "#EAF7FA",
  },
  metricLabel: {
    fontSize: 8,
    color: "#6A8793",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#163243",
    marginBottom: 2,
  },
  metricHelp: {
    fontSize: 9,
    color: "#5B7580",
  },
  section: {
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 12,
    backgroundColor: "#F8FBFC",
    padding: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F6B7B",
    marginBottom: 8,
  },
  bodyText: {
    lineHeight: 1.6,
    color: "#223C48",
    fontSize: 10,
  },
  tableTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F6B7B",
    marginBottom: 8,
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: "#D7E9ED",
    borderBottomWidth: 1,
    borderBottomColor: "#D7E9ED",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E6F0F3",
  },
  headerRow: {
    backgroundColor: "#EEF8FA",
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 7,
    flexGrow: 1,
    fontSize: 9,
    color: "#223C48",
  },
  headerCell: {
    fontWeight: "bold",
    color: "#35515D",
  },
  weightGrid: {
    flexDirection: "row",
    gap: 10,
  },
  weightCard: {
    flexGrow: 1,
    borderRadius: 10,
    backgroundColor: "#F5FBFC",
    padding: 12,
  },
  weightLabel: {
    fontSize: 8,
    color: "#6A8793",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  weightValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#163243",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#78919B",
  },
});

interface MonthlySummaryPdfDocumentProps {
  patientName: string;
  programName: string;
  periodLabel: string;
  title: string;
  summaryContent: ProgramFollowUpSummaryContent;
  snapshot: ProgramMonthlySummaryMetricsSnapshot;
  logoSrc?: string;
  generatedDateLabel?: string;
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
  logoSrc,
  generatedDateLabel,
}: MonthlySummaryPdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerShell}>
          <View style={styles.headerTop}>
            {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View />}
            <Text style={styles.pill}>Resumen de seguimiento</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Informe mensual del programa con resumen clínico y evolución del período.
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Paciente</Text>
              <Text style={styles.infoValue}>{patientName}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Programa</Text>
              <Text style={styles.infoValue}>{programName}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Período</Text>
              <Text style={styles.infoValue}>{periodLabel}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>
                {generatedDateLabel || new Date().toLocaleDateString("es-AR")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardPrimary]}>
            <Text style={styles.metricLabel}>Cumplimiento global</Text>
            <Text style={styles.metricValue}>
              {snapshot.globalCompliance.toFixed(1)}%
            </Text>
            <Text style={styles.metricHelp}>Del total esperado para el período</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Esperado / realizado</Text>
            <Text style={styles.metricValue}>
              {snapshot.totalAttended}/{snapshot.totalExpected}
            </Text>
            <Text style={styles.metricHelp}>Actividades registradas</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Registros</Text>
            <Text style={styles.metricValue}>{snapshot.totalRecords}</Text>
            <Text style={styles.metricHelp}>Asistencias cargadas en el mes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Situación general</Text>
            <Text style={styles.bodyText}>{summaryContent.situation}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Evolución observada</Text>
            <Text style={styles.bodyText}>{summaryContent.evolution}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Objetivo próximo mes</Text>
            <Text style={styles.bodyText}>{summaryContent.nextObjective}</Text>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.tableTitle}>Detalle por actividad</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell, { flexBasis: "40%" }]}>
                Actividad
              </Text>
              <Text style={[styles.cell, styles.headerCell, { flexBasis: "20%" }]}>
                Esperado
              </Text>
              <Text style={[styles.cell, styles.headerCell, { flexBasis: "20%" }]}>
                Realizado
              </Text>
              <Text style={[styles.cell, styles.headerCell, { flexBasis: "20%" }]}>
                Cumplimiento
              </Text>
            </View>
            {snapshot.activities.map((activity, index) => (
              <View
                style={
                  index === snapshot.activities.length - 1
                    ? [styles.row, { borderBottomWidth: 0 }]
                    : styles.row
                }
                key={activity.activityId}
              >
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
          <View style={styles.section} wrap={false}>
            <Text style={styles.tableTitle}>Evolución de peso</Text>
            <View style={styles.weightGrid}>
              <View style={styles.weightCard}>
                <Text style={styles.weightLabel}>Peso inicial</Text>
                <Text style={styles.weightValue}>
                  {formatWeight(snapshot.nutrition.firstWeight)}
                </Text>
              </View>
              <View style={styles.weightCard}>
                <Text style={styles.weightLabel}>Peso final</Text>
                <Text style={styles.weightValue}>
                  {formatWeight(snapshot.nutrition.lastWeight)}
                </Text>
              </View>
              <View style={styles.weightCard}>
                <Text style={styles.weightLabel}>Cambio del mes</Text>
                <Text style={styles.weightValue}>
                  {formatWeight(snapshot.nutrition.deltaWeight)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `INCOR Centro Médico · Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
