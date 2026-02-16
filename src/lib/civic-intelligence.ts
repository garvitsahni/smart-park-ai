// Civic Intelligence Layer - Ethical AI for Public Infrastructure
// Rule-based, explainable, privacy-first

// ============================================
// YOLO-Style Computer Vision Simulation
// ============================================

export type VehicleState = 'approaching' | 'entering' | 'parked' | 'exiting' | 'departed';
export type SlotState = 'idle' | 'reserved' | 'occupied' | 'exiting';

export interface VisionDetection {
  id: string;
  timestamp: Date;
  type: 'vehicle_entry' | 'vehicle_exit' | 'occupancy_change' | 'impact_event';
  confidence: number;
  details: {
    vehicleType?: 'car' | 'suv' | 'bike' | 'ev';
    color?: string;
    partialPlate?: string;
    slotId?: string;
  };
  isAIAssistance: boolean; // Always true - transparency
}

export const simulateVisionDetection = (
  eventType: VisionDetection['type'],
  vehicleInfo?: Partial<VisionDetection['details']>
): VisionDetection => {
  const colors = ['White', 'Silver', 'Black', 'Blue', 'Red', 'Grey'];
  const types: VisionDetection['details']['vehicleType'][] = ['car', 'suv', 'bike', 'ev'];
  
  return {
    id: `VIS-${Date.now()}`,
    timestamp: new Date(),
    type: eventType,
    confidence: 85 + Math.random() * 12, // 85-97%
    details: {
      vehicleType: vehicleInfo?.vehicleType || types[Math.floor(Math.random() * types.length)],
      color: vehicleInfo?.color || colors[Math.floor(Math.random() * colors.length)],
      partialPlate: vehicleInfo?.partialPlate || `**${Math.random().toString(36).substring(2, 4).toUpperCase()}**`,
      slotId: vehicleInfo?.slotId,
    },
    isAIAssistance: true,
  };
};

// ============================================
// Intent Prediction (Enhanced)
// ============================================

export interface IntentPrediction {
  predictedDuration: 'short' | 'medium' | 'long';
  durationHours: number;
  confidence: number;
  factors: string[];
  explanation: string;
}

export const predictParkingIntent = (
  timeOfDay: number,
  dayOfWeek: number,
  vehicleHistory?: { avgDuration: number; visitCount: number }
): IntentPrediction => {
  const factors: string[] = [];
  let durationHours = 2; // Default
  let confidence = 70;

  // Time-based patterns
  if (timeOfDay >= 9 && timeOfDay <= 11) {
    factors.push('Morning arrival suggests work-related visit');
    durationHours = 4;
  } else if (timeOfDay >= 12 && timeOfDay <= 14) {
    factors.push('Lunch hour arrival suggests short dining visit');
    durationHours = 1.5;
  } else if (timeOfDay >= 17 && timeOfDay <= 20) {
    factors.push('Evening arrival suggests shopping or entertainment');
    durationHours = 2.5;
  } else if (timeOfDay >= 20) {
    factors.push('Late evening suggests movie or dining');
    durationHours = 3;
  }

  // Day of week patterns
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    factors.push('Weekend typically means leisure activities');
    durationHours *= 1.2;
  }

  // Historical patterns
  if (vehicleHistory && vehicleHistory.visitCount > 3) {
    factors.push(`Based on ${vehicleHistory.visitCount} previous visits`);
    durationHours = (durationHours + vehicleHistory.avgDuration) / 2;
    confidence += 15;
  }

  const predictedDuration: IntentPrediction['predictedDuration'] = 
    durationHours <= 1.5 ? 'short' : durationHours <= 3 ? 'medium' : 'long';

  return {
    predictedDuration,
    durationHours: Math.round(durationHours * 10) / 10,
    confidence: Math.min(95, confidence),
    factors,
    explanation: `Based on arrival time and patterns, we suggest a ${predictedDuration}-stay parking area for easier access.`,
  };
};

// ============================================
// Future Availability Preview
// ============================================

export interface FutureSlotPrediction {
  timeFrame: string;
  predictedOpenings: number;
  zones: { zone: string; expectedSlots: number }[];
  confidence: number;
  explanation: string;
}

export const predictFutureAvailability = (
  currentOccupancy: number,
  totalSlots: number,
  activeVehicles: { entryTime: Date; predictedDuration?: number }[]
): FutureSlotPrediction => {
  const now = new Date();
  let expectedExits = 0;
  
  activeVehicles.forEach(v => {
    const duration = v.predictedDuration || 2;
    const expectedExitTime = new Date(v.entryTime.getTime() + duration * 60 * 60 * 1000);
    const timeUntilExit = (expectedExitTime.getTime() - now.getTime()) / (60 * 1000);
    
    if (timeUntilExit > 0 && timeUntilExit <= 15) {
      expectedExits += 1;
    }
  });

  return {
    timeFrame: 'Next 10-15 minutes',
    predictedOpenings: expectedExits,
    zones: [
      { zone: 'A', expectedSlots: Math.floor(expectedExits * 0.3) },
      { zone: 'B', expectedSlots: Math.floor(expectedExits * 0.4) },
      { zone: 'C', expectedSlots: Math.ceil(expectedExits * 0.3) },
    ],
    confidence: 75 + Math.min(20, expectedExits * 3),
    explanation: expectedExits > 0 
      ? `We expect approximately ${expectedExits} slot${expectedExits > 1 ? 's' : ''} to become available soon.`
      : 'Current vehicles are expected to stay for a while longer.',
  };
};

// ============================================
// Grace-Aware AI
// ============================================

export interface GraceExtension {
  granted: boolean;
  additionalMinutes: number;
  reason: string;
  autoApplied: boolean;
}

export const evaluateGraceExtension = (
  currentConditions: {
    isRaining?: boolean;
    congestionLevel?: 'low' | 'medium' | 'high';
    isEmergency?: boolean;
    userTrustScore?: number;
  }
): GraceExtension => {
  const { isRaining, congestionLevel, isEmergency, userTrustScore = 70 } = currentConditions;

  if (isEmergency) {
    return {
      granted: true,
      additionalMinutes: 30,
      reason: 'Emergency conditions detected. Take your time safely.',
      autoApplied: true,
    };
  }

  if (isRaining) {
    return {
      granted: true,
      additionalMinutes: 15,
      reason: 'Weather consideration: Please wait for safe conditions.',
      autoApplied: true,
    };
  }

  if (congestionLevel === 'high') {
    return {
      granted: true,
      additionalMinutes: 10,
      reason: 'High exit traffic. We suggest waiting briefly for smoother departure.',
      autoApplied: true,
    };
  }

  if (userTrustScore >= 80) {
    return {
      granted: true,
      additionalMinutes: 5,
      reason: 'Courtesy extension for valued visitors.',
      autoApplied: true,
    };
  }

  return {
    granted: false,
    additionalMinutes: 0,
    reason: '',
    autoApplied: false,
  };
};

// ============================================
// Slot Swapping Intelligence
// ============================================

export interface SwapOffer {
  available: boolean;
  currentSlot: string;
  suggestedSlot: string;
  rewardCredits: number;
  reason: string;
  isVoluntary: true; // Always voluntary
}

export const generateSwapOffer = (
  currentSlot: { id: string; zone: string; floor: number },
  availableSlots: { id: string; zone: string; floor: number }[],
  congestionLevel: 'low' | 'medium' | 'high'
): SwapOffer | null => {
  if (congestionLevel !== 'high') return null;
  
  // Only suggest if there's a beneficial swap
  const deeperSlots = availableSlots.filter(s => 
    s.zone > currentSlot.zone || (s.zone === currentSlot.zone && s.floor > currentSlot.floor)
  );

  if (deeperSlots.length === 0) return null;

  const suggested = deeperSlots[0];
  
  return {
    available: true,
    currentSlot: currentSlot.id,
    suggestedSlot: suggested.id,
    rewardCredits: 15,
    reason: 'Moving to this slot helps ease congestion and earns you eco-credits.',
    isVoluntary: true,
  };
};

// ============================================
// Trust Score System (Rewards-First)
// ============================================

export interface TrustScore {
  vehicleNumber: string;
  score: number;
  level: 'building' | 'established' | 'trusted';
  badges: Badge[];
  rewards: {
    freeMinutesEarned: number;
    ecoCredits: number;
    cashbackEarned: number;
  };
  positiveActions: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: Date;
  description: string;
}

const AVAILABLE_BADGES: Omit<Badge, 'earnedAt'>[] = [
  { id: 'precision_parker', name: 'Precision Parker', icon: '🎯', description: 'Consistently parks within guidelines' },
  { id: 'eco_driver', name: 'Eco Driver', icon: '🌱', description: 'Prefers efficient parking zones' },
  { id: 'peak_helper', name: 'Peak-Hour Helper', icon: '⚡', description: 'Voluntarily relocates during busy times' },
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Arrives during off-peak hours' },
  { id: 'quick_exit', name: 'Swift Departure', icon: '💨', description: 'Efficient exit timing' },
  { id: 'civic_champion', name: 'Civic Champion', icon: '🏛️', description: '50+ cooperative visits' },
];

export const calculateTrustScore = (
  vehicleNumber: string,
  history: {
    totalVisits: number;
    cooperativeExits: number;
    voluntaryRelocations: number;
    offPeakVisits: number;
    efficientParking: number;
  }
): TrustScore => {
  const { totalVisits, cooperativeExits, voluntaryRelocations, offPeakVisits, efficientParking } = history;
  
  // Calculate base score (no penalties, only positive factors)
  let score = 50; // Starting trust
  const positiveActions: string[] = [];

  if (totalVisits >= 5) {
    score += Math.min(15, totalVisits);
    positiveActions.push(`Regular visitor (${totalVisits} visits)`);
  }

  const cooperativeRate = cooperativeExits / Math.max(totalVisits, 1);
  if (cooperativeRate >= 0.8) {
    score += 15;
    positiveActions.push('Consistently timely departures');
  }

  if (voluntaryRelocations > 0) {
    score += voluntaryRelocations * 3;
    positiveActions.push(`Helped ${voluntaryRelocations} times during peak hours`);
  }

  if (offPeakVisits / Math.max(totalVisits, 1) >= 0.5) {
    score += 10;
    positiveActions.push('Prefers off-peak visits');
  }

  score = Math.min(100, score);

  // Determine level
  const level: TrustScore['level'] = 
    score >= 80 ? 'trusted' : score >= 60 ? 'established' : 'building';

  // Assign earned badges
  const badges: Badge[] = [];
  const now = new Date();

  if (efficientParking / Math.max(totalVisits, 1) >= 0.9) {
    badges.push({ ...AVAILABLE_BADGES[0], earnedAt: now });
  }
  if (offPeakVisits >= 10) {
    badges.push({ ...AVAILABLE_BADGES[3], earnedAt: now });
  }
  if (voluntaryRelocations >= 3) {
    badges.push({ ...AVAILABLE_BADGES[2], earnedAt: now });
  }
  if (totalVisits >= 50) {
    badges.push({ ...AVAILABLE_BADGES[5], earnedAt: now });
  }

  // Calculate rewards
  const freeMinutesEarned = Math.floor(score / 10) * 5;
  const ecoCredits = voluntaryRelocations * 15 + offPeakVisits * 2;
  const cashbackEarned = Math.floor(totalVisits * 2.5);

  return {
    vehicleNumber,
    score,
    level,
    badges,
    rewards: {
      freeMinutesEarned,
      ecoCredits,
      cashbackEarned,
    },
    positiveActions,
  };
};

// Generate mock trust scores
export const generateMockTrustScores = (vehicleNumbers: string[]): TrustScore[] => {
  return vehicleNumbers.map(vehicleNumber => {
    const totalVisits = Math.floor(Math.random() * 60) + 5;
    const cooperativeExits = Math.floor(totalVisits * (0.7 + Math.random() * 0.3));
    const voluntaryRelocations = Math.floor(Math.random() * 5);
    const offPeakVisits = Math.floor(totalVisits * Math.random() * 0.6);
    const efficientParking = Math.floor(totalVisits * (0.8 + Math.random() * 0.2));

    return calculateTrustScore(vehicleNumber, {
      totalVisits,
      cooperativeExits,
      voluntaryRelocations,
      offPeakVisits,
      efficientParking,
    });
  });
};

// ============================================
// Impact Detection System (Privacy-First)
// ============================================

export interface ImpactEvent {
  id: string;
  timestamp: Date;
  severity: 'minor' | 'moderate' | 'significant';
  affectedVehicleId: string;
  status: 'detected' | 'owner_notified' | 'resolved' | 'dismissed';
  evidenceRetained: boolean;
  retentionExpiry?: Date;
  isAIEstimate: true; // Always marked as AI
  disclaimers: string[];
}

export const detectImpactEvent = (
  affectedVehicleId: string,
  severityLevel: ImpactEvent['severity'] = 'minor'
): ImpactEvent => {
  const retentionHours = severityLevel === 'significant' ? 72 : severityLevel === 'moderate' ? 48 : 24;
  
  return {
    id: `IMP-${Date.now()}`,
    timestamp: new Date(),
    severity: severityLevel,
    affectedVehicleId,
    status: 'detected',
    evidenceRetained: true,
    retentionExpiry: new Date(Date.now() + retentionHours * 60 * 60 * 1000),
    isAIEstimate: true,
    disclaimers: [
      'This is an AI-assisted detection and may not be accurate.',
      'All severity estimates are preliminary and non-legal.',
      'Evidence will be automatically deleted after retention period.',
      'You may dismiss this alert if it appears incorrect.',
    ],
  };
};

// ============================================
// Sustainability Metrics (Enhanced)
// ============================================

export interface SustainabilityMetrics {
  searchTimeSaved: { total: number; average: number };
  fuelSaved: { liters: number; rupees: number };
  co2Avoided: { kg: number; treesEquivalent: number };
  ecoRewardMultiplier: number;
  dailyTrend: { date: string; saved: number }[];
  cityImpact: {
    vehiclesOptimized: number;
    peakHoursSmoothed: number;
    congestionReduced: string;
  };
}

export const calculateSustainabilityImpact = (
  totalSessions: number,
  avgSearchWithoutAI: number = 7,
  avgSearchWithAI: number = 1.2
): SustainabilityMetrics => {
  const searchTimeSaved = totalSessions * (avgSearchWithoutAI - avgSearchWithAI);
  const fuelPerMinute = 0.12; // Conservative estimate
  const fuelSaved = searchTimeSaved * fuelPerMinute;
  const co2PerLiter = 2.31;
  const co2Avoided = fuelSaved * co2PerLiter;
  const fuelPrice = 105; // INR per liter

  // Generate weekly trend
  const dailyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dailySaved = (searchTimeSaved / 7) * (0.85 + Math.random() * 0.3);
    dailyTrend.push({
      date: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      saved: Math.round(dailySaved * 10) / 10,
    });
  }

  return {
    searchTimeSaved: {
      total: Math.round(searchTimeSaved),
      average: Math.round((avgSearchWithoutAI - avgSearchWithAI) * 10) / 10,
    },
    fuelSaved: {
      liters: Math.round(fuelSaved * 10) / 10,
      rupees: Math.round(fuelSaved * fuelPrice),
    },
    co2Avoided: {
      kg: Math.round(co2Avoided * 10) / 10,
      treesEquivalent: Math.round((co2Avoided / 22) * 10) / 10,
    },
    ecoRewardMultiplier: 1.0 + (co2Avoided / 1000) * 0.1,
    dailyTrend,
    cityImpact: {
      vehiclesOptimized: totalSessions,
      peakHoursSmoothed: Math.floor(totalSessions * 0.3),
      congestionReduced: `${Math.round((searchTimeSaved / 60) * 0.7)}%`,
    },
  };
};

// ============================================
// Explainable Slot Recommendation
// ============================================

export interface SlotRecommendation {
  slotId: string;
  floor: number;
  zone: string;
  number: number;
  explanation: string;
  factors: { factor: string; weight: number }[];
  alternateOptions: { slotId: string; reason: string }[];
  isAIRecommendation: true;
}

export const generateSlotRecommendation = (
  availableSlots: { id: string; floor: number; zone: string; number: number }[],
  userPreferences: {
    intentDuration: 'short' | 'medium' | 'long';
    accessibilityNeeded?: boolean;
    evCharging?: boolean;
  }
): SlotRecommendation | null => {
  if (availableSlots.length === 0) return null;

  const { intentDuration, accessibilityNeeded, evCharging } = userPreferences;
  const factors: SlotRecommendation['factors'] = [];

  // Score each slot
  const scored = availableSlots.map(slot => {
    let score = 100;
    const slotFactors: string[] = [];

    // Duration-based zone preference
    if (intentDuration === 'short') {
      if (slot.zone === 'A') { score += 30; slotFactors.push('Near exit for quick departure'); }
      else if (slot.zone === 'B') score += 20;
    } else if (intentDuration === 'long') {
      if (slot.zone === 'D') { score += 30; slotFactors.push('Optimized for extended stays'); }
      else if (slot.zone === 'C') score += 20;
    }

    // Floor preference
    if (accessibilityNeeded && slot.floor === 1) {
      score += 40;
      slotFactors.push('Ground floor for easier access');
    }

    // Lower slot numbers are closer
    score += (10 - slot.number) * 2;

    return { ...slot, score, slotFactors };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  factors.push({ factor: 'Visit duration optimization', weight: 0.4 });
  factors.push({ factor: 'Walking distance', weight: 0.3 });
  factors.push({ factor: 'Exit efficiency', weight: 0.3 });

  return {
    slotId: best.id,
    floor: best.floor,
    zone: best.zone,
    number: best.number,
    explanation: `Slot ${best.floor}-${best.zone}-${best.number} is suggested based on your ${intentDuration} visit plan, optimizing for ${intentDuration === 'short' ? 'quick exit access' : 'comfortable parking'}.`,
    factors,
    alternateOptions: scored.slice(1, 3).map(s => ({
      slotId: s.id,
      reason: s.slotFactors[0] || 'Alternative option',
    })),
    isAIRecommendation: true,
  };
};

// ============================================
// Privacy & Data Lifecycle
// ============================================

export interface DataLifecycle {
  dataType: string;
  retentionPeriod: string;
  autoDeleteEnabled: boolean;
  userConsent: 'required' | 'optional' | 'not_needed';
  accessLevel: 'public' | 'user_only' | 'admin_only';
}

export const DATA_LIFECYCLE_POLICIES: DataLifecycle[] = [
  { dataType: 'Vehicle number', retentionPeriod: 'Session only', autoDeleteEnabled: true, userConsent: 'required', accessLevel: 'user_only' },
  { dataType: 'Parking history', retentionPeriod: '30 days', autoDeleteEnabled: true, userConsent: 'optional', accessLevel: 'user_only' },
  { dataType: 'Trust score', retentionPeriod: 'Until deletion request', autoDeleteEnabled: false, userConsent: 'optional', accessLevel: 'user_only' },
  { dataType: 'Impact evidence', retentionPeriod: '24-72 hours', autoDeleteEnabled: true, userConsent: 'optional', accessLevel: 'user_only' },
  { dataType: 'Aggregate analytics', retentionPeriod: 'Indefinite', autoDeleteEnabled: false, userConsent: 'not_needed', accessLevel: 'public' },
];
