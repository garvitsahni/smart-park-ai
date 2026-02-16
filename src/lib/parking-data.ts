// Simulated parking data and AI agent logic

export interface ParkingSlot {
  id: string;
  floor: number;
  zone: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'violation';
  vehicleNumber?: string;
  entryTime?: Date;
  assignedBy?: string;
}

export interface VehicleLog {
  id: string;
  vehicleNumber: string;
  slotId: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: number;
  amount?: number;
  paymentMethod?: string;
  status: 'active' | 'completed' | 'violation';
}

export interface DashboardStats {
  totalSlots: number;
  occupied: number;
  available: number;
  violations: number;
  todayRevenue: number;
  weeklyRevenue: number;
  peakHour: string;
  averageStayDuration: number;
}

// Generate initial parking slots
export const generateParkingSlots = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  const zones = ['A', 'B', 'C', 'D'];
  const floors = [1, 2, 3];
  
  floors.forEach(floor => {
    zones.forEach(zone => {
      for (let i = 1; i <= 10; i++) {
        const isOccupied = Math.random() > 0.6;
        const isViolation = isOccupied && Math.random() > 0.9;
        
        slots.push({
          id: `${floor}-${zone}-${i}`,
          floor,
          zone,
          number: i,
          status: isViolation ? 'violation' : isOccupied ? 'occupied' : 'available',
          vehicleNumber: isOccupied ? generateVehicleNumber() : undefined,
          entryTime: isOccupied ? new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000) : undefined,
        });
      }
    });
  });
  
  return slots;
};

// Generate random vehicle number
export const generateVehicleNumber = (): string => {
  const states = ['MH', 'DL', 'KA', 'TN', 'GJ', 'UP', 'RJ'];
  const state = states[Math.floor(Math.random() * states.length)];
  const district = Math.floor(Math.random() * 50) + 1;
  const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                 String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${state}${district.toString().padStart(2, '0')}${series}${number}`;
};

// AI Slot Allocation Agent - Finds nearest available slot
export const findNearestSlot = (slots: ParkingSlot[], preferredFloor?: number): ParkingSlot | null => {
  const availableSlots = slots.filter(s => s.status === 'available');
  
  if (availableSlots.length === 0) return null;
  
  // Prefer ground floor, then lower zones
  const sortedSlots = availableSlots.sort((a, b) => {
    // Prioritize preferred floor if specified
    if (preferredFloor) {
      if (a.floor === preferredFloor && b.floor !== preferredFloor) return -1;
      if (b.floor === preferredFloor && a.floor !== preferredFloor) return 1;
    }
    
    // Then sort by floor (lower first)
    if (a.floor !== b.floor) return a.floor - b.floor;
    
    // Then by zone (A first)
    if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
    
    // Then by slot number
    return a.number - b.number;
  });
  
  return sortedSlots[0];
};

// AI Payment Agent - Calculate dynamic pricing
export const calculateParkingFee = (entryTime: Date, exitTime: Date = new Date()): { 
  duration: number; 
  baseFee: number; 
  dynamicMultiplier: number; 
  totalFee: number;
  breakdown: string[];
} => {
  const durationMs = exitTime.getTime() - entryTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // Base rate: ₹30 per hour
  const baseRate = 30;
  const baseFee = Math.ceil(durationHours) * baseRate;
  
  // Dynamic pricing based on peak hours (10 AM - 2 PM, 6 PM - 9 PM)
  const hour = new Date().getHours();
  const isPeakHour = (hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 21);
  const dynamicMultiplier = isPeakHour ? 1.5 : 1.0;
  
  const totalFee = Math.round(baseFee * dynamicMultiplier);
  
  const breakdown = [
    `Duration: ${Math.ceil(durationHours)} hour(s)`,
    `Base Rate: ₹${baseRate}/hr`,
    `Base Fee: ₹${baseFee}`,
    isPeakHour ? `Peak Hour Surge: 1.5x` : 'Off-Peak Rate: 1x',
    `Total: ₹${totalFee}`,
  ];
  
  return { duration: durationHours, baseFee, dynamicMultiplier, totalFee, breakdown };
};

// AI Compliance Agent - Check for violations
export const checkViolation = (assignedSlot: string, actualSlot: string): {
  isViolation: boolean;
  penalty: number;
  message: string;
} => {
  const isViolation = assignedSlot !== actualSlot;
  return {
    isViolation,
    penalty: isViolation ? 200 : 0,
    message: isViolation 
      ? `Violation detected! Vehicle parked in ${actualSlot} instead of assigned ${assignedSlot}. Penalty: ₹200`
      : 'No violation detected.',
  };
};

// AI Analytics Agent - Predict peak hours
export const predictPeakHours = (): { hour: number; occupancy: number }[] => {
  return [
    { hour: 6, occupancy: 15 },
    { hour: 7, occupancy: 25 },
    { hour: 8, occupancy: 45 },
    { hour: 9, occupancy: 60 },
    { hour: 10, occupancy: 75 },
    { hour: 11, occupancy: 85 },
    { hour: 12, occupancy: 90 },
    { hour: 13, occupancy: 88 },
    { hour: 14, occupancy: 82 },
    { hour: 15, occupancy: 70 },
    { hour: 16, occupancy: 65 },
    { hour: 17, occupancy: 72 },
    { hour: 18, occupancy: 85 },
    { hour: 19, occupancy: 92 },
    { hour: 20, occupancy: 88 },
    { hour: 21, occupancy: 75 },
    { hour: 22, occupancy: 50 },
    { hour: 23, occupancy: 30 },
  ];
};

// Generate mock vehicle logs
export const generateVehicleLogs = (): VehicleLog[] => {
  const logs: VehicleLog[] = [];
  const paymentMethods = ['FASTag', 'UPI', 'Card', 'Cash'];
  
  for (let i = 0; i < 50; i++) {
    const entryTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    const isCompleted = Math.random() > 0.3;
    const exitTime = isCompleted 
      ? new Date(entryTime.getTime() + Math.random() * 4 * 60 * 60 * 1000)
      : undefined;
    
    const duration = exitTime 
      ? (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
      : undefined;
    
    logs.push({
      id: `LOG-${1000 + i}`,
      vehicleNumber: generateVehicleNumber(),
      slotId: `${Math.floor(Math.random() * 3) + 1}-${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 10) + 1}`,
      entryTime,
      exitTime,
      duration,
      amount: duration ? Math.round(Math.ceil(duration) * 30 * (Math.random() > 0.5 ? 1.5 : 1)) : undefined,
      paymentMethod: isCompleted ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : undefined,
      status: Math.random() > 0.95 ? 'violation' : isCompleted ? 'completed' : 'active',
    });
  }
  
  return logs.sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());
};

// Generate revenue data
export const generateRevenueData = () => {
  const daily = [];
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (let i = 0; i < 7; i++) {
    daily.push({
      day: weekdays[i],
      revenue: Math.floor(Math.random() * 30000) + 20000,
      vehicles: Math.floor(Math.random() * 300) + 200,
    });
  }
  
  return daily;
};

// Get dashboard stats
export const getDashboardStats = (slots: ParkingSlot[]): DashboardStats => {
  const occupied = slots.filter(s => s.status === 'occupied' || s.status === 'violation').length;
  const violations = slots.filter(s => s.status === 'violation').length;
  
  return {
    totalSlots: slots.length,
    occupied,
    available: slots.length - occupied,
    violations,
    todayRevenue: Math.floor(Math.random() * 50000) + 30000,
    weeklyRevenue: Math.floor(Math.random() * 300000) + 200000,
    peakHour: '12:00 PM - 2:00 PM',
    averageStayDuration: 2.5,
  };
};
