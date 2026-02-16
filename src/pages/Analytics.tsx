import React, { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SustainabilityDashboard } from '@/components/dashboard/SustainabilityDashboard';
import { useParking } from '@/context/ParkingContext';
import { calculateSustainabilityMetrics } from '@/lib/parking-intelligence';
import { 
  TrendingUp, IndianRupee, Clock, AlertTriangle, Target, Zap, Car
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const { stats, vehicleLogs } = useParking();

  // Sustainability metrics
  const sustainabilityMetrics = useMemo(() => {
    const completedSessions = vehicleLogs.filter(l => l.status === 'completed').length;
    return calculateSustainabilityMetrics(completedSessions * 10); // Scale for demo
  }, [vehicleLogs]);

  // Payment method distribution
  const paymentMethods = vehicleLogs
    .filter(l => l.paymentMethod)
    .reduce((acc, log) => {
      acc[log.paymentMethod!] = (acc[log.paymentMethod!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));
  const COLORS = ['hsl(var(--primary))', 'hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(221, 83%, 53%)'];

  const dailyTrend = [
    { day: 'Mon', revenue: 45000, vehicles: 280 },
    { day: 'Tue', revenue: 52000, vehicles: 320 },
    { day: 'Wed', revenue: 48000, vehicles: 290 },
    { day: 'Thu', revenue: 61000, vehicles: 380 },
    { day: 'Fri', revenue: 58000, vehicles: 350 },
    { day: 'Sat', revenue: 72000, vehicles: 450 },
    { day: 'Sun', revenue: 65000, vehicles: 400 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Revenue & <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-muted-foreground">AI-powered insights and sustainability metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} icon={IndianRupee} variant="success" trend={{ value: 12, isPositive: true }} />
          <StatsCard title="Weekly Revenue" value={`₹${stats.weeklyRevenue.toLocaleString()}`} icon={TrendingUp} variant="default" trend={{ value: 8, isPositive: true }} />
          <StatsCard title="Avg. Stay Duration" value={`${stats.averageStayDuration}h`} icon={Clock} variant="default" />
          <StatsCard title="Violation Rate" value={`${((stats.violations / stats.totalSlots) * 100).toFixed(1)}%`} icon={AlertTriangle} variant="danger" trend={{ value: 2, isPositive: false }} />
        </div>

        {/* Sustainability Dashboard - ESG Impact */}
        <div className="mb-8">
          <SustainabilityDashboard metrics={sustainabilityMetrics} />
        </div>

        {/* AI Insights */}
        <div className="glass-card-elevated p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">AI Insights</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Optimal Pricing</span>
              </div>
              <p className="text-sm text-muted-foreground">Increase rates by 20% during 12PM-2PM to maximize revenue.</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">Growth Opportunity</span>
              </div>
              <p className="text-sm text-muted-foreground">Weekend revenue is 25% higher. Consider special packages.</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Capacity Alert</span>
              </div>
              <p className="text-sm text-muted-foreground">Floor 1 reaches 95% capacity by 1PM. Redirect to Floor 2.</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <OccupancyChart />
          <RevenueChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card-elevated p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${(value / 1000)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card-elevated p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
