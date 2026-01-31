import { StyleSheet } from "@react-pdf/renderer";

// Colores del cartón verde
const COLORS = {
  greenLight: "#A5D6A7",
  greenMedium: "#81C784",
  greenDark: "#4CAF50",
  greenText: "#1B5E20",
  gray700: "#374151",
  gray600: "#4B5563",
  gray500: "#6B7280",
  gray400: "#9CA3AF",
  white: "#FFFFFF",
  whiteTransparent: "rgba(255, 255, 255, 0.3)",
  tableBorder: "#4B5563",
};

export const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: COLORS.white,
  },
  // Contenedor principal del cartón verde
  cardContainer: {
    margin: 30,
    backgroundColor: COLORS.greenLight,
    borderRadius: 8,
    padding: 24,
    position: "relative",
  },
  // Header centrado con logo
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray700,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    padding: 6,
  },
  logo: {
    width: 52,
    height: 52,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.gray700,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.gray600,
    marginTop: 2,
  },
  // Información del paciente
  patientInfoContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: 4,
  },
  patientInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  patientInfoItem: {
    flexDirection: "row",
  },
  patientInfoLabel: {
    fontSize: 9,
    color: COLORS.gray600,
    marginRight: 4,
  },
  patientInfoValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  // Tabla principal
  tableContainer: {
    borderWidth: 2,
    borderColor: COLORS.gray700,
    borderRadius: 4,
    backgroundColor: COLORS.whiteTransparent,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.whiteTransparent,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray700,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontWeight: "bold",
    fontSize: 9,
    color: COLORS.gray700,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray500,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.gray700,
  },
  tableCellBold: {
    fontSize: 9,
    color: COLORS.gray700,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  // Columnas de la tabla
  colSchedule: {
    width: "15%",
    textAlign: "center",
  },
  colMedication: {
    width: "35%",
  },
  colDosage: {
    width: "20%",
    textAlign: "center",
  },
  colQuantity: {
    width: "15%",
    textAlign: "center",
  },
  colDoctor: {
    width: "15%",
    textAlign: "center",
  },
  // Sección de suspendidos
  suspendedSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.gray600,
  },
  suspendedTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.gray700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  suspendedItem: {
    fontSize: 9,
    color: COLORS.gray600,
    marginBottom: 2,
    textDecoration: "line-through",
  },
  // Filas vacías
  emptyRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray500,
    paddingVertical: 10,
    paddingHorizontal: 12,
    opacity: 0.4,
  },
  emptyCell: {
    height: 12,
  },
  // Estado vacío
  emptyState: {
    textAlign: "center",
    color: COLORS.gray600,
    marginTop: 40,
    marginBottom: 40,
    fontSize: 11,
    fontStyle: "italic",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 10,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.gray400,
  },
  pageNumber: {
    fontSize: 7,
    color: COLORS.gray400,
  },
  // Stats debajo del cartón
  statsContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.greenDark,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.gray600,
  },
  // Legacy styles for backwards compatibility
  headerInfo: {
    flex: 1,
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
  patientInfoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 8,
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
  tableRowSuspended: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fef2f2",
    opacity: 0.8,
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
});
