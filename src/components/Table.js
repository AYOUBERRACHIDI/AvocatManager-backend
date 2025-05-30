import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function Table({ headers, data, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="table-header">
            {headers.map((header, index) => (
              <th key={index} className="py-3 px-4 text-right">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="table-row">
              {Object.values(row).slice(0, -1).map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 px-4 text-right">
                  {typeof cell === 'object' ? (
                    <span className={`px-2 py-1 rounded-full text-xs ${cell.color}`}>
                      {cell.text}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
              <td className="py-3 px-4 text-right flex space-x-2">
                <button onClick={() => onView(row)} className="text-blue-500 hover:text-blue-700">
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onEdit(row)} className="text-yellow-500 hover:text-yellow-700">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(row)} className="text-red-500 hover:text-red-700">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;