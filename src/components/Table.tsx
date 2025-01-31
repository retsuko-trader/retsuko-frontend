import React from 'react';
import classNames from 'classnames';

interface Props {
  name: string;
  headers?: string[];
  rows: React.ReactNode[][];
  transpose?: boolean;
  firstColumnAsRowHeader?: boolean;
  className?: string;
}

export function Table({ name, headers, rows, transpose, firstColumnAsRowHeader, className }: Props) {
  if (transpose) {
    rows = rows[0].map((_, i) => rows.map(x => x[i]));
  }

  return (
    <table className={classNames('font-mono', className)}>
      {headers && (
        <thead>
          <tr className='text-h-text/80 text-left bg-h-tone/10'>
            {headers.map((x, i) => (
              <th key={`table-${name}-header-${i}`}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
      )}

      <tbody>
        {rows.map((row, i) => (
          <tr
            key={`table-${name}-row-${i}`}
            className={classNames('text-h-text/60 group hover:text-h-text/80 cursor-pointer even:bg-h-tone/5', {
            })}
          >
            {row.map((x, j) => (
              <td
                key={`table-${name}-cell-${i}-${j}`}
                className={classNames('first:pl-1 last:pr-1 px-1', {
                  'first:bg-h-tone/10': firstColumnAsRowHeader,
                })}
              >
                {x}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}