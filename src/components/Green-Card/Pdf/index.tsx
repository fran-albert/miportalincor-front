import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./styles";
import { GreenCard } from "@/types/Green-Card/GreenCard";
import { formatDni } from "@/common/helpers/helpers";

interface GreenCardPdfDocumentProps {
  greenCard: GreenCard;
  generatedDate: Date;
  logoSrc?: string;
}

// Capitalizar texto
const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

// Orden de horarios para ordenar la tabla
const SCHEDULE_ORDER = [
  "Ayuno",
  "Desayuno",
  "Media mañana",
  "Almuerzo",
  "Merienda",
  "Cena",
  "Antes de dormir",
];

const getScheduleOrder = (schedule: string) => {
  const index = SCHEDULE_ORDER.findIndex(
    (s) => s.toLowerCase() === schedule.toLowerCase()
  );
  if (index !== -1) return index;
  // For time-based schedules, sort by time
  if (/^\d{2}:\d{2}$/.test(schedule)) {
    return 100 + parseInt(schedule.split(":")[0]);
  }
  return 200;
};

export function GreenCardPdfDocument({
  greenCard,
  generatedDate,
  logoSrc,
}: GreenCardPdfDocumentProps) {
  const activeItems = greenCard.items
    .filter((item) => item.isActive)
    .sort((a, b) => getScheduleOrder(a.schedule) - getScheduleOrder(b.schedule));

  const suspendedItems = greenCard.items.filter((item) => !item.isActive);
  const hasItems = greenCard.items.length > 0;

  // Minimum rows to fill the table
  const minRows = 6;
  const emptyRowsCount = Math.max(0, minRows - activeItems.length);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Green Card Container - mimics the physical card */}
        <View style={styles.cardContainer}>
          {/* Header - Centered Logo */}
          <View style={styles.headerContainer}>
            {logoSrc && (
              <View style={styles.logoContainer}>
                <Image src={logoSrc} style={styles.logo} />
              </View>
            )}
            <Text style={styles.headerTitle}>incor</Text>
            <Text style={styles.headerSubtitle}>Cardiología y Prevención</Text>
          </View>

          {/* Patient Info */}
          {greenCard.patient && (
            <View style={styles.patientInfoContainer}>
              <View style={styles.patientInfoRow}>
                <View style={styles.patientInfoItem}>
                  <Text style={styles.patientInfoLabel}>Paciente:</Text>
                  <Text style={styles.patientInfoValue}>
                    {capitalize(greenCard.patient.firstName)} {capitalize(greenCard.patient.lastName)}
                  </Text>
                </View>
                <View style={styles.patientInfoItem}>
                  <Text style={styles.patientInfoLabel}>DNI:</Text>
                  <Text style={styles.patientInfoValue}>
                    {formatDni(greenCard.patient.userName)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Medications Table */}
          {!hasItems ? (
            <Text style={styles.emptyState}>
              No hay medicamentos registrados
            </Text>
          ) : (
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colSchedule]}>Hora</Text>
                <Text style={[styles.tableHeaderCell, styles.colMedication]}>Medicamento</Text>
                <Text style={[styles.tableHeaderCell, styles.colDosage]}>Dosis</Text>
                <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Cant.</Text>
              </View>

              {/* Active medications */}
              {activeItems.map((item, index) => (
                <View
                  key={item.id}
                  style={index === activeItems.length - 1 && emptyRowsCount === 0
                    ? styles.tableRowLast
                    : styles.tableRow
                  }
                >
                  <Text style={[styles.tableCell, styles.colSchedule]}>
                    {item.schedule}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colMedication]}>
                    {item.medicationName}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDosage]}>
                    {item.dosage}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQuantity]}>
                    {item.quantity || "-"}
                  </Text>
                </View>
              ))}

              {/* Empty rows to fill the table */}
              {Array.from({ length: emptyRowsCount }).map((_, i) => (
                <View
                  key={`empty-${i}`}
                  style={i === emptyRowsCount - 1 ? styles.tableRowLast : styles.emptyRow}
                >
                  <View style={[styles.emptyCell, styles.colSchedule]} />
                  <View style={[styles.emptyCell, styles.colMedication]} />
                  <View style={[styles.emptyCell, styles.colDosage]} />
                  <View style={[styles.emptyCell, styles.colQuantity]} />
                </View>
              ))}
            </View>
          )}

          {/* Suspended medications */}
          {suspendedItems.length > 0 && (
            <View style={styles.suspendedSection}>
              <Text style={styles.suspendedTitle}>Suspendidos:</Text>
              {suspendedItems.map((item) => (
                <Text key={item.id} style={styles.suspendedItem}>
                  {item.medicationName} - {item.dosage}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Stats below the card */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeItems.length}</Text>
            <Text style={styles.statLabel}>
              medicamento{activeItems.length !== 1 ? "s" : ""} activo{activeItems.length !== 1 ? "s" : ""}
            </Text>
          </View>
          {suspendedItems.length > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#D97706" }]}>
                {suspendedItems.length}
              </Text>
              <Text style={styles.statLabel}>
                suspendido{suspendedItems.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generado el:{" "}
            {generatedDate.toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
