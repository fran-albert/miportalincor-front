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
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Search, X, Plus, ChevronsLeft, ChevronsRight, FileX } from "lucide-react";

interface ColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
}

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
  setSearch?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  useServerSideSearch?: boolean;
  currentPage?: number;
  totalPages?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showSearch = false,
  searchPlaceholder = "",
  addLinkPath = "/",
  searchQuery,
  setSearch,
  onSearchSubmit,
  isFetching = false,
  addLinkText = "Agregar",
  // searchColumn = "name",
  customFilter,
  canAddUser = true,
  onAddClick,
  isLoading = false,
  useServerSideSearch = false,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
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

  // Debounced server-side search
  React.useEffect(() => {
    if (useServerSideSearch && setSearch) {
      const timer = setTimeout(() => {
        setSearch(searchInput || "");
      }, 300); // 300ms debounce

      return () => clearTimeout(timer);
    }
  }, [searchInput, useServerSideSearch, setSearch]);

  const filteredData = React.useMemo(() => {
    // Skip client-side filtering if using server-side search
    if (useServerSideSearch) {
      return data;
    }
    if (customFilter && searchInput) {
      return data.filter((item) => customFilter(item, searchInput));
    }
    return data;
  }, [data, customFilter, searchInput, useServerSideSearch]);
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row: TData, index: number) => {
      const rowWithId = row as { id?: string | number };
      return rowWithId.id ? `row-${rowWithId.id}` : `row-index-${index}`;
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-10 h-11 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary transition-all"
                  value={searchInput}
                  onKeyDown={handleKeyPress}
                  onChange={handleSearchChange}
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {canAddUser && (
                <div className="w-full sm:w-auto">
                  {onAddClick ? (
                    <Button
                      className="bg-gradient-to-r from-greenPrimary to-teal-600 hover:from-greenPrimary hover:to-teal-700 text-white px-6 h-11 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center group"
                      onClick={onAddClick}
                    >
                      <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      {addLinkText}
                    </Button>
                  ) : (
                    <Link to={addLinkPath}>
                      <Button className="bg-gradient-to-r from-greenPrimary to-teal-600 hover:from-greenPrimary hover:to-teal-700 text-white px-6 h-11 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center group">
                        <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        {addLinkText}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-greenPrimary to-teal-600 sticky top-0 z-10 shadow-md">
                  {table.getHeaderGroups().map((headerGroup, groupIndex) => (
                    <tr key={`header-group-${headerGroup.id}-${groupIndex}`}>
                      {headerGroup.headers.map((header, headerIndex) => {
                        const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                        const headerClassName = meta?.headerClassName || "";
                        return (
                          <th
                            key={`header-${headerGroup.id}-${header.id}-${headerIndex}`}
                            className={`py-4 px-3 sm:px-4 lg:px-6 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wide ${headerClassName}`}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {searchQuery === "" ? (
                    <tr key="empty-search">
                      <td
                        colSpan={columns.length}
                        className="py-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-gray-700">
                              Ingrese un criterio de búsqueda
                            </p>
                            <p className="text-sm text-gray-500">
                              Puede filtrar por <span className="font-medium">nombre</span>,{" "}
                              <span className="font-medium">apellido</span> o{" "}
                              <span className="font-medium">D.N.I.</span>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : isFetching ? (
                    <>
                      {[...Array(5)].map((_, index) => (
                        <tr key={`skeleton-${index}`} className="animate-pulse">
                          {columns.map((_, colIndex) => (
                            <td
                              key={`skeleton-cell-${index}-${colIndex}`}
                              className="py-4 px-3 sm:px-4 lg:px-6"
                            >
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row, rowIndex) => (
                      <tr
                        key={`data-row-${row.id}-${rowIndex}`}
                        className={`${
                          row.getIsSelected()
                            ? "bg-teal-50"
                            : "hover:bg-gray-50 hover:shadow-sm"
                        } transition-all duration-200 ease-in-out`}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => {
                          const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                          const cellClassName = meta?.cellClassName || "";
                          return (
                            <td
                              key={`cell-${row.id}-${cell.id}-${cellIndex}`}
                              className={`py-4 px-3 sm:px-4 lg:px-6 text-xs sm:text-sm ${cellClassName}`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr key="no-results">
                      <td
                        colSpan={columns.length}
                        className="py-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                            <FileX className="h-8 w-8 text-red-400" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-gray-700">
                              No se encontraron resultados
                            </p>
                            <p className="text-sm text-gray-500">
                              Intenta con otro criterio de búsqueda
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {searchQuery !== "" && !useServerSideSearch && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-gray-600 text-sm font-medium">
                  Mostrando <span className="text-greenPrimary font-semibold">{Math.min((pagination.pageIndex * pagination.pageSize) + 1, filteredData.length)}</span> - <span className="text-greenPrimary font-semibold">{Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredData.length)}</span> de <span className="text-greenPrimary font-semibold">{filteredData.length}</span> resultados
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-600 font-medium">
                    Filas por página:
                  </label>
                  <select
                    id="pageSize"
                    value={pagination.pageSize}
                    onChange={(e) => {
                      setPagination({
                        pageIndex: 0,
                        pageSize: Number(e.target.value),
                      });
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary transition-all bg-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={16}>16</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <Pagination className="justify-center sm:justify-end">
                <PaginationContent className="gap-1">
                {/* Botón Primera Página */}
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(0)}
                    disabled={pagination.pageIndex === 0}
                    className={`h-9 w-9 p-0 transition-all duration-200 ${
                      pagination.pageIndex === 0
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-greenPrimary hover:text-white hover:scale-105"
                    }`}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>

                {/* Botón Anterior */}
                <PaginationPrevious
                  onClick={() => {
                    if (pagination.pageIndex > 0) {
                      handlePageChange(pagination.pageIndex - 1);
                    }
                  }}
                  aria-disabled={pagination.pageIndex === 0}
                  className={`cursor-pointer transition-all duration-200 ${
                    pagination.pageIndex === 0
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-greenPrimary hover:text-white hover:scale-105"
                  }`}
                />

                {/* Números de Páginas */}
                {renderPageNumbers().map((pageNumber, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={pageNumber === pagination.pageIndex}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`cursor-pointer h-9 w-9 transition-all duration-200 ${
                        pageNumber === pagination.pageIndex
                          ? "bg-greenPrimary text-white font-bold shadow-md hover:bg-greenPrimary"
                          : "hover:bg-gray-100 hover:scale-105"
                      }`}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Botón Siguiente */}
                <PaginationNext
                  onClick={() => {
                    if (pagination.pageIndex < pageCount - 1) {
                      handlePageChange(pagination.pageIndex + 1);
                    }
                  }}
                  aria-disabled={pagination.pageIndex === pageCount - 1}
                  className={`cursor-pointer transition-all duration-200 ${
                    pagination.pageIndex === pageCount - 1
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-greenPrimary hover:text-white hover:scale-105"
                  }`}
                />

                {/* Botón Última Página */}
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageCount - 1)}
                    disabled={pagination.pageIndex === pageCount - 1}
                    className={`h-9 w-9 p-0 transition-all duration-200 ${
                      pagination.pageIndex === pageCount - 1
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-greenPrimary hover:text-white hover:scale-105"
                    }`}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            </div>
          )}
          {useServerSideSearch && currentPage !== undefined && totalPages !== undefined && totalPages > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-600 text-sm font-medium">
                Página <span className="text-greenPrimary font-semibold">{currentPage}</span> de <span className="text-greenPrimary font-semibold">{totalPages}</span>
              </div>
              <Pagination className="justify-center sm:justify-end">
                <PaginationContent className="gap-1">
                  {/* Botón Anterior */}
                  <PaginationPrevious
                    onClick={onPrevPage}
                    aria-disabled={currentPage === 1}
                    className={`cursor-pointer transition-all duration-200 ${
                      currentPage === 1
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-greenPrimary hover:text-white hover:scale-105"
                    }`}
                  />

                  {/* Página actual */}
                  <PaginationItem>
                    <PaginationLink
                      isActive={true}
                      className="cursor-default h-9 w-9 bg-greenPrimary text-white font-bold shadow-md"
                    >
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>

                  {/* Botón Siguiente */}
                  <PaginationNext
                    onClick={onNextPage}
                    aria-disabled={currentPage === totalPages}
                    className={`cursor-pointer transition-all duration-200 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-greenPrimary hover:text-white hover:scale-105"
                    }`}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </>
  );
}
