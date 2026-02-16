import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { VehicleLogsTable } from '@/components/dashboard/VehicleLogsTable';
import { DigitalTwin } from '@/components/dashboard/DigitalTwin';
import { CongestionPrediction } from '@/components/dashboard/CongestionPrediction';
import { DNABehaviorTable } from '@/components/dashboard/DNABehaviorTable';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, ParkingCircle, AlertTriangle, IndianRupee, RefreshCw,
  TrendingUp, Clock, Bot, Eye, Shield, Zap
} from 'lucide-react';
import { predictExitCongestion, generateMockDNAScores } from '@/lib/parking-intelligence';

const AdminDashboard = () => {
  const { slots, vehicleLogs, stats, refreshData } = useParking();
  const [activeTab, setActiveTab] = useState('overview');

  // Generate congestion prediction
  const congestionPrediction = useMemo(() => {
    const activeVehicles = slots
      .filter(s => s.status === 'occupied' && s.vehicleNumber && s.entryTime)
      .map(s => ({ vehicleNumber: s.vehicleNumber!, entryTime: s.entryTime! }));
    return predictExitCongestion(activeVehicles);
  }, [slots]);

  // Generate DNA scores for all vehicles
  const dnaScores = useMemo(() => {
    const vehicleNumbers = vehicleLogs.map(l => l.vehicleNumber);
    const uniqueVehicles = [...new Set(vehicleNumbers)];
    return generateMockDNAScores(uniqueVehicles.slice(0, 20));
  }, [vehicleLogs]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Real-time parking management with AI intelligence</p>
          </div>
          <Button variant="heroOutline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* AI Agents Status */}
        <div className="glass-card p-4 mb-8 flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-medium">AI Agents:</span>
          </div>
          {[
            { name: 'Slot Allocation', status: 'active' },
            { name: 'Compliance', status: 'active' },
            { name: 'Payment', status: 'active' },
            { name: 'Exit Prediction', status: 'active' },
            { name: 'DNA Scoring', status: 'active' },
          ].map(agent => (
            <div key={agent.name} className="flex items-center gap-2 shrink-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-400">{agent.name}</span>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2"><ParkingCircle className="w-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="digital-twin" className="gap-2"><Eye className="w-4 h-4" />Digital Twin</TabsTrigger>
            <TabsTrigger value="congestion" className="gap-2"><Zap className="w-4 h-4" />Exit AI</TabsTrigger>
            <TabsTrigger value="dna" className="gap-2"><Shield className="w-4 h-4" />DNA Scores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Slots" value={stats.totalSlots} icon={ParkingCircle} variant="default" />
              <StatsCard title="Available" value={stats.available} icon={Car} variant="success" trend={{ value: 12, isPositive: true }} />
              <StatsCard title="Occupied" value={stats.occupied} icon={Car} variant="warning" subtitle={`${((stats.occupied / stats.totalSlots) * 100).toFixed(0)}% utilization`} />
              <StatsCard title="Violations" value={stats.violations} icon={AlertTriangle} variant="danger" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} icon={IndianRupee} variant="success" trend={{ value: 8, isPositive: true }} />
              <StatsCard title="Weekly Revenue" value={`₹${stats.weeklyRevenue.toLocaleString()}`} icon={TrendingUp} variant="default" />
              <StatsCard title="Peak Hours" value={stats.peakHour} subtitle={`Avg. stay: ${stats.averageStayDuration}h`} icon={Clock} variant="default" />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <OccupancyChart />
              <RevenueChart />
            </div>
            <VehicleLogsTable logs={vehicleLogs} limit={10} />
          </TabsContent>

          <TabsContent value="digital-twin">
            <DigitalTwin slots={slots} congestionPrediction={congestionPrediction} />
          </TabsContent>

          <TabsContent value="congestion">
            <CongestionPrediction prediction={congestionPrediction} />
          </TabsContent>

          <TabsContent value="dna">
            <DNABehaviorTable scores={dnaScores} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
