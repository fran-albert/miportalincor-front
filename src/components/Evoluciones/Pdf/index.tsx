import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { EvolutionTableRow } from "../Table/columns";
import { formatEvolutionDateTime } from "@/common/helpers/evolutionHelpers";
import { formatDoctorInfo } from "@/common/helpers/helpers";
import { EvolucionData } from "@/types/Antecedentes/Antecedentes";

const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 139,
    height: 50
  },
  patientInfo: {
    flexDirection: "column",
    justifyContent: "center"
  },
  headerTitle: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "bold"
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    fontWeight: "bold",
    color: '#2d5a4e',
  },
  evolutionContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
  },
  evolutionHeader: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  evolutionContent: {
    padding: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2d5a4e',
  },
  doctorInfo: {
    fontSize: 10,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'justify',
  },
  medicionesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  medicionBadge: {
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  medicionText: {
    fontSize: 9,
    color: '#374151',
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: '#666',
  },
  noContentText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 50,
  }
});

export function EvolutionPdfDocument({
  evolution,
  patientName,
  patientSurname,
  logoSrc,
}: {
  evolution: EvolutionTableRow;
  patientName: string;
  patientSurname: string;
  logoSrc?: string;
}) {
  // Capitaliza la primera letra de cada palabra
  const capitalize = (text: string) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  const doctorInfo = formatDoctorInfo(evolution.doctor);
  const dateTime = formatEvolutionDateTime(evolution.fechaConsulta);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Encabezado */}
        <View style={styles.headerContainer} fixed>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <View style={styles.patientInfo}>
            <Text style={styles.headerTitle}>
              {capitalize(patientName)} {capitalize(patientSurname)}
            </Text>
            <Text>Fecha de impresión: {new Date().toLocaleDateString("es-AR")}</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title} fixed>
          Evolución Médica
        </Text>

        {/* Contenido de la evolución */}
        <View style={styles.evolutionContainer}>
          <View style={styles.evolutionHeader}>
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTime}>
                {dateTime.date} - {dateTime.time}
              </Text>
              <Text style={styles.doctorInfo}>
                {doctorInfo.fullNameWithPrimarySpeciality}
              </Text>
            </View>
          </View>

          <View style={styles.evolutionContent}>
            {/* Motivo de Consulta */}
            {evolution.motivoConsulta && (
              <>
                <Text style={styles.sectionTitle}>Motivo de Consulta</Text>
                <Text style={styles.sectionContent}>
                  {evolution.motivoConsulta}
                </Text>
              </>
            )}

            {/* Enfermedad Actual */}
            {evolution.enfermedadActual && (
              <>
                <Text style={styles.sectionTitle}>Enfermedad Actual</Text>
                <Text style={styles.sectionContent}>
                  {evolution.enfermedadActual}
                </Text>
              </>
            )}

            {/* Examen Físico */}
            {evolution.examenFisico && (
              <>
                <Text style={styles.sectionTitle}>Examen Físico</Text>
                <Text style={styles.sectionContent}>
                  {evolution.examenFisico}
                </Text>
              </>
            )}

            {/* Diagnósticos Presuntivos */}
            {evolution.diagnosticosPresuntivos && (
              <>
                <Text style={styles.sectionTitle}>Diagnósticos Presuntivos</Text>
                <Text style={styles.sectionContent}>
                  {evolution.diagnosticosPresuntivos}
                </Text>
              </>
            )}

            {/* Mediciones */}
            {evolution.evolucionCompleta?.mediciones && evolution.evolucionCompleta.mediciones.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Mediciones y Parámetros Vitales ({evolution.evolucionCompleta.mediciones.length})
                </Text>
                <View style={styles.medicionesContainer}>
                  {evolution.evolucionCompleta.mediciones.map((medicion: EvolucionData, index: number) => (
                    <View key={index} style={styles.medicionBadge}>
                      <Text style={styles.medicionText}>
                        {medicion.dataType.name}: {medicion.value}
                        {medicion.observaciones && ` (${medicion.observaciones})`}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Especialidad */}
            {evolution.evolucionCompleta?.especialidad && (
              <>
                <Text style={styles.sectionTitle}>Especialidad</Text>
                <Text style={styles.sectionContent}>
                  {evolution.evolucionCompleta.especialidad}
                </Text>
              </>
            )}

            {/* Mensaje si no hay contenido */}
            {!evolution.motivoConsulta &&
             !evolution.enfermedadActual &&
             !evolution.examenFisico &&
             !evolution.diagnosticosPresuntivos &&
             (!evolution.evolucionCompleta?.mediciones || evolution.evolucionCompleta.mediciones.length === 0) && (
              <Text style={styles.noContentText}>
                No hay contenido registrado para esta evolución
              </Text>
            )}
          </View>
        </View>

        {/* Información adicional */}
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e5e5' }}>
          <Text style={{ fontSize: 9, color: '#666', textAlign: 'center' }}>
            Fecha de creación: {new Date(evolution.fechaCreacion).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </Text>
        </View>

        {/* Pie de página */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages} - Evolución Médica - ${capitalize(patientName)} ${capitalize(patientSurname)}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}