"use client";
import { DataTable } from "@/components/shared/datatable";
import { Card } from "@/components/ui/card";
import { ColumnDef, ColumnPinningState } from "@tanstack/react-table";
import { useState } from "react";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  name?: string;
  date?: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
    enableResizing: false,
    size: 200,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableResizing: false,
    size: 500,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    enableResizing: false,
    size: 200,
  },
  {
    accessorKey: "name",
    header: "Payment ID",
    enableResizing: false,
    size: 300,
  },
  {
    accessorKey: "date",
    header: "Date",
    enableResizing: false,
    size: 300,
  },
];

export const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  // ...
];

export default function Home() {
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["email"],
    right: [],
  });

  return (
    <main className="m-4">
      <div className="w-full overflow-auto">
        <DataTable
          columns={columns}
          data={data}
          columnPinning={columnPinning}
          setColumnPinning={setColumnPinning}
        />
      </div>
    </main>
  );
}
