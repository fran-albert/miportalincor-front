import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#15803d",
    backgroundColor: "#dcfce7",
    padding: 10,
    borderRadius: 4,
  },
  patientInfoContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  patientInfoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 8,
  },
  patientInfoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  patientInfoItem: {
    flexDirection: "row",
    marginRight: 20,
    flex: 1,
  },
  patientInfoLabel: {
    fontSize: 9,
    color: "#666666",
    marginRight: 4,
  },
  patientInfoValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  doctorInfoContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  doctorInfoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 4,
  },
  doctorInfoText: {
    fontSize: 9,
    color: "#475569",
  },
  scheduleSection: {
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#15803d",
    backgroundColor: "#dcfce7",
    padding: 6,
    marginBottom: 6,
    borderRadius: 2,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    padding: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowSuspended: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fef2f2",
    opacity: 0.8,
  },
  tableCell: {
    fontSize: 9,
  },
  tableCellMedication: {
    flex: 3,
  },
  tableCellDosage: {
    flex: 1.5,
  },
  tableCellQuantity: {
    flex: 1.5,
  },
  tableCellDoctor: {
    flex: 2.5,
  },
  tableCellNotes: {
    flex: 3,
  },
  suspendedBadge: {
    fontSize: 7,
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: 2,
    borderRadius: 2,
    marginLeft: 4,
  },
  emptyState: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  pageNumber: {
    fontSize: 8,
    color: "#9ca3af",
  },
});
