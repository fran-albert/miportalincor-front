import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { NutritionData } from "@/types/Nutrition-Data/NutritionData";

const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 20,
    fontSize: 10,
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
  logo: { width: 139, height: 50 },
  patientInfo: { flexDirection: "column", justifyContent: "center" },
  headerTitle: { marginBottom: 4, fontSize: 12, fontWeight: "bold" },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "bold",
  },
  tableWrapper: { marginTop: 10, marginBottom: 20 },
  table: { width: "auto", borderWidth: 1, borderColor: "#bfbfbf" },
  tableRow: { flexDirection: "row" },
  tableCol: { borderWidth: 1, borderColor: "#bfbfbf", padding: 4 },
  tableCellHeader: { fontWeight: "bold" },
  chartContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendLine: {
    width: 12,
    height: 2,
    marginRight: 4,
  },
  periodLabel: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 11,
  },
  chartImage: {
    width: 400,
    height: 200,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
  },
});

const columns: { key: keyof NutritionData; label: string }[] = [
  { key: "date", label: "Fecha" },
  { key: "weight", label: "Peso (kg)" },
  { key: "difference", label: "Diferencia" },
  { key: "fatPercentage", label: "% Grasa" },
  { key: "musclePercentage", label: "% Músculo" },
  { key: "visceralFat", label: "Grasa Visceral" },
  { key: "imc", label: "IMC" },
  { key: "height", label: "Talla (cm)" },
  { key: "targetWeight", label: "Peso Objetivo (kg)" },
];

export function NutritionPdfDocument({
  data,
  patientName,
  patientSurname,
  logoSrc,
  chartSrc,
  dateFrom,
  dateTo,
}: {
  data: NutritionData[];
  patientName: string;
  patientSurname: string;
  logoSrc?: string;
  chartSrc?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  // Capitaliza la primera letra de cada palabra
  const capitalize = (text: string) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  // Calcula periodo si no se proporcionan fechas
  const dates = data
    .map((d) => new Date(d.date as string))
    .sort((a, b) => a.getTime() - b.getTime());
  const from = dateFrom && dateFrom !== "-"
    ? dateFrom
    : dates.length
    ? dates[0].toLocaleDateString("es-AR")
    : "-";
  const to = dateTo && dateTo !== "-"
    ? dateTo
    : dates.length
    ? dates[dates.length - 1].toLocaleDateString("es-AR")
    : "-";

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
            <Text>Fecha: {new Date().toLocaleDateString("es-AR")}</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title} fixed>
          Control Nutricional
        </Text>

        {/* Tabla */}
        {data.length === 0 ? (
          <Text style={{ marginTop: 100 }}>No hay datos disponibles</Text>
        ) : (
          <View style={styles.tableWrapper}>
            <View style={styles.table}>
              <View style={styles.tableRow} fixed>
                {columns.map((col) => (
                  <View
                    key={col.key}
                    style={[styles.tableCol, { width: `${100 / columns.length}%` }]}
                  >
                    <Text style={styles.tableCellHeader}>{col.label}</Text>
                  </View>
                ))}
              </View>
              {data.map((row, i) => (
                <View style={styles.tableRow} key={i} wrap={false}>
                  {columns.map((col) => (
                    <View
                      key={col.key}
                      style={[styles.tableCol, { width: `${100 / columns.length}%` }]}
                    >
                      <Text>{formatCell(row[col.key], col.key)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Leyenda, periodo y gráfico */}
        {chartSrc && (
          <>
            <View style={styles.legendContainer} break>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendLine, { backgroundColor: '#8884d8' }]}
                />
                <Text>Peso (kg)</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendLine, { backgroundColor: '#82ca9d' }]}
                />
                <Text>Peso objetivo</Text>
              </View>
            </View>

            <Text style={styles.periodLabel}>
              Período: {from} hasta {to}
            </Text>

            <View style={styles.chartContainer}>
              <Image src={chartSrc} style={styles.chartImage} />
            </View>
          </>
        )}

        {/* Pie */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

// Formatea celdas numéricas con un decimal
function formatCell(value: string | number | Date | null | undefined, key: keyof NutritionData) {
  if (key === 'date') {
    return new Date(value as string).toLocaleDateString('es-AR');
  }
  if (value == null || value === '') {
    return '-';
  }
  const num = Number(value);
  return isNaN(num) ? String(value) : num.toFixed(1);
}
