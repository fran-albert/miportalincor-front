import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
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
  // Category Section
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2d5a4e",
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#e6f2ef",
    borderRadius: 3,
  },
  categoryBullet: {
    marginRight: 6,
    fontSize: 10,
  },
  // Antecedente Item
  antecedenteItem: {
    marginBottom: 10,
    marginLeft: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#2d5a4e",
  },
  antecedenteValue: {
    fontSize: 10,
    color: "#1f2937",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  antecedenteObservacion: {
    fontSize: 9,
    color: "#666666",
    fontStyle: "italic",
    marginBottom: 4,
    paddingLeft: 8,
  },
  antecedenteMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  antecedenteDoctor: {
    fontSize: 8,
    color: "#666666",
  },
  antecedenteDate: {
    fontSize: 8,
    color: "#888888",
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
