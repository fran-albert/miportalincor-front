import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import { Patient } from "@/types/Patient/Patient";
import { formatDni, calculateAge, formatDoctorName } from "@/common/helpers/helpers";
import { formatEvolutionDateTime } from "@/common/helpers/evolutionHelpers";
import { EvolutionTableRow } from "../Table/columns";

const styles = StyleSheet.create({
  page: {
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Header
  headerContainer: {
    position: "absolute",
    top: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#2d5a4e",
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 43,
  },
  headerInfo: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2d5a4e",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#666666",
  },
  // Title
  documentTitle: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#2d5a4e",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Patient Info Section
  patientInfoContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  patientInfoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  patientInfoRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  patientInfoItem: {
    flexDirection: "row",
    marginRight: 20,
    marginBottom: 4,
  },
  patientInfoLabel: {
    fontSize: 9,
    color: "#666666",
    marginRight: 4,
  },
  patientInfoValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1f2937",
  },
  // Evolution Card
  evolutionContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#2d5a4e",
  },
  evolutionHeader: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  evolutionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  evolutionDate: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2d5a4e",
  },
  evolutionDoctor: {
    fontSize: 9,
    color: "#666666",
  },
  evolutionContent: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 8,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.4,
    marginBottom: 6,
  },
  // Mediciones
  medicionesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  medicionBadge: {
    backgroundColor: "#f3f4f6",
    padding: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 4,
    marginBottom: 4,
  },
  medicionText: {
    fontSize: 8,
    color: "#374151",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#888888",
  },
  pageNumber: {
    fontSize: 8,
    color: "#888888",
  },
  // Empty state
  emptyState: {
    textAlign: "center",
    fontSize: 12,
    color: "#666666",
    marginTop: 50,
    padding: 20,
  },
});

interface EvolucionesPdfDocumentProps {
  patient: Patient;
  evoluciones: EvolutionTableRow[];
  generatedDate: Date;
  logoSrc?: string;
}

// Capitalizar texto
const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

export function EvolucionesPdfDocument({
  patient,
  evoluciones,
  generatedDate,
  logoSrc,
}: EvolucionesPdfDocumentProps) {
  // Ordenar evoluciones por fecha (más reciente primero)
  const sortedEvoluciones = [...evoluciones].sort(
    (a, b) =>
      new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime()
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.headerContainer} fixed>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>INCOR Centro Médico</Text>
            <Text style={styles.headerSubtitle}>
              Historia Clínica - Evoluciones
            </Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>Evoluciones Médicas</Text>

        {/* Patient Information */}
        <View style={styles.patientInfoContainer}>
          <Text style={styles.patientInfoTitle}>Datos del Paciente</Text>
          <View style={styles.patientInfoRow}>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Nombre:</Text>
              <Text style={styles.patientInfoValue}>
                {capitalize(patient.firstName)} {capitalize(patient.lastName)}
              </Text>
            </View>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>DNI:</Text>
              <Text style={styles.patientInfoValue}>
                {formatDni(patient.dni)}
              </Text>
            </View>
          </View>
          <View style={styles.patientInfoRow}>
            <View style={styles.patientInfoItem}>
              <Text style={styles.patientInfoLabel}>Edad:</Text>
              <Text style={styles.patientInfoValue}>
                {calculateAge(String(patient.birthDate))} años
              </Text>
            </View>
            {patient.gender && (
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Género:</Text>
                <Text style={styles.patientInfoValue}>{patient.gender}</Text>
              </View>
            )}
            {patient.bloodType &&
              patient.rhFactor &&
              patient.bloodType !== "null" &&
              patient.rhFactor !== "null" && (
                <View style={styles.patientInfoItem}>
                  <Text style={styles.patientInfoLabel}>Grupo Sanguíneo:</Text>
                  <Text style={styles.patientInfoValue}>
                    {patient.bloodType} {patient.rhFactor}
                  </Text>
                </View>
              )}
          </View>
          <View style={styles.patientInfoRow}>
            {patient.healthPlans?.[0]?.healthInsurance && (
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Obra Social:</Text>
                <Text style={styles.patientInfoValue}>
                  {patient.healthPlans[0].healthInsurance.name}
                </Text>
              </View>
            )}
            {patient.affiliationNumber && (
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>N° Afiliado:</Text>
                <Text style={styles.patientInfoValue}>
                  {patient.affiliationNumber}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        {sortedEvoluciones.length === 0 ? (
          <Text style={styles.emptyState}>
            No hay evoluciones médicas registradas para este paciente.
          </Text>
        ) : (
          sortedEvoluciones.map((evolution) => {
            const dateTime = formatEvolutionDateTime(evolution.fechaConsulta);
            return (
              <View key={evolution.id} style={styles.evolutionContainer} wrap={false}>
                <View style={styles.evolutionHeader}>
                  <View style={styles.evolutionHeaderRow}>
                    <Text style={styles.evolutionDate}>
                      {dateTime.date} - {dateTime.time}
                    </Text>
                    <Text style={styles.evolutionDoctor}>
                      {formatDoctorName(evolution.doctor)}
                      {evolution.doctor.specialities?.[0] &&
                        ` - ${evolution.doctor.specialities[0].name}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.evolutionContent}>
                  {evolution.motivoConsulta && (
                    <>
                      <Text style={styles.sectionTitle}>Motivo de Consulta</Text>
                      <Text style={styles.sectionContent}>
                        {evolution.motivoConsulta}
                      </Text>
                    </>
                  )}

                  {evolution.enfermedadActual && (
                    <>
                      <Text style={styles.sectionTitle}>Enfermedad Actual</Text>
                      <Text style={styles.sectionContent}>
                        {evolution.enfermedadActual}
                      </Text>
                    </>
                  )}

                  {evolution.examenFisico && (
                    <>
                      <Text style={styles.sectionTitle}>Examen Físico</Text>
                      <Text style={styles.sectionContent}>
                        {evolution.examenFisico}
                      </Text>
                    </>
                  )}

                  {evolution.diagnosticosPresuntivos && (
                    <>
                      <Text style={styles.sectionTitle}>Diagnósticos Presuntivos</Text>
                      <Text style={styles.sectionContent}>
                        {evolution.diagnosticosPresuntivos}
                      </Text>
                    </>
                  )}

                  {evolution.evolucionCompleta?.mediciones &&
                    evolution.evolucionCompleta.mediciones.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>
                          Mediciones ({evolution.evolucionCompleta.mediciones.length})
                        </Text>
                        <View style={styles.medicionesContainer}>
                          {evolution.evolucionCompleta.mediciones.map(
                            (medicion, index) => (
                              <View key={index} style={styles.medicionBadge}>
                                <Text style={styles.medicionText}>
                                  {medicion.dataType.name}: {medicion.value}
                                  {medicion.observaciones &&
                                    ` (${medicion.observaciones})`}
                                </Text>
                              </View>
                            )
                          )}
                        </View>
                      </>
                    )}
                </View>
              </View>
            );
          })
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
