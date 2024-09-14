import { formatDate } from "@/common/helpers/helpers";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

interface LabData {
  testName: string;
  [date: string]: string | undefined;
}

export const getColumns = (
  dates: string[],
  updateMyData: (rowIndex: number, columnId: string, value: string) => void
): ColumnDef<LabData>[] => {
  const columns: ColumnDef<LabData>[] = [
    {
      accessorKey: "testName",
      header: "Prueba",
      cell: (info) => info.getValue() as string,
    },
  ];

  dates.forEach((date) => {
    columns.push({
      accessorKey: date,
      header: formatDate(date),
      cell: (info) => (
        <EditableDateCell
          value={info.getValue() as string}
          row={info.row}
          column={info.column}
          updateMyData={updateMyData}
        />
      ),
    });
  });

  return columns;
};

const EditableDateCell: React.FC<{
  value: string;
  row: { index: number };
  column: { id: string };
  updateMyData: (rowIndex: number, columnId: string, value: string) => void;
}> = ({ value: initialValue, row, column, updateMyData }) => {
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    updateMyData(row.index, column.id, value);
  };

  return (
    <Input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="w-full border p-1 h-8"
    />
  );
};