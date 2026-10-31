import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface TopIssuesBarProps {
  data: Array<{
    name: string;
    category: string;
    count: number;
  }>;
}

export const TopIssuesBar: React.FC<TopIssuesBarProps> = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-soil-500 text-xs">
        <span>No recurring pest or disease issues reported.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8DEC5" />
          <XAxis type="number" stroke="#6B5238" fontSize={11} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#6B5238"
            fontSize={11}
            width={110}
            tick={{ fill: '#3B2F22' }}
          />
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
          <Bar dataKey="count" fill="#B5835A" radius={[0, 6, 6, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
