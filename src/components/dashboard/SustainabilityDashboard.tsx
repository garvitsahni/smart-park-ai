import React from 'react';
import { Leaf, Fuel, Wind, TreePine, IndianRupee, Clock, TrendingUp } from 'lucide-react';
import { SustainabilityMetrics } from '@/lib/parking-intelligence';
import { cn } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface SustainabilityDashboardProps {
  metrics: SustainabilityMetrics;
}

export const SustainabilityDashboard: React.FC<SustainabilityDashboardProps> = ({ metrics }) => {
  const impactCards = [
    {
      icon: Clock,
      label: 'Search Time Saved',
      value: `${Math.round(metrics.weeklyTotal.searchTimeSaved / 60)}h`,
      subtitle: 'This week',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Fuel,
      label: 'Fuel Saved',
      value: `${metrics.weeklyTotal.fuelSaved}L`,
      subtitle: 'This week',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Wind,
      label: 'CO₂ Avoided',
      value: `${metrics.weeklyTotal.co2Avoided}kg`,
      subtitle: 'This week',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: TreePine,
      label: 'Trees Equivalent',
      value: `${metrics.treesEquivalent}`,
      subtitle: 'Annual offset',
      color: 'from-green-600 to-emerald-500',
    },
  ];

  return (
    <div className="glass-card-elevated p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Smart City ESG Impact</h2>
            <p className="text-sm text-muted-foreground">Sustainability Intelligence Dashboard</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          🌱 Carbon Negative
        </div>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {impactCards.map((card, i) => (
          <div key={i} className="glass-card p-4 space-y-2">
            <div className={cn(
              'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
              card.color
            )}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
              <div className="text-xs text-muted-foreground/70">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Savings Highlight */}
      <div className="glass-card p-5 bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              Total Driver Savings
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Money saved by drivers through reduced fuel consumption
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-400">
              ₹{metrics.moneyToDrivers.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">This week</div>
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Weekly Impact Trend
          </h3>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.dailyStats}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}kg CO₂`, 'Avoided']}
              />
              <Area 
                type="monotone" 
                dataKey="co2Avoided" 
                stroke="hsl(160, 84%, 39%)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#co2Gradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Projections */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Monthly Search Time</div>
          <div className="text-lg font-bold">{Math.round(metrics.monthlyTotal.searchTimeSaved / 60)}h</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Monthly Fuel Saved</div>
          <div className="text-lg font-bold">{metrics.monthlyTotal.fuelSaved}L</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Monthly CO₂ Avoided</div>
          <div className="text-lg font-bold text-emerald-400">{metrics.monthlyTotal.co2Avoided}kg</div>
        </div>
      </div>
    </div>
  );
};
