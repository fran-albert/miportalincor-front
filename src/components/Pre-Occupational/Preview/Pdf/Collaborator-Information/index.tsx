import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Company } from "@/types/Company/Company";
import CollaboratorAvatarPdf from "./Collaborator-Avatar";

interface CollaboratorInformationPdfProps {
  collaborator: Collaborator;
  companyData: Company;
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  headerBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 4,
    marginBottom: 8,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
  },
  headerLeft: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "center",
  },
  logoImage: {
    height: 20,
  },
  divider: {
    width: 1,
    backgroundColor: "#333",
    height: "100%",
  },
  headerRight: {
    flex: 1,
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 10,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gridTwoColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridColumn: {
    flex: 1,
    paddingRight: 4,
  },
  gridColumnRight: {
    flex: 1,
    paddingLeft: 4,
  },
  gridThreeColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  columnTwoThirds: {
    flex: 2,
    paddingRight: 4,
  },
  columnOneThird: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
  },
});

const CollaboratorInformationPdf: React.FC<CollaboratorInformationPdfProps> = ({
  collaborator,
  companyData,
}) => {
  // Uso:

  return (
    <View style={styles.container}>
      {/* Sección Empresa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Empresa</Text>
        <View style={styles.gridTwoColumns}>
          <View style={styles.gridColumn}>
            <Text style={styles.text}>Nombre: {companyData.name}</Text>
            <Text style={styles.text}>Cuit: {companyData.taxId}</Text>
          </View>
          <View style={styles.gridColumnRight}>
            <Text style={styles.text}>Teléfono: {companyData.phone}</Text>
            <Text style={styles.text}>Domicilio: {companyData.address}</Text>
          </View>
        </View>
      </View>

      {/* Sección Trabajador */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trabajador</Text>
        <View style={styles.gridThreeColumns}>
          {/* Información del colaborador */}
          <View style={styles.columnTwoThirds}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.gridColumn}>
                <Text style={styles.text}>
                  Apellido y Nombre: {collaborator.lastName}{" "}
                  {collaborator.firstName}
                </Text>
                <Text style={styles.text}>
                  Fecha Nac: {String(collaborator.birthDate)}
                </Text>
                <Text style={styles.text}>Estado Cívil: </Text>
                <Text style={styles.text}>Tarea Propuesta: </Text>
              </View>
              <View style={styles.gridColumnRight}>
                <Text style={styles.text}>D.N.I.: {collaborator.userName}</Text>
                <Text style={styles.text}>
                  Domicilio: {collaborator.addressData?.city.name}
                </Text>
                <Text style={styles.text}>Teléfono: {collaborator.phone}</Text>
                <Text style={styles.text}>
                  Localidad: {collaborator.addressData?.city.name}
                </Text>
              </View>
            </View>
            <Text style={styles.text}>Antecedentes Personales:</Text>
          </View>
          {/* Imagen del colaborador */}
          <View style={styles.columnOneThird}>
            <CollaboratorAvatarPdf
              photoBuffer={collaborator.photoBuffer}
              alt={`${collaborator.firstName} ${collaborator.lastName}`}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CollaboratorInformationPdf;
