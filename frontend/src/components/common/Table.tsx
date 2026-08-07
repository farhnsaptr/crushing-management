import React from 'react';
import { Spinner } from './Spinner';

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string | number;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | number;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  keyExtractor,
  rowClassName,
  onRowClick,
  selectedRowId,
}: TableProps<T>) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '2px solid var(--border-color)',
              backgroundColor: 'var(--bg-main)',
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '0.875rem 1rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                <Spinner size={36} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'var(--text-muted)',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const rowId = keyExtractor(row);
              const isSelected = selectedRowId !== undefined && selectedRowId === rowId;
              return (
                <tr
                  key={rowId}
                  className={rowClassName ? rowClassName(row) : undefined}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && (!rowClassName || !rowClassName(row))) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && (!rowClassName || !rowClassName(row))) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      style={{
                        padding: '0.85rem 1rem',
                        color: 'var(--text-main)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? (row[col.accessorKey] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
