import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/layout/Navbar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { VehicleLogsTable } from '@/components/dashboard/VehicleLogsTable';
import { DigitalTwin } from '@/components/dashboard/DigitalTwin';
import { CongestionPrediction } from '@/components/dashboard/CongestionPrediction';
import { DNABehaviorTable } from '@/components/dashboard/DNABehaviorTable';
import { CameraMonitor } from '@/components/dashboard/CameraMonitor';
import { ParkingCCTVFeed } from '@/components/dashboard/ParkingCCTVFeed';
import { HeatmapView } from '@/components/dashboard/HeatmapView';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car, ParkingCircle, AlertTriangle, IndianRupee, RefreshCw,
  TrendingUp, Clock, Bot, Eye, Shield, Zap, CalendarClock, RotateCcw, Camera, Flame
} from 'lucide-react';
import { predictExitCongestion, generateMockDNAScores } from '@/lib/parking-intelligence';

const AdminDashboard = () => {
  const { slots, vehicleLogs, stats, refreshStats, activeSessions, reservations, resetAllData } = useParking();
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useTranslation();

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
              {t('admin.title1')} <span className="gradient-text">{t('admin.title2')}</span>
            </h1>
            <p className="text-muted-foreground">{t('admin.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="heroOutline" onClick={refreshStats} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('admin.refresh')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllData}
              className="text-muted-foreground hover:text-destructive"
              title="Reset all data"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* AI Agents Status */}
        <div className="glass-card p-4 mb-8 flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-medium">{t('admin.agents')}</span>
          </div>
          {[
            { name: t('admin.agentNames.allocation'), status: 'active' },
            { name: t('admin.agentNames.compliance'), status: 'active' },
            { name: t('admin.agentNames.payment'), status: 'active' },
            { name: t('admin.agentNames.prediction'), status: 'active' },
            { name: t('admin.agentNames.dna'), status: 'active' },
          ].map(agent => (
            <div key={agent.name} className="flex items-center gap-2 shrink-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-400">{agent.name}</span>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 items-center">
            <TabsTrigger value="overview" className="gap-2"><ParkingCircle className="w-4 h-4" /><span className="hidden md:inline">{t('admin.tabs.overview')}</span></TabsTrigger>
            <TabsTrigger value="cameras" className="gap-2"><Camera className="w-4 h-4" /><span className="hidden md:inline">{t('admin.tabs.cameras')}</span></TabsTrigger>
            <TabsTrigger value="digital-twin" className="gap-2"><Eye className="w-4 h-4" /><span className="hidden md:inline">{t('admin.tabs.twin')}</span></TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-2"><Flame className="w-4 h-4" /><span className="hidden md:inline">{t('admin.tabs.heatmap')}</span></TabsTrigger>
            <TabsTrigger value="congestion" className="gap-2"><Zap className="w-4 h-4" /><span className="hidden md:inline">{t('admin.tabs.exitAI')}</span></TabsTrigger>
            <TabsTrigger value="dna" className="gap-2"><Shield className="w-4 h-4" /><span className="hidden md:inline">{t('admin.tabs.dna')}</span></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title={t('admin.stats.totalSlots')} value={stats.totalSlots} icon={ParkingCircle} variant="default" />
              <StatsCard title={t('admin.stats.available')} value={stats.available} icon={Car} variant="success" />
              <StatsCard title={t('admin.stats.occupied')} value={stats.occupied} icon={Car} variant="warning" subtitle={`${stats.totalSlots > 0 ? ((stats.occupied / stats.totalSlots) * 100).toFixed(0) : 0}% ${t('admin.stats.utilization')}`} />
              <StatsCard title={t('admin.stats.violations')} value={stats.violations} icon={AlertTriangle} variant="danger" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard title={t('admin.stats.todayRevenue')} value={`₹${stats.todayRevenue.toLocaleString()}`} icon={IndianRupee} variant="success" />
              <StatsCard title={t('admin.stats.weeklyRevenue')} value={`₹${stats.weeklyRevenue.toLocaleString()}`} icon={TrendingUp} variant="default" />
              <StatsCard title={t('admin.stats.activeSessions')} value={activeSessions.length} icon={Clock} variant="default" subtitle={`${stats.totalVehiclesToday} ${t('admin.stats.vehiclesToday')}`} />
              <StatsCard title={t('admin.stats.reservations')} value={reservations.filter(r => r.status === 'upcoming').length} icon={CalendarClock} variant="default" />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <OccupancyChart />
              <RevenueChart />
            </div>
            <VehicleLogsTable logs={vehicleLogs} limit={10} />
          </TabsContent>

          <TabsContent value="cameras">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-[400px]">
               <CameraMonitor />
               <ParkingCCTVFeed zoneName="Floor 1 - Zone A" floorFilter={1} zoneFilter="A" />
               <ParkingCCTVFeed zoneName="Floor 1 - Zone B" floorFilter={1} zoneFilter="B" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-[400px] mt-6">
               <ParkingCCTVFeed zoneName="Roof Parking - Zone A" floorFilter={3} zoneFilter="A" />
               <div className="glass-card flex items-center justify-center text-muted-foreground border-dashed border-2 bg-secondary/10 hover:bg-secondary/30 transition-colors cursor-pointer min-h-[400px]">
                 <span className="flex flex-col items-center gap-2"><Camera className="w-8 h-8 opacity-50"/> Add Camera Stream</span>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="digital-twin">
            <DigitalTwin slots={slots} congestionPrediction={congestionPrediction} />
          </TabsContent>

          <TabsContent value="heatmap">
            <HeatmapView />
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
