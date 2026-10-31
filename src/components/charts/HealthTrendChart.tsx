import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface HealthTrendItem {
  id: string;
  created_at: string;
  health_score: number;
  overall_severity: string;
  growth_stage?: string;
}

interface HealthTrendChartProps {
  data: HealthTrendItem[];
}

export const HealthTrendChart: React.FC<HealthTrendChartProps> = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-soil-500 text-xs">
        <span>No scan timeline records yet. Upload photos to start trend tracking.</span>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DEC5" vertical={false} />
          <XAxis dataKey="dateLabel" stroke="#6B5238" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#6B5238" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FAF6EC',
              borderColor: '#6B523820',
              borderRadius: '0.75rem',
              fontSize: '12px',
              color: '#1E1A14',
              boxShadow: '0 4px 12px rgba(59,47,34,0.1)',
            }}
            formatter={(value: any) => [`${value} / 100 Health`, 'Vigor Score']}
          />
          <ReferenceLine y={70} stroke="#4E8A57" strokeDasharray="3 3" opacity={0.6} />
          <ReferenceLine y={40} stroke="#B4532A" strokeDasharray="3 3" opacity={0.6} />
          <Line
            type="monotone"
            dataKey="health_score"
            stroke="#2F5D3A"
            strokeWidth={3}
            dot={{ fill: '#E3C98A', stroke: '#2F5D3A', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#E3C98A', stroke: '#1E1A14', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
