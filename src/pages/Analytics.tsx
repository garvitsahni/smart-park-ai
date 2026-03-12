import React, { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SustainabilityDashboard } from '@/components/dashboard/SustainabilityDashboard';
import { useParking } from '@/context/ParkingContext';
import { calculateSustainabilityMetrics } from '@/lib/parking-intelligence';
import { VEHICLE_TYPE_CONFIG, VehicleType } from '@/lib/parking-data';
import {
  TrendingUp, IndianRupee, Clock, AlertTriangle, Target, Zap, Car
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const Analytics = () => {
  const { stats, vehicleLogs } = useParking();

  // Sustainability metrics
  const sustainabilityMetrics = useMemo(() => {
    const completedSessions = vehicleLogs.filter(l => l.status === 'completed').length;
    return calculateSustainabilityMetrics(Math.max(completedSessions * 10, 50));
  }, [vehicleLogs]);

  // Payment method distribution from real logs
  const paymentMethods = useMemo(() => {
    const counts = vehicleLogs
      .filter(l => l.paymentMethod)
      .reduce((acc, log) => {
        acc[log.paymentMethod!] = (acc[log.paymentMethod!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // If no data yet, show placeholder
    if (Object.keys(counts).length === 0) {
      return [
        { name: 'FASTag', value: 0 },
        { name: 'UPI', value: 0 },
        { name: 'Cash', value: 0 },
      ];
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vehicleLogs]);

  // Vehicle type distribution from real logs
  const vehicleTypeData = useMemo(() => {
    const counts = vehicleLogs
      .reduce((acc, log) => {
        const type = log.vehicleType || 'car';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return (['car', 'suv', 'bike', 'ev'] as VehicleType[]).map(type => ({
      name: VEHICLE_TYPE_CONFIG[type].label,
      icon: VEHICLE_TYPE_CONFIG[type].icon,
      count: counts[type] || 0,
    }));
  }, [vehicleLogs]);

  // Revenue trend from real logs
  const dailyTrend = useMemo(() => {
    const days: Record<string, { revenue: number; vehicles: number }> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayNames[d.getDay()];
      days[key] = { revenue: 0, vehicles: 0 };
    }

    vehicleLogs
      .filter(l => l.status === 'completed' && l.exitTime)
      .forEach(log => {
        const exitDate = new Date(log.exitTime!);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (exitDate >= weekAgo) {
          const key = dayNames[exitDate.getDay()];
          if (days[key]) {
            days[key].revenue += log.amount || 0;
            days[key].vehicles += 1;
          }
        }
      });

    return Object.entries(days).map(([day, data]) => ({
      day,
      revenue: data.revenue,
      vehicles: data.vehicles,
    }));
  }, [vehicleLogs]);

  // Vivid, sleek colors for the charts
  const COLORS = ['hsl(var(--primary))', 'hsl(280, 80%, 65%)', 'hsl(150, 80%, 50%)', 'hsl(45, 90%, 55%)'];

  const completedCount = vehicleLogs.filter(l => l.status === 'completed').length;
  const hasData = vehicleLogs.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Revenue & <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            {hasData ? 'Real-time insights from your parking data' : 'Park vehicles to see real analytics data'}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} icon={IndianRupee} variant="success" />
          <StatsCard title="Weekly Revenue" value={`₹${stats.weeklyRevenue.toLocaleString()}`} icon={TrendingUp} variant="default" />
          <StatsCard title="Avg. Stay Duration" value={`${stats.averageStayDuration}h`} icon={Clock} variant="default" />
          <StatsCard title="Violation Rate" value={`${stats.totalSlots > 0 ? ((stats.violations / stats.totalSlots) * 100).toFixed(1) : 0}%`} icon={AlertTriangle} variant="danger" />
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
                <span className="text-sm font-medium">Pricing Status</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date().getHours() >= 10 && new Date().getHours() <= 14
                  ? '🔴 Peak hour pricing active (1.5× surge)'
                  : new Date().getHours() >= 18 && new Date().getHours() <= 21
                  ? '🔴 Evening peak pricing active (1.5× surge)'
                  : '🟢 Off-peak rates — standard pricing active'}
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">Capacity Status</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.totalSlots > 0
                  ? `${((stats.occupied / stats.totalSlots) * 100).toFixed(0)}% occupied. ${stats.available} slots free across all floors.`
                  : 'Loading capacity data...'}
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Session Data</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {completedCount} completed sessions. {vehicleLogs.filter(l => l.status === 'active').length} vehicles currently parked.
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <OccupancyChart />
          <RevenueChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="glass-card-elevated p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Weekly Revenue Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${(value / 1000)}k`} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: 'hsl(var(--primary))', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods Pie */}
          <div className="glass-card-elevated p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="h-[300px]">
              {paymentMethods.some(p => p.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={paymentMethods} 
                      cx="50%" cy="50%" 
                      innerRadius={65} outerRadius={95} 
                      paddingAngle={8} 
                      cornerRadius={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 4px 8px ${COLORS[index % COLORS.length]}40)` }} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Complete some parking sessions to see payment distribution
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-8 pt-4 border-t border-border/40">
              {paymentMethods.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm font-medium">{entry.name} <span className="text-muted-foreground ml-1">({entry.value})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="glass-card-elevated p-6 mt-6">
          <h3 className="font-display text-lg font-semibold mb-4">Vehicle Type Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
