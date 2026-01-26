import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./styles";
import { GreenCard, GreenCardItem } from "@/types/Green-Card/GreenCard";
import { formatDni } from "@/common/helpers/helpers";

interface GreenCardPdfDocumentProps {
  greenCard: GreenCard;
  generatedDate: Date;
  logoSrc?: string;
}

// Capitalizar texto
const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

// Get doctor name from item
const getDoctorName = (item: GreenCardItem) => {
  if (!item.doctor) return "Médico";
  const prefix = item.doctor.gender === "Femenino" ? "Dra." : "Dr.";
  return `${prefix} ${item.doctor.firstName} ${item.doctor.lastName}`;
};

// Agrupar medicamentos por horario
const groupBySchedule = (items: GreenCardItem[]) => {
  const groups: Record<string, GreenCardItem[]> = {};

  // Orden preferido de horarios
  const scheduleOrder = [
    "Ayuno",
    "Desayuno",
    "08:00",
    "10:00",
    "12:00",
    "Almuerzo",
    "14:00",
    "16:00",
    "18:00",
    "Merienda",
    "20:00",
    "Cena",
    "22:00",
    "Antes de dormir",
  ];

  items.forEach((item) => {
    if (!groups[item.schedule]) {
      groups[item.schedule] = [];
    }
    groups[item.schedule].push(item);
  });

  // Ordenar por el orden preferido
  const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
    const indexA = scheduleOrder.indexOf(a);
    const indexB = scheduleOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return sortedEntries;
};

export function GreenCardPdfDocument({
  greenCard,
  generatedDate,
  logoSrc,
}: GreenCardPdfDocumentProps) {
  const activeItems = greenCard.items.filter((item) => item.isActive);
  const suspendedItems = greenCard.items.filter((item) => !item.isActive);
  const hasItems = greenCard.items.length > 0;

  const groupedActiveItems = groupBySchedule(activeItems);

  // Get unique doctors from items
  const uniqueDoctors = [...new Set(activeItems.map((item) => getDoctorName(item)))];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.headerContainer} fixed>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>INCOR Centro Médico</Text>
            <Text style={styles.headerSubtitle}>
              Cartón Verde - Medicación Habitual
            </Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>CARTONCITO VERDE</Text>

        {/* Patient Information */}
        {greenCard.patient && (
          <View style={styles.patientInfoContainer}>
            <Text style={styles.patientInfoTitle}>Datos del Paciente</Text>
            <View style={styles.patientInfoRow}>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Nombre:</Text>
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

        {/* Doctors Summary */}
        {uniqueDoctors.length > 0 && (
          <View style={styles.doctorInfoContainer}>
            <Text style={styles.doctorInfoTitle}>
              Médicos que indicaron medicación
            </Text>
            <Text style={styles.doctorInfoText}>
              {uniqueDoctors.join(" • ")}
            </Text>
          </View>
        )}

        {/* Content */}
        {!hasItems ? (
          <Text style={styles.emptyState}>
            No hay medicación registrada en este cartón.
          </Text>
        ) : (
          <>
            {/* Medicación Activa por Horario */}
            {groupedActiveItems.map(([schedule, items]) => (
              <View key={schedule} style={styles.scheduleSection} wrap={false}>
                <Text style={styles.scheduleTitle}>{schedule}</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.tableCellMedication]}>
                      Medicamento
                    </Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellDosage]}>
                      Dosis
                    </Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellQuantity]}>
                      Cantidad
                    </Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellDoctor]}>
                      Médico
                    </Text>
                  </View>
                  {items.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.tableCellMedication]}>
                        {item.medicationName}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellDosage]}>
                        {item.dosage}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellQuantity]}>
                        {item.quantity || "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellDoctor]}>
                        {getDoctorName(item)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Medicación Suspendida */}
            {suspendedItems.length > 0 && (
              <View style={styles.scheduleSection} wrap={false}>
                <Text style={[styles.scheduleTitle, { backgroundColor: "#fee2e2", color: "#dc2626" }]}>
                  Medicación Suspendida
                </Text>
                <View style={styles.table}>
                  <View style={[styles.tableHeader, { backgroundColor: "#dc2626" }]}>
                    <Text style={[styles.tableHeaderCell, styles.tableCellMedication]}>
                      Medicamento
                    </Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellDosage]}>
                      Dosis
                    </Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellQuantity]}>
                      Cantidad
                    </Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellDoctor]}>
                      Médico
                    </Text>
                  </View>
                  {suspendedItems.map((item) => (
                    <View key={item.id} style={styles.tableRowSuspended}>
                      <Text style={[styles.tableCell, styles.tableCellMedication]}>
                        {item.medicationName}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellDosage]}>
                        {item.dosage}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellQuantity]}>
                        {item.quantity || "-"}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellDoctor]}>
                        {getDoctorName(item)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

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
