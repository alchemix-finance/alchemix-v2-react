import { useConnection } from "wagmi";
import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/number";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/table";

interface LeaderboardEntry {
  address: string;
  mana: number;
}

interface PointsLeaderboardTableProps {
  data: LeaderboardEntry[];
}

const columnHelper = createColumnHelper<LeaderboardEntry>();

const columns = [
  columnHelper.display({
    id: "rank",
    header: () => "Rank #",
    cell: (info) => info.row.index + 1,
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor("mana", {
    header: "Mana",
    cell: (info) => formatNumber(info.getValue()),
  }),
];

export const PointsLeaderboardTable = ({
  data,
}: PointsLeaderboardTableProps) => {
  const { address } = useConnection();

  const userRowIdx = useMemo(() => {
    return data?.findIndex(
      (entry) => entry.address.toLowerCase() === address?.toLowerCase(),
    );
  }, [address, data]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      rowPinning: {
        top: userRowIdx === -1 ? [] : [userRowIdx.toString()],
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: false,
  });

  return (
    <div className="bg-card layered-shadow space-y-12 rounded-xl p-6">
      <div className="w-full">
        <div className="space-y-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-[oklch(0.35_0.04_231.64)]"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="first:w-48 last:w-48">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getTopRows().map((row) => (
                <TableRow key={row.id} className="bg-muted dark:bg-card">
                  <TableCell>{row.index + 1}</TableCell>
                  <TableCell>
                    <span className="text-sm">{row.getValue("address")}</span>
                  </TableCell>
                  <TableCell>{formatNumber(row.getValue("points"))}</TableCell>
                </TableRow>
              ))}
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b-0">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2"
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2"
              >
                Next
              </Button>
            </div>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
