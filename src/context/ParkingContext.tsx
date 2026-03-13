import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ParkingSlot,
  VehicleLog,
  DashboardStats,
  ActiveSession,
  Reservation,
  VehicleType,
  generateParkingSlots,
  getDashboardStats,
  findNearestSlot,
  calculateParkingFee,
  generateTicketId,
} from '@/lib/parking-data';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface ParkingContextType {
  slots: ParkingSlot[];
  vehicleLogs: VehicleLog[];
  stats: DashboardStats;
  activeSessions: ActiveSession[];
  reservations: Reservation[];
  theme: 'dark' | 'light';

  // Actions
  startParking: (vehicleNumber: string, vehicleType?: VehicleType, preferredSlotId?: string, needsAccessible?: boolean) => ParkingSlot | null;
  endParking: (vehicleNumber: string, paymentMethod: string) => { fee: number; breakdown: string[] } | null;
  reserveSlot: (vehicleNumber: string, vehicleType: VehicleType, startTime: Date, endTime: Date) => Reservation | null;
  cancelReservation: (reservationId: string) => void;
  toggleTheme: () => void;
  refreshStats: () => void;
  resetAllData: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize slots from storage, or generate fresh on first run
  const [slots, setSlots] = useState<ParkingSlot[]>(() => {
    const stored = storage.get<ParkingSlot[]>(STORAGE_KEYS.SLOTS, []);
    if (stored.length > 0) return stored;
    const fresh = generateParkingSlots();
    storage.set(STORAGE_KEYS.SLOTS, fresh);
    return fresh;
  });

  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>(() => {
    return storage.get<VehicleLog[]>(STORAGE_KEYS.LOGS, []);
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => {
    return storage.get<ActiveSession[]>(STORAGE_KEYS.SESSIONS, []);
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    return storage.get<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []);
  });

  const [stats, setStats] = useState<DashboardStats>(() => getDashboardStats(
    storage.get<ParkingSlot[]>(STORAGE_KEYS.SLOTS, []),
    storage.get<VehicleLog[]>(STORAGE_KEYS.LOGS, [])
  ));

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Persist to localStorage on changes
  useEffect(() => { storage.set(STORAGE_KEYS.SLOTS, slots); }, [slots]);
  useEffect(() => { storage.set(STORAGE_KEYS.LOGS, vehicleLogs); }, [vehicleLogs]);
  useEffect(() => { storage.set(STORAGE_KEYS.SESSIONS, activeSessions); }, [activeSessions]);
  useEffect(() => { storage.set(STORAGE_KEYS.RESERVATIONS, reservations); }, [reservations]);

  // Update stats when slots or logs change
  useEffect(() => {
    setStats(getDashboardStats(slots, vehicleLogs));
  }, [slots, vehicleLogs]);

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Check and expire reservations every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setReservations(prev => {
        let changed = false;
        const updated = prev.map(r => {
          if (r.status === 'upcoming' && new Date(r.endTime) < now) {
            changed = true;
            // Free the slot
            setSlots(prevSlots => prevSlots.map(s =>
              s.id === r.slotId && s.status === 'reserved'
                ? { ...s, status: 'available' as const, reservedBy: undefined, reservedUntil: undefined }
                : s
            ));
            return { ...r, status: 'cancelled' as const };
          }
          return r;
        });
        return changed ? updated : prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const refreshStats = useCallback(() => {
    setStats(getDashboardStats(slots, vehicleLogs));
  }, [slots, vehicleLogs]);

  const startParking = (vehicleNumber: string, vehicleType: VehicleType = 'car', preferredSlotId?: string, needsAccessible?: boolean): ParkingSlot | null => {
    // Check if vehicle is already parked
    if (activeSessions.some(s => s.vehicleNumber === vehicleNumber)) {
      return null;
    }

    let targetSlot: ParkingSlot | undefined;
    
    // Check if preferred slot is available
    if (preferredSlotId) {
      const pref = slots.find(s => s.id === preferredSlotId);
      if (pref && pref.status === 'available') {
        targetSlot = pref;
      }
    }

    // Fallback to auto-assignment
    if (!targetSlot) {
      targetSlot = findNearestSlot(slots, vehicleType, undefined, needsAccessible) || undefined;
    }

    if (!targetSlot) return null;

    const entryTime = new Date();
    const ticketId = generateTicketId();

    // Update slot status
    setSlots(prev => prev.map(slot =>
      slot.id === targetSlot!.id
        ? {
            ...slot,
            status: 'occupied' as const,
            vehicleNumber,
            vehicleType,
            entryTime,
            assignedBy: 'AI Allocation Agent',
          }
        : slot
    ));

    // Add to logs
    const newLog: VehicleLog = {
      id: `LOG-${Date.now()}`,
      vehicleNumber,
      vehicleType,
      slotId: targetSlot!.id,
      entryTime,
      status: 'active',
      ticketId,
    };
    setVehicleLogs(prev => [newLog, ...prev]);

    // Create active session
    const session: ActiveSession = {
      vehicleNumber,
      vehicleType,
      assignedSlot: { ...targetSlot!, status: 'occupied', vehicleNumber, vehicleType, entryTime },
      entryTime,
      ticketId,
    };
    setActiveSessions(prev => [...prev, session]);

    return targetSlot!;
  };

  const endParking = (vehicleNumber: string, paymentMethod: string): { fee: number; breakdown: string[] } | null => {
    const session = activeSessions.find(s => s.vehicleNumber === vehicleNumber);
    if (!session) return null;

    const { totalFee, breakdown } = calculateParkingFee(
      new Date(session.entryTime),
      new Date(),
      session.vehicleType
    );

    // Update slot status
    setSlots(prev => prev.map(slot =>
      slot.id === session.assignedSlot.id
        ? { ...slot, status: 'available' as const, vehicleNumber: undefined, vehicleType: undefined, entryTime: undefined, assignedBy: undefined }
        : slot
    ));

    // Update log
    const exitTime = new Date();
    const duration = (exitTime.getTime() - new Date(session.entryTime).getTime()) / (1000 * 60 * 60);
    setVehicleLogs(prev => prev.map(log =>
      log.vehicleNumber === vehicleNumber && log.status === 'active'
        ? {
            ...log,
            exitTime,
            duration,
            amount: totalFee,
            paymentMethod,
            status: 'completed' as const,
          }
        : log
    ));

    // Remove from active sessions
    setActiveSessions(prev => prev.filter(s => s.vehicleNumber !== vehicleNumber));

    return { fee: totalFee, breakdown };
  };

  const reserveSlot = (
    vehicleNumber: string,
    vehicleType: VehicleType,
    startTime: Date,
    endTime: Date
  ): Reservation | null => {
    const slot = findNearestSlot(slots, vehicleType);
    if (!slot) return null;

    // Mark slot as reserved
    setSlots(prev => prev.map(s =>
      s.id === slot.id
        ? { ...s, status: 'reserved' as const, reservedBy: vehicleNumber, reservedUntil: endTime }
        : s
    ));

    const reservation: Reservation = {
      id: `RES-${Date.now()}`,
      vehicleNumber,
      vehicleType,
      slotId: slot.id,
      startTime,
      endTime,
      status: 'upcoming',
      createdAt: new Date(),
    };

    setReservations(prev => [reservation, ...prev]);
    return reservation;
  };

  const cancelReservation = (reservationId: string): void => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    // Free the slot
    setSlots(prev => prev.map(s =>
      s.id === reservation.slotId && s.status === 'reserved'
        ? { ...s, status: 'available' as const, reservedBy: undefined, reservedUntil: undefined }
        : s
    ));

    setReservations(prev => prev.map(r =>
      r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
    ));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const resetAllData = () => {
    storage.clear();
    const fresh = generateParkingSlots();
    setSlots(fresh);
    setVehicleLogs([]);
    setActiveSessions([]);
    setReservations([]);
    storage.set(STORAGE_KEYS.SLOTS, fresh);
  };

  return (
    <ParkingContext.Provider value={{
      slots,
      vehicleLogs,
      stats,
      activeSessions,
      reservations,
      theme,
      startParking,
      endParking,
      reserveSlot,
      cancelReservation,
      toggleTheme,
      refreshStats,
      resetAllData,
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
