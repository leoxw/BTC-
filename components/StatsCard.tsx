
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, trend }) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl hover:border-gray-700 transition-all">
      <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-xl font-bold text-white mono">{value}</h3>
        {trend !== undefined && (
          <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}%
          </span>
        )}
      </div>
      {subValue && <p className="text-gray-500 text-xs mt-1">{subValue}</p>}
    </div>
  );
};

export default StatsCard;
