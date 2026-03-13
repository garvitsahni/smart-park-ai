// Smart Park AI — Core Parking Data & AI Agent Logic
// Now with vehicle types, enhanced pricing, and real calculations

export type VehicleType = 'car' | 'suv' | 'bike' | 'ev';

export interface ParkingSlot {
  id: string;
  floor: number;
  zone: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'violation';
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  entryTime?: Date;
  assignedBy?: string;
  reservedUntil?: Date;
  reservedBy?: string;
  hasEvCharger?: boolean;
  isAccessible?: boolean;
}

export interface VehicleLog {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  slotId: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: number;
  amount?: number;
  paymentMethod?: string;
  status: 'active' | 'completed' | 'violation';
  ticketId: string;
}

export interface Reservation {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  slotId: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface DashboardStats {
  totalSlots: number;
  occupied: number;
  available: number;
  reserved: number;
  violations: number;
  todayRevenue: number;
  weeklyRevenue: number;
  peakHour: string;
  averageStayDuration: number;
  totalVehiclesToday: number;
  evSlotsAvailable: number;
}

export interface ActiveSession {
  vehicleNumber: string;
  vehicleType: VehicleType;
  assignedSlot: ParkingSlot;
  entryTime: Date;
  ticketId: string;
}

// Vehicle type configuration
export const VEHICLE_TYPE_CONFIG: Record<VehicleType, { label: string; icon: string; ratePerHour: number; color: string }> = {
  car: { label: 'Car', icon: '🚗', ratePerHour: 30, color: 'from-blue-500 to-indigo-500' },
  suv: { label: 'SUV', icon: '🚙', ratePerHour: 45, color: 'from-purple-500 to-violet-500' },
  bike: { label: 'Bike', icon: '🏍️', ratePerHour: 15, color: 'from-green-500 to-emerald-500' },
  ev: { label: 'EV', icon: '⚡', ratePerHour: 25, color: 'from-cyan-500 to-teal-500' },
};

// Indian vehicle plate regex validation
export const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/;

export const validateVehicleNumber = (num: string): boolean => {
  return VEHICLE_NUMBER_REGEX.test(num.replace(/\s/g, '').toUpperCase());
};

// Generate initial parking slots (only called once, on first install)
export const generateParkingSlots = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  const zones = ['A', 'B', 'C', 'D'];
  const floors = [1, 2, 3];

  floors.forEach(floor => {
    zones.forEach(zone => {
      for (let i = 1; i <= 10; i++) {
        // EV chargers: Floor 1, Zone A, slots 1-3
        const hasEvCharger = floor === 1 && zone === 'A' && i <= 3;
        // Accessible (Old Age/Handicapped): Floor 1, Zone B, slots 1-3
        const isAccessible = floor === 1 && zone === 'B' && i <= 3;

        slots.push({
          id: `${floor}-${zone}-${i}`,
          floor,
          zone,
          number: i,
          status: 'available',
          hasEvCharger,
          isAccessible,
        });
      }
    });
  });

  return slots;
};

// Generate random vehicle number (for demo seeding only)
export const generateVehicleNumber = (): string => {
  const states = ['MH', 'DL', 'KA', 'TN', 'GJ', 'UP', 'RJ'];
  const state = states[Math.floor(Math.random() * states.length)];
  const district = Math.floor(Math.random() * 50) + 1;
  const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                 String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${state}${district.toString().padStart(2, '0')}${series}${number}`;
};

// Generate ticket ID
export const generateTicketId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

// AI Slot Allocation Agent — Finds optimal available slot
export const findNearestSlot = (
  slots: ParkingSlot[],
  vehicleType?: VehicleType,
  preferredFloor?: number,
  needsAccessible?: boolean
): ParkingSlot | null => {
  let availableSlots = slots.filter(s => s.status === 'available');

  if (availableSlots.length === 0) return null;

  // EV vehicles prefer slots with chargers
  if (vehicleType === 'ev') {
    const evSlots = availableSlots.filter(s => s.hasEvCharger);
    if (evSlots.length > 0) {
      availableSlots = evSlots;
    }
  }

  // Accessibility preference
  if (needsAccessible) {
    const accessibleSlots = availableSlots.filter(s => s.isAccessible);
    if (accessibleSlots.length > 0) {
      availableSlots = accessibleSlots;
    }
  }

  // Bikes prefer specific zones (D — deeper, less traffic)
  if (vehicleType === 'bike') {
    const bikeSlots = availableSlots.filter(s => s.zone === 'D' || s.zone === 'C');
    if (bikeSlots.length > 0) {
      availableSlots = bikeSlots;
    }
  }

  const sortedSlots = availableSlots.sort((a, b) => {
    if (preferredFloor) {
      if (a.floor === preferredFloor && b.floor !== preferredFloor) return -1;
      if (b.floor === preferredFloor && a.floor !== preferredFloor) return 1;
    }

    if (a.floor !== b.floor) return a.floor - b.floor;
    if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
    return a.number - b.number;
  });

  return sortedSlots[0];
};

// AI Payment Agent — Enhanced dynamic pricing
export const calculateParkingFee = (
  entryTime: Date,
  exitTime: Date = new Date(),
  vehicleType: VehicleType = 'car',
  trustScore?: number
): {
  duration: number;
  baseFee: number;
  dynamicMultiplier: number;
  trustDiscount: number;
  totalFee: number;
  breakdown: string[];
} => {
  const durationMs = exitTime.getTime() - entryTime.getTime();
  const durationHours = Math.max(durationMs / (1000 * 60 * 60), 0);

  // Vehicle-type-based rate
  const config = VEHICLE_TYPE_CONFIG[vehicleType];
  const baseRate = config.ratePerHour;

  // Grace period: first 10 minutes free
  const billableHours = durationHours <= (10 / 60) ? 0 : Math.ceil(durationHours);
  const baseFee = billableHours * baseRate;

  // Dynamic pricing based on peak hours
  const hour = new Date().getHours();
  const isPeakHour = (hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 21);
  const isWeekend = [0, 6].includes(new Date().getDay());
  let dynamicMultiplier = 1.0;
  if (isPeakHour) dynamicMultiplier = 1.5;
  if (isWeekend) dynamicMultiplier *= 0.85; // Weekend discount

  // Trust score discount
  let trustDiscount = 0;
  if (trustScore && trustScore >= 80) {
    trustDiscount = 0.15; // 15% off for trusted
  } else if (trustScore && trustScore >= 60) {
    trustDiscount = 0.08; // 8% off for established
  }

  const afterDynamic = Math.round(baseFee * dynamicMultiplier);
  const discountAmount = Math.round(afterDynamic * trustDiscount);
  const totalFee = Math.max(0, afterDynamic - discountAmount);

  const breakdown = [
    `Duration: ${billableHours === 0 ? 'Grace period' : `${billableHours} hour(s)`}`,
    `Vehicle: ${config.label} (₹${baseRate}/hr)`,
    `Base Fee: ₹${baseFee}`,
    isPeakHour ? `Peak Hour Surge: 1.5×` : 'Off-Peak Rate: 1×',
    ...(isWeekend ? ['Weekend Discount: 15% off'] : []),
    ...(trustDiscount > 0 ? [`Trust Discount: ${Math.round(trustDiscount * 100)}% off (-₹${discountAmount})`] : []),
    `Total: ₹${totalFee}`,
  ];

  return { duration: durationHours, baseFee, dynamicMultiplier, trustDiscount, totalFee, breakdown };
};

// AI Compliance Agent — Check for violations
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

// AI Analytics Agent — Predict peak hours
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

// Generate revenue data from real logs
export const generateRevenueFromLogs = (logs: VehicleLog[]) => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMap: Record<string, { revenue: number; vehicles: number }> = {};

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = weekdays[date.getDay()];
    dailyMap[key] = { revenue: 0, vehicles: 0 };
  }

  // Aggregate from logs
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  logs.forEach(log => {
    if (log.status === 'completed' && log.exitTime && new Date(log.exitTime) >= weekAgo) {
      const day = weekdays[new Date(log.exitTime).getDay()];
      if (dailyMap[day]) {
        dailyMap[day].revenue += log.amount || 0;
        dailyMap[day].vehicles += 1;
      }
    }
  });

  return Object.entries(dailyMap).map(([day, data]) => ({
    day,
    revenue: data.revenue,
    vehicles: data.vehicles,
  }));
};

// Get dashboard stats — computed from real data
export const getDashboardStats = (slots: ParkingSlot[], logs: VehicleLog[] = []): DashboardStats => {
  const occupied = slots.filter(s => s.status === 'occupied' || s.status === 'violation').length;
  const reserved = slots.filter(s => s.status === 'reserved').length;
  const violations = slots.filter(s => s.status === 'violation').length;
  const evAvailable = slots.filter(s => s.hasEvCharger && s.status === 'available').length;

  // Compute revenue from real logs
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayRevenue = logs
    .filter(l => l.status === 'completed' && l.exitTime && new Date(l.exitTime) >= todayStart)
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const weeklyRevenue = logs
    .filter(l => l.status === 'completed' && l.exitTime && new Date(l.exitTime) >= weekAgo)
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const todayVehicles = logs
    .filter(l => new Date(l.entryTime) >= todayStart)
    .length;

  // Average stay duration from completed logs
  const completedLogs = logs.filter(l => l.status === 'completed' && l.duration);
  const avgDuration = completedLogs.length > 0
    ? Math.round((completedLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / completedLogs.length) * 10) / 10
    : 0;

  return {
    totalSlots: slots.length,
    occupied,
    available: slots.length - occupied - reserved,
    reserved,
    violations,
    todayRevenue,
    weeklyRevenue,
    peakHour: '12:00 PM - 2:00 PM',
    averageStayDuration: avgDuration,
    totalVehiclesToday: todayVehicles,
    evSlotsAvailable: evAvailable,
  };
};
