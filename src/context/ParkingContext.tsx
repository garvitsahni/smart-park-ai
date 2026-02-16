import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ParkingSlot, 
  VehicleLog, 
  DashboardStats,
  generateParkingSlots, 
  generateVehicleLogs,
  getDashboardStats,
  findNearestSlot,
  calculateParkingFee,
} from '@/lib/parking-data';

interface ActiveSession {
  vehicleNumber: string;
  assignedSlot: ParkingSlot;
  entryTime: Date;
}

interface ParkingContextType {
  slots: ParkingSlot[];
  vehicleLogs: VehicleLog[];
  stats: DashboardStats;
  activeSession: ActiveSession | null;
  theme: 'dark' | 'light';
  
  // Actions
  startParking: (vehicleNumber: string) => ParkingSlot | null;
  endParking: (paymentMethod: string) => { fee: number; breakdown: string[] } | null;
  toggleTheme: () => void;
  refreshData: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSlots: 0,
    occupied: 0,
    available: 0,
    violations: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    peakHour: '',
    averageStayDuration: 0,
  });
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const refreshData = () => {
    const newSlots = generateParkingSlots();
    setSlots(newSlots);
    setVehicleLogs(generateVehicleLogs());
    setStats(getDashboardStats(newSlots));
  };

  const startParking = (vehicleNumber: string): ParkingSlot | null => {
    const nearestSlot = findNearestSlot(slots);
    
    if (!nearestSlot) return null;

    const entryTime = new Date();
    
    // Update slot status
    setSlots(prev => prev.map(slot => 
      slot.id === nearestSlot.id 
        ? { ...slot, status: 'occupied' as const, vehicleNumber, entryTime, assignedBy: 'AI Allocation Agent' }
        : slot
    ));

    // Add to logs
    const newLog: VehicleLog = {
      id: `LOG-${Date.now()}`,
      vehicleNumber,
      slotId: nearestSlot.id,
      entryTime,
      status: 'active',
    };
    setVehicleLogs(prev => [newLog, ...prev]);

    // Set active session
    const session: ActiveSession = {
      vehicleNumber,
      assignedSlot: { ...nearestSlot, status: 'occupied', vehicleNumber, entryTime },
      entryTime,
    };
    setActiveSession(session);

    // Update stats
    setStats(prev => ({
      ...prev,
      occupied: prev.occupied + 1,
      available: prev.available - 1,
    }));

    return nearestSlot;
  };

  const endParking = (paymentMethod: string): { fee: number; breakdown: string[] } | null => {
    if (!activeSession) return null;

    const { totalFee, breakdown } = calculateParkingFee(activeSession.entryTime);

    // Update slot status
    setSlots(prev => prev.map(slot => 
      slot.id === activeSession.assignedSlot.id 
        ? { ...slot, status: 'available' as const, vehicleNumber: undefined, entryTime: undefined }
        : slot
    ));

    // Update log
    setVehicleLogs(prev => prev.map(log => 
      log.vehicleNumber === activeSession.vehicleNumber && log.status === 'active'
        ? { 
            ...log, 
            exitTime: new Date(), 
            duration: (Date.now() - activeSession.entryTime.getTime()) / (1000 * 60 * 60),
            amount: totalFee,
            paymentMethod,
            status: 'completed' as const,
          }
        : log
    ));

    // Update stats
    setStats(prev => ({
      ...prev,
      occupied: prev.occupied - 1,
      available: prev.available + 1,
      todayRevenue: prev.todayRevenue + totalFee,
    }));

    setActiveSession(null);

    return { fee: totalFee, breakdown };
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ParkingContext.Provider value={{
      slots,
      vehicleLogs,
      stats,
      activeSession,
      theme,
      startParking,
      endParking,
      toggleTheme,
      refreshData,
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
