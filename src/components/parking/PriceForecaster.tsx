import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Zap, Info } from 'lucide-react';

const generatePriceData = () => {
  const data = [];
  const basePrice = 50;
  
  for (let i = 0; i < 24; i++) {
    let price = basePrice;
    // Morning peak 10 AM - 2 PM
    if (i >= 10 && i <= 14) price = basePrice * 1.5;
    // Evening peak 6 PM - 9 PM
    if (i >= 18 && i <= 21) price = basePrice * 1.5;
    
    data.push({
      time: `${i}:00`,
      price: price,
      label: i >= 10 && i <= 14 || i >= 18 && i <= 21 ? 'Peak' : 'Standard'
    });
  }
  return data;
};

export const PriceForecaster: React.FC = () => {
  const data = generatePriceData();
  const currentHour = new Date().getHours();
  const currentPrice = data[currentHour].price;
  const isPeak = data[currentHour].label === 'Peak';

  return (
    <div className="glass-card-elevated p-6 animate-scale-in-gentle">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Smart Price Forecaster</h3>
            <p className="text-xs text-muted-foreground">AI-driven dynamic surging</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${isPeak ? 'text-destructive' : 'text-emerald-400'}`}>
            ₹{currentPrice}/hr
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Rate</p>
        </div>
      </div>

      <div className="h-[200px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              ticks={['0Box:00', '4:00', '8:00', '12:00', '16:00', '20:00', '23:00']}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))', 
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: 'var(--shadow-elevated)'
              }}
              formatter={(value: number) => [`₹${value}/hr`, 'Price']}
              labelStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Save up to 33% today</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Parking demand is lower between <span className="text-emerald-400 font-medium">3:00 PM and 5:00 PM</span>. 
              Book during these off-peak hours to skip the surge pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
