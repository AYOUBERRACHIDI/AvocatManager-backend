import React from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

function StatCard({ title, value, percentage, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <h3 className="text-qadiyatuk-text-gray text-sm mb-2">{title}</h3>
      <div className="flex items-center space-x-2">
        <p className="text-3xl font-bold text-black">{value}</p>
        <div className="flex items-center text-green-500">
          <ArrowUpIcon className="w-4 h-4" />
          <span className="text-sm">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;