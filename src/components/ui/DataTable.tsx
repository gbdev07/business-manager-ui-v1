import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  caption: string;
};

export function DataTable<T>({ columns, rows, caption }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border text-xs tracking-[0.14em] text-muted uppercase">
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-3 py-3 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border last:border-b-0">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-3 align-middle">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
