import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// import Loading from "@/app/loading";
import { Search } from "../ui/search";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  addLinkPath?: string;
  addLinkText?: string;
  searchColumn?: string;
  canAddUser?: boolean;
  customFilter?: (data: TData, query: string) => boolean;
  onAddClick?: () => void;
  isLoading?: boolean;
  isFetching?: boolean;
  searchQueryFilterTable?: string;
  querySearchFilter?: string;
  searchQuery?: string;
  onSearchSubmit?: (query: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showSearch = false,
  searchPlaceholder = "",
  addLinkPath = "/",
  searchQuery,
  onSearchSubmit,
  isFetching = false,
  searchQueryFilterTable,
  addLinkText = "Agregar",
  // searchColumn = "name",
  customFilter,
  canAddUser = true,
  querySearchFilter,
  onAddClick,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 16,
  });
  const [searchInput, setSearchInput] = React.useState(searchQuery);

  React.useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // @ts-ignore
  const [isAdding, setIsAdding] = React.useState(false);
  const filteredData = React.useMemo(() => {
    if (customFilter && searchInput) {
      return data.filter((item) => customFilter(item, searchInput));
    }
    return data;
  }, [data, customFilter, searchInput]);
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row: TData, index: number) => {
      return (row as any).id ? `row-${(row as any).id}` : `row-index-${index}`;
    },
  });

  const handleSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchInput ?? "");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const pageCount = table.getPageCount();

  const handlePageChange = (pageIndex: number) => {
    setPagination((current) => ({
      ...current,
      pageIndex,
    }));
  };

  if (isAdding) {
    return null;
  }

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const { pageIndex } = pagination;
    const startPage = Math.max(0, pageIndex - 2);
    const endPage = Math.min(pageCount - 1, pageIndex + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      {isLoading ? null : (
        <>
          {showSearch && (
            <div className="flex items-center mb-4">
              <Search
                placeholder={searchPlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-greenPrimary"
                value={searchInput}
                color="#187B80"
                onKeyDown={handleKeyPress}
                onChange={handleSearchChange}
              />
              {/* <Button
                onClick={handleSearchSubmit}
                className="bg-greenPrimary hover:bg-greenPrimary-700 text-white px-4 py-2 rounded-md shadow-lg flex items-center ml-2"
              >
                Buscar
              </Button> */}
              {canAddUser && (
                <div className="ml-4">
                  {onAddClick ? (
                    <Button
                      className="bg-greenPrimary hover:bg-teal-700 hover:shadow-2xl text-white px-4 py-2 rounded-md shadow-lg flex items-center"
                      onClick={onAddClick}
                    >
                      {addLinkText}
                    </Button>
                  ) : (
                    <Link to={addLinkPath}>
                      <Button className="bg-greenPrimary hover:bg-teal-700 hover:shadow-2xl text-white px-4 py-2 rounded-md shadow-lg flex items-center">
                        {addLinkText}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="rounded-lg overflow-hidden shadow-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-greenPrimary">
                  {table.getHeaderGroups().map((headerGroup, groupIndex) => (
                    <tr key={`header-group-${headerGroup.id}-${groupIndex}`}>
                      {headerGroup.headers.map((header, headerIndex) => (
                        <th
                          key={`header-${headerGroup.id}-${header.id}-${headerIndex}`}
                          className="py-2 px-6 text-left text-sm font-semibold text-white uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="text-gray-700">
                  {searchQuery === "" ? (
                    <tr key="empty-search">
                      <td
                        colSpan={columns.length}
                        className="py-10 text-center text-gray-800"
                      >
                        <strong>
                          Ingrese un criterio de búsqueda para ver los
                          {querySearchFilter ? querySearchFilter : " pacientes"}
                        </strong>
                        <br />
                        Puede filtrar por <strong>nombre</strong>,{" "}
                        <strong>apellido</strong> o <strong>D.N.I.</strong>
                      </td>
                    </tr>
                  ) : isFetching ? (
                    <tr key="fetching">
                      <td
                        colSpan={columns.length}
                        className="py-10 text-center text-gray-900"
                      >
                        Buscando {searchQueryFilterTable}:{" "}
                        <strong>{searchQuery}</strong>...
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row, rowIndex) => (
                      <tr
                        key={`data-row-${row.id}-${rowIndex}`}
                        className={`${
                          row.getIsSelected()
                            ? "bg-teal-100"
                            : "hover:bg-gray-50"
                        } transition duration-150 ease-in-out`}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <td
                            key={`cell-${row.id}-${cell.id}-${cellIndex}`}
                            className="py-2 px-6 border-b border-gray-200"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr key="no-results">
                      <td
                        colSpan={columns.length}
                        className="py-10 text-center text-gray-900"
                      >
                        No se encuentran resultados con ese criterio de
                        búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-gray-500 text-sm w-full"></div>
            <Pagination className="mt-6 justify-end px-4 py-2">
              <PaginationContent>
                {/* Botón para la página anterior */}
                <PaginationPrevious
                  onClick={() => {
                    if (pagination.pageIndex > 0) {
                      handlePageChange(pagination.pageIndex - 1);
                    }
                  }}
                  aria-disabled={pagination.pageIndex === 0}
                  className={`cursor-pointer text-greenPrimary hover:text-greenPrimary ${
                    pagination.pageIndex === 0
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                />

                {/* Números de páginas */}
                {renderPageNumbers().map((pageNumber, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={pageNumber === pagination.pageIndex}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`cursor-pointer text-greenPrimary hover:text-greenPrimary ${
                        pageNumber === pagination.pageIndex ? "font-bold" : ""
                      }`}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Botón para la página siguiente */}
                <PaginationNext
                  onClick={() => {
                    if (pagination.pageIndex < pageCount - 1) {
                      handlePageChange(pagination.pageIndex + 1);
                    }
                  }}
                  aria-disabled={pagination.pageIndex === pageCount - 1}
                  className={`cursor-pointer text-greenPrimary hover:text-greenPrimary ${
                    pagination.pageIndex === pageCount - 1
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </>
  );
}
