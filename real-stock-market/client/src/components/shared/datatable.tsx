"use client";

import {
  ColumnDef,
  ColumnPinningState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnPinning?: ColumnPinningState;
  setColumnPinning?: (
    updater:
      | ColumnPinningState
      | ((old: ColumnPinningState) => ColumnPinningState)
  ) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  columnPinning,
  setColumnPinning,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      columnPinning,
    },
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table
        className="table-fixed min-w-max"
        style={{
          width: table.getTotalSize(),
        }}
      >
        <TableHeader className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isPinnedLeft = header.column.getIsPinned() === "left";
                const isPinnedRight = header.column.getIsPinned() === "right";

                return (
                  <TableHead
                    key={header.id}
                    className={`border bg-gray-100 ${
                      isPinnedLeft ? "sticky left-0 z-20 shadow-md" : ""
                    } ${isPinnedRight ? "sticky right-0 z-20 shadow-md" : ""}`}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const isPinnedLeft = cell.column.getIsPinned() === "left";
                  const isPinnedRight = cell.column.getIsPinned() === "right";

                  return (
                    <TableCell
                      key={cell.id}
                      className={`border bg-white ${
                        isPinnedLeft ? "sticky left-0 z-10 shadow-md bg-gray-50" : ""
                      } ${
                        isPinnedRight ? "sticky right-0 z-10 shadow-md" : ""
                      }`}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
