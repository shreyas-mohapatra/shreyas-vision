import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SeverityDonutProps {
  data: Array<{
    name: string;
    severity: string;
    count: number;
    color: string;
  }>;
}

export const SeverityDonut: React.FC<SeverityDonutProps> = ({ data = [] }) => {
  const filteredData = data.filter((item) => item.count > 0);

  if (filteredData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-soil-500 text-xs">
        <span>No severity distribution data available yet.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="count"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#F2EBD9" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FAF6EC',
              borderColor: '#6B523820',
              borderRadius: '0.75rem',
              fontSize: '12px',
              color: '#1E1A14',
              boxShadow: '0 4px 12px rgba(59,47,34,0.1)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#524130' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
