import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./styles";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { Patient } from "@/types/Patient/Patient";
import { formatDateArgentina, formatDni, calculateAge, formatDoctorName } from "@/common/helpers/helpers";

interface MedicacionActualPdfDocumentProps {
  patient: Patient;
  medicacionActual: MedicacionActual | null;
  historialMedicaciones: MedicacionActual[];
  generatedDate: Date;
  logoSrc?: string;
}

// Capitalizar texto
const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

export function MedicacionActualPdfDocument({
  patient,
  medicacionActual,
  historialMedicaciones,
  generatedDate,
  logoSrc,
}: MedicacionActualPdfDocumentProps) {
  const hasMedicacion = medicacionActual || historialMedicaciones.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.headerContainer} fixed>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>INCOR Centro Médico</Text>
            <Text style={styles.headerSubtitle}>
              Historia Clínica - Medicación
            </Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>Medicación Actual</Text>

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
        {!hasMedicacion ? (
          <Text style={styles.emptyState}>
            No hay medicación registrada para este paciente.
          </Text>
        ) : (
          <>
            {/* Medicación Actual */}
            {medicacionActual && (
              <>
                <Text style={styles.sectionTitle}>Medicación Actual</Text>
                <View style={styles.medicationCard}>
                  {medicacionActual.medicationName && (
                    <Text style={styles.medicationName}>
                      {medicacionActual.medicationName}
                    </Text>
                  )}
                  <View style={styles.medicationRow}>
                    {medicacionActual.dosage && (
                      <View style={styles.medicationItem}>
                        <Text style={styles.medicationLabel}>Dosis:</Text>
                        <Text style={styles.medicationValue}>
                          {medicacionActual.dosage}
                        </Text>
                      </View>
                    )}
                    {medicacionActual.frequency && (
                      <View style={styles.medicationItem}>
                        <Text style={styles.medicationLabel}>Frecuencia:</Text>
                        <Text style={styles.medicationValue}>
                          {medicacionActual.frequency}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.medicationRow}>
                    <View style={styles.medicationItem}>
                      <Text style={styles.medicationLabel}>Fecha Inicio:</Text>
                      <Text style={styles.medicationValue}>
                        {formatDateArgentina(medicacionActual.startDate)}
                      </Text>
                    </View>
                    {medicacionActual.doctor && (
                      <View style={styles.medicationItem}>
                        <Text style={styles.medicationLabel}>Médico:</Text>
                        <Text style={styles.medicationValue}>
                          {formatDoctorName(medicacionActual.doctor)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {medicacionActual.observations && (
                    <Text style={styles.medicationObservations}>
                      Observaciones: {medicacionActual.observations}
                    </Text>
                  )}
                </View>
              </>
            )}

            {/* Historial de Medicaciones */}
            {historialMedicaciones.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Historial de Medicaciones ({historialMedicaciones.length})
                </Text>
                {historialMedicaciones.map((medication) => (
                  <View key={medication.id} style={styles.medicationCardSuspended}>
                    {medication.medicationName && (
                      <Text style={styles.medicationName}>
                        {medication.medicationName}
                      </Text>
                    )}
                    <View style={styles.medicationRow}>
                      {medication.dosage && (
                        <View style={styles.medicationItem}>
                          <Text style={styles.medicationLabel}>Dosis:</Text>
                          <Text style={styles.medicationValue}>
                            {medication.dosage}
                          </Text>
                        </View>
                      )}
                      {medication.frequency && (
                        <View style={styles.medicationItem}>
                          <Text style={styles.medicationLabel}>Frecuencia:</Text>
                          <Text style={styles.medicationValue}>
                            {medication.frequency}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.medicationRow}>
                      <View style={styles.medicationItem}>
                        <Text style={styles.medicationLabel}>Fecha Inicio:</Text>
                        <Text style={styles.medicationValue}>
                          {formatDateArgentina(medication.startDate)}
                        </Text>
                      </View>
                      {medication.doctor && (
                        <View style={styles.medicationItem}>
                          <Text style={styles.medicationLabel}>Médico:</Text>
                          <Text style={styles.medicationValue}>
                            {formatDoctorName(medication.doctor)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {medication.observations && (
                      <Text style={styles.medicationObservations}>
                        Observaciones: {medication.observations}
                      </Text>
                    )}
                    {medication.suspensionDate && (
                      <View style={styles.suspensionInfo}>
                        <Text style={styles.suspensionTitle}>
                          Suspendida el {formatDateArgentina(medication.suspensionDate)}
                        </Text>
                        {medication.suspensionReason && (
                          <Text style={styles.suspensionText}>
                            Motivo: {medication.suspensionReason}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </>
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
