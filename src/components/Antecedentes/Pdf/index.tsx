import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "./styles";
import { Antecedente } from "@/types/Antecedentes/Antecedentes";
import { Patient } from "@/types/Patient/Patient";
import { formatDate, formatDni, calculateAge, formatDoctorName } from "@/common/helpers/helpers";

interface AntecedentesPdfDocumentProps {
  patient: Patient;
  antecedentes: Antecedente[];
  generatedDate: Date;
  logoSrc?: string;
}

interface GroupedAntecedentes {
  category: string;
  items: Antecedente[];
}

// Agrupar antecedentes por categoría y ordenar por fecha
const groupAntecedentesByCategory = (
  antecedentes: Antecedente[]
): GroupedAntecedentes[] => {
  const grouped: Record<string, Antecedente[]> = {};

  antecedentes.forEach((ant) => {
    const category = ant.dataType.name;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(ant);
  });

  // Ordenar items dentro de cada categoría por fecha (más reciente primero)
  Object.keys(grouped).forEach((category) => {
    grouped[category].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Convertir a array y ordenar categorías alfabéticamente
  return Object.entries(grouped)
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => a.category.localeCompare(b.category));
};

// Capitalizar texto
const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

export function AntecedentesPdfDocument({
  patient,
  antecedentes,
  generatedDate,
  logoSrc,
}: AntecedentesPdfDocumentProps) {
  const groupedAntecedentes = groupAntecedentesByCategory(antecedentes);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.headerContainer} fixed>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>INCOR Centro Médico</Text>
            <Text style={styles.headerSubtitle}>
              Historia Clínica - Antecedentes
            </Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>Antecedentes Médicos</Text>

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

        {/* Antecedentes Content */}
        {antecedentes.length === 0 ? (
          <Text style={styles.emptyState}>
            No hay antecedentes médicos registrados para este paciente.
          </Text>
        ) : (
          groupedAntecedentes.map((group) => (
            <View key={group.category} style={styles.categoryContainer} wrap={false}>
              <Text style={styles.categoryTitle}>
                <Text style={styles.categoryBullet}>▸</Text> {group.category.toUpperCase()}
              </Text>
              {group.items.map((ant) => (
                <View key={ant.id} style={styles.antecedenteItem}>
                  <Text style={styles.antecedenteValue}>• {ant.value}</Text>
                  {ant.observaciones && (
                    <Text style={styles.antecedenteObservacion}>
                      Obs: {ant.observaciones}
                    </Text>
                  )}
                  <View style={styles.antecedenteMeta}>
                    <Text style={styles.antecedenteDoctor}>
                      {formatDoctorName(ant.doctor)}
                    </Text>
                    <Text style={styles.antecedenteDate}>
                      {formatDate(ant.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
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
