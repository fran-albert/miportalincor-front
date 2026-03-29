import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Company } from "@/types/Company/Company";
import { DataValue } from "@/types/Data-Value/Data-Value";
import {
  formatAddress,
  formatCuilCuit,
  formatDni,
} from "@/common/helpers/helpers";
import { pdfColors } from "../shared";

interface CollaboratorInformationPdfProps {
  collaborator: Collaborator;
  companyData: Company;
  antecedentes: DataValue[] | undefined;
  showAntecedentes?: boolean;
  compactWorkerOnly?: boolean;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  topGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  section: {
    borderWidth: 1,
    borderColor: pdfColors.line,
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionHalf: {
    flex: 1,
  },
  compactSectionBody: {
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  compactGrid: {
    flexDirection: "row",
    gap: 8,
  },
  compactField: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: pdfColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 9.4,
    fontWeight: "bold",
    color: pdfColors.accentText,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  sectionBody: {
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  rowLast: {
    marginBottom: 0,
  },
  field: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 6.4,
    color: pdfColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.55,
    marginBottom: 2,
  },
  value: {
    fontSize: 8.1,
    color: pdfColors.ink,
    lineHeight: 1.25,
  },
  antecedentesBlock: {
    paddingTop: 1,
  },
  antecedentesItem: {
    fontSize: 8.2,
    color: pdfColors.ink,
    lineHeight: 1.25,
    marginBottom: 3,
  },
  emptyText: {
    fontSize: 8.2,
    color: pdfColors.muted,
  },
});

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

const normalizeDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const text = String(value).trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") {
    return "-";
  }

  return text;
};

const CollaboratorInformationPdf: React.FC<CollaboratorInformationPdfProps> = ({
  collaborator,
  companyData,
  antecedentes,
  showAntecedentes = true,
  compactWorkerOnly = false,
}) => {
  if (compactWorkerOnly) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajador</Text>
          </View>
          <View style={styles.compactSectionBody}>
            <View style={styles.compactGrid}>
              <View style={styles.compactField}>
                <InfoField
                  label="Apellido y nombre"
                  value={normalizeDisplayValue(
                    `${collaborator.lastName}, ${collaborator.firstName}`
                  )}
                />
              </View>
              <View style={styles.compactField}>
                <InfoField
                  label="DNI"
                  value={normalizeDisplayValue(formatDni(collaborator.userName))}
                />
              </View>
              <View style={styles.compactField}>
                <InfoField
                  label="Puesto de trabajo"
                  value={normalizeDisplayValue(collaborator.positionJob)}
                />
              </View>
              <View style={[styles.compactField, { marginRight: 0 }]}>
                <InfoField
                  label="Fecha de nacimiento"
                  value={normalizeDisplayValue(collaborator.birthDate)}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topGrid}>
        <View style={[styles.section, styles.sectionHalf]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Empresa</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InfoField
                  label="Nombre"
                  value={normalizeDisplayValue(companyData.name)}
                />
              </View>
              <View style={[styles.field, { marginRight: 0 }]}>
                <InfoField
                  label="Telefono"
                  value={normalizeDisplayValue(companyData.phone)}
                />
              </View>
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <View style={styles.field}>
                <InfoField
                  label="CUIT"
                  value={normalizeDisplayValue(formatCuilCuit(companyData.taxId))}
                />
              </View>
              <View style={[styles.field, { marginRight: 0 }]}>
                <InfoField
                  label="Domicilio"
                  value={normalizeDisplayValue(
                    formatAddress(companyData.addressData)
                  )}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.sectionHalf]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trabajador</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.field}>
                <InfoField
                  label="Apellido y nombre"
                  value={normalizeDisplayValue(
                    `${collaborator.lastName}, ${collaborator.firstName}`
                  )}
                />
              </View>
              <View style={[styles.field, { marginRight: 0 }]}>
                <InfoField
                  label="DNI"
                  value={normalizeDisplayValue(formatDni(collaborator.userName))}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.field}>
                <InfoField
                  label="Fecha de nacimiento"
                  value={normalizeDisplayValue(collaborator.birthDate)}
                />
              </View>
              <View style={[styles.field, { marginRight: 0 }]}>
                <InfoField
                  label="Telefono"
                  value={normalizeDisplayValue(collaborator.phone)}
                />
              </View>
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <View style={styles.field}>
                <InfoField
                  label="Puesto de trabajo"
                  value={normalizeDisplayValue(collaborator.positionJob)}
                />
              </View>
              <View style={[styles.field, { marginRight: 0 }]}>
                <InfoField
                  label="Localidad"
                  value={normalizeDisplayValue(
                    collaborator.addressData?.city.name
                  )}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {showAntecedentes ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Antecedentes</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.antecedentesBlock}>
              {antecedentes && antecedentes.length > 0 ? (
                antecedentes.map((antecedente, index) => (
                  <Text key={antecedente.id} style={styles.antecedentesItem}>
                    {index + 1}. {String(antecedente.value)}
                  </Text>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  Sin antecedentes ocupacionales registrados.
                </Text>
              )}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default CollaboratorInformationPdf;
