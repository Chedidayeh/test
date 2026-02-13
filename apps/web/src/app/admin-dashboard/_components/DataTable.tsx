"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { cn } from "@/src/lib/utils";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  description?: string;
  itemsPerPage?: number;
  actions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  title,
  description,
  itemsPerPage = 10,
  actions,
  onRowClick,
  emptyMessage = "No data found",
  className,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  // Sort data
  let sortedData = [...data];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={cn(
                    "font-semibold text-slate-900 text-xs uppercase tracking-wide",
                    column.sortable && "cursor-pointer hover:bg-slate-100"
                  )}
                  onClick={() =>
                    column.sortable && handleSort(column.key)
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-slate-400">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-20 text-xs uppercase tracking-wide text-slate-900 font-semibold">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-8 text-slate-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={`${row.id || idx}`}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className="text-sm text-slate-700"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || "-")}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm"
                    >
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {currentPage + 1} of {totalPages} ({sortedData.length} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-slate-900 w-8 text-center">
              {currentPage + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
