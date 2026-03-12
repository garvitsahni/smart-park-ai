import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateRevenueFromLogs } from '@/lib/parking-data';
import { useParking } from '@/context/ParkingContext';

export const RevenueChart: React.FC = () => {
  const { vehicleLogs } = useParking();
  const data = generateRevenueFromLogs(vehicleLogs);

  const hasData = data.some(d => d.revenue > 0 || d.vehicles > 0);

  return (
    <div className="glass-card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold">Weekly Revenue</h3>
          <p className="text-sm text-muted-foreground">Revenue and vehicle count</p>
        </div>
      </div>

      <div className="h-[300px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Vehicles'
                ]}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="revenue" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
              <Bar 
                yAxisId="right"
                dataKey="vehicles" 
                fill="hsl(var(--primary) / 0.4)" 
                radius={[4, 4, 0, 0]}
                name="Vehicles"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Complete some parking sessions to see revenue data
          </div>
        )}
      </div>
    </div>
  );
};
