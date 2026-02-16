// Advanced Parking Intelligence Add-ons

// ============================================
// ADD-ON 1: Intent-Aware Parking Intelligence
// ============================================

export type VisitIntent = 'shopping' | 'movie' | 'dining' | 'office';

export interface IntentConfig {
  id: VisitIntent;
  label: string;
  icon: string;
  avgDuration: number; // in hours
  zonePreference: 'near-exit' | 'deep' | 'balanced';
  floorPreference: number[];
}

export const INTENT_CONFIGS: IntentConfig[] = [
  { id: 'shopping', label: 'Shopping', icon: '🛍️', avgDuration: 2, zonePreference: 'near-exit', floorPreference: [1, 2] },
  { id: 'movie', label: 'Movie', icon: '🎬', avgDuration: 3, zonePreference: 'balanced', floorPreference: [2, 1] },
  { id: 'dining', label: 'Dining', icon: '🍽️', avgDuration: 1.5, zonePreference: 'near-exit', floorPreference: [1] },
  { id: 'office', label: 'Office (Long Stay)', icon: '💼', avgDuration: 8, zonePreference: 'deep', floorPreference: [3, 2] },
];

export interface SlotAllocationResult {
  slot: { id: string; floor: number; zone: string; number: number } | null;
  explanation: string;
  confidence: number;
  factors: string[];
}

export const allocateSlotByIntent = (
  availableSlots: { id: string; floor: number; zone: string; number: number }[],
  intent: VisitIntent
): SlotAllocationResult => {
  if (availableSlots.length === 0) {
    return {
      slot: null,
      explanation: 'No available slots at this time.',
      confidence: 0,
      factors: ['Full capacity'],
    };
  }

  const config = INTENT_CONFIGS.find(c => c.id === intent)!;
  const factors: string[] = [];

  // Score each slot based on intent
  const scoredSlots = availableSlots.map(slot => {
    let score = 100;

    // Floor preference
    const floorIndex = config.floorPreference.indexOf(slot.floor);
    if (floorIndex !== -1) {
      score += (config.floorPreference.length - floorIndex) * 20;
    }

    // Zone preference based on exit efficiency
    if (config.zonePreference === 'near-exit') {
      // Zones A and B are near exit
      if (slot.zone === 'A') score += 30;
      else if (slot.zone === 'B') score += 20;
      else if (slot.zone === 'C') score += 10;
    } else if (config.zonePreference === 'deep') {
      // Zones C and D for long stay
      if (slot.zone === 'D') score += 30;
      else if (slot.zone === 'C') score += 20;
    } else {
      // Balanced - middle zones
      if (slot.zone === 'B' || slot.zone === 'C') score += 20;
    }

    // Lower slot numbers are closer to zone entrance
    score += (10 - slot.number) * 2;

    return { ...slot, score };
  });

  // Sort by score
  scoredSlots.sort((a, b) => b.score - a.score);
  const bestSlot = scoredSlots[0];

  // Build explanation
  factors.push(`Visit intent: ${config.label}`);
  factors.push(`Expected duration: ${config.avgDuration}h`);
  factors.push(`Zone strategy: ${config.zonePreference === 'near-exit' ? 'Near exit for quick departure' : config.zonePreference === 'deep' ? 'Deep zone for long-term parking' : 'Balanced placement'}`);
  factors.push(`Floor optimization: Priority ${config.floorPreference.join(' > ')}`);

  const explanation = `Slot ${bestSlot.floor}-${bestSlot.zone}-${bestSlot.number} assigned based on ${config.label.toLowerCase()} visit intent and exit efficiency optimization.`;

  return {
    slot: { id: bestSlot.id, floor: bestSlot.floor, zone: bestSlot.zone, number: bestSlot.number },
    explanation,
    confidence: Math.min(95, 70 + scoredSlots.length),
    factors,
  };
};

// ============================================
// ADD-ON 2: Parking DNA Score
// ============================================

export type DNAScoreLevel = 'green' | 'yellow' | 'red';

export interface VehicleDNAScore {
  vehicleNumber: string;
  overallScore: number;
  level: DNAScoreLevel;
  metrics: {
    slotCompliance: number;      // 0-100
    timelyExit: number;          // 0-100
    peakHourUsage: number;       // 0-100 (lower is better for congestion)
    paymentConsistency: number;  // 0-100
  };
  totalVisits: number;
  violations: number;
  discountEligible: boolean;
  penaltyMultiplier: number;
  lastUpdated: Date;
}

export const calculateDNAScore = (
  vehicleNumber: string,
  history: {
    violations: number;
    totalVisits: number;
    lateExits: number;
    peakHourVisits: number;
    paymentIssues: number;
  }
): VehicleDNAScore => {
  const { violations, totalVisits, lateExits, peakHourVisits, paymentIssues } = history;

  // Calculate individual metrics
  const slotCompliance = Math.max(0, 100 - (violations / Math.max(totalVisits, 1)) * 100);
  const timelyExit = Math.max(0, 100 - (lateExits / Math.max(totalVisits, 1)) * 100);
  const peakHourUsage = Math.max(0, 100 - (peakHourVisits / Math.max(totalVisits, 1)) * 50);
  const paymentConsistency = Math.max(0, 100 - (paymentIssues / Math.max(totalVisits, 1)) * 100);

  // Weighted overall score
  const overallScore = Math.round(
    slotCompliance * 0.35 +
    timelyExit * 0.25 +
    peakHourUsage * 0.15 +
    paymentConsistency * 0.25
  );

  // Determine level
  let level: DNAScoreLevel;
  if (overallScore >= 80) level = 'green';
  else if (overallScore >= 50) level = 'yellow';
  else level = 'red';

  return {
    vehicleNumber,
    overallScore,
    level,
    metrics: {
      slotCompliance: Math.round(slotCompliance),
      timelyExit: Math.round(timelyExit),
      peakHourUsage: Math.round(peakHourUsage),
      paymentConsistency: Math.round(paymentConsistency),
    },
    totalVisits,
    violations,
    discountEligible: level === 'green' && totalVisits >= 5,
    penaltyMultiplier: level === 'red' ? 1.5 : level === 'yellow' ? 1.2 : 1.0,
    lastUpdated: new Date(),
  };
};

// Generate mock DNA scores for demo
export const generateMockDNAScores = (vehicleNumbers: string[]): VehicleDNAScore[] => {
  return vehicleNumbers.map(vehicleNumber => {
    const totalVisits = Math.floor(Math.random() * 50) + 5;
    const violations = Math.floor(Math.random() * (totalVisits * 0.2));
    const lateExits = Math.floor(Math.random() * (totalVisits * 0.15));
    const peakHourVisits = Math.floor(Math.random() * (totalVisits * 0.6));
    const paymentIssues = Math.floor(Math.random() * (totalVisits * 0.1));

    return calculateDNAScore(vehicleNumber, {
      violations,
      totalVisits,
      lateExits,
      peakHourVisits,
      paymentIssues,
    });
  });
};

// ============================================
// ADD-ON 4: Predictive Exit Congestion Control
// ============================================

export interface ExitCongestionPrediction {
  timeWindow: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  expectedExits: number;
  currentCapacity: number;
  predictions: {
    vehicleNumber: string;
    expectedExit: Date;
    confidence: number;
  }[];
  recommendations: string[];
  actions: {
    type: 'activate_lane' | 'pause_entry' | 'alert';
    description: string;
    priority: number;
  }[];
}

export const predictExitCongestion = (
  activeVehicles: { vehicleNumber: string; entryTime: Date; intent?: VisitIntent }[],
  currentHour: number = new Date().getHours()
): ExitCongestionPrediction => {
  const now = new Date();
  
  // Predict exit times based on entry time and intent
  const predictions = activeVehicles.map(v => {
    const intentConfig = v.intent ? INTENT_CONFIGS.find(c => c.id === v.intent) : null;
    const avgDuration = intentConfig?.avgDuration || 2; // default 2 hours
    const entryTime = new Date(v.entryTime);
    const expectedExit = new Date(entryTime.getTime() + avgDuration * 60 * 60 * 1000);
    
    // Calculate confidence based on how close to expected exit
    const timeUntilExit = (expectedExit.getTime() - now.getTime()) / (60 * 1000); // minutes
    const confidence = timeUntilExit < 30 ? 95 : timeUntilExit < 60 ? 80 : timeUntilExit < 120 ? 60 : 40;

    return {
      vehicleNumber: v.vehicleNumber,
      expectedExit,
      confidence,
    };
  });

  // Count vehicles expected to exit in next 30 minutes
  const thirtyMinWindow = new Date(now.getTime() + 30 * 60 * 1000);
  const exitsInWindow = predictions.filter(p => p.expectedExit <= thirtyMinWindow).length;

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (exitsInWindow > 20) riskLevel = 'critical';
  else if (exitsInWindow > 12) riskLevel = 'high';
  else if (exitsInWindow > 6) riskLevel = 'medium';
  else riskLevel = 'low';

  // Historical patterns boost
  const isPeakExitHour = [13, 14, 18, 19, 20, 21].includes(currentHour);
  if (isPeakExitHour && riskLevel !== 'critical') {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel === 'medium' ? 'high' : 'critical';
  }

  // Generate recommendations
  const recommendations: string[] = [];
  const actions: ExitCongestionPrediction['actions'] = [];

  if (riskLevel === 'critical') {
    recommendations.push('Activate all exit lanes immediately');
    recommendations.push('Pause new vehicle entries for 15 minutes');
    recommendations.push('Deploy additional exit staff');
    actions.push({ type: 'activate_lane', description: 'Activate Lane 3 & 4', priority: 1 });
    actions.push({ type: 'pause_entry', description: 'Pause entry for 15 min', priority: 2 });
    actions.push({ type: 'alert', description: 'High congestion alert sent', priority: 3 });
  } else if (riskLevel === 'high') {
    recommendations.push('Prepare additional exit lane');
    recommendations.push('Consider slowing new entries');
    actions.push({ type: 'activate_lane', description: 'Standby Lane 3', priority: 1 });
    actions.push({ type: 'alert', description: 'Congestion warning issued', priority: 2 });
  } else if (riskLevel === 'medium') {
    recommendations.push('Monitor exit queue closely');
    recommendations.push('Standard operations sufficient');
    actions.push({ type: 'alert', description: 'Elevated monitoring active', priority: 1 });
  }

  return {
    timeWindow: 'Next 30 minutes',
    riskLevel,
    expectedExits: exitsInWindow,
    currentCapacity: 15, // vehicles per 30 min
    predictions: predictions.sort((a, b) => a.expectedExit.getTime() - b.expectedExit.getTime()).slice(0, 10),
    recommendations,
    actions,
  };
};

// ============================================
// ADD-ON 5: Carbon Footprint & Sustainability
// ============================================

export interface SustainabilityMetrics {
  parkingSearchTimeSaved: number; // minutes
  fuelSaved: number; // liters
  co2Avoided: number; // kg
  treesEquivalent: number;
  moneyToDrivers: number; // currency saved
  dailyStats: {
    date: string;
    searchTimeSaved: number;
    fuelSaved: number;
    co2Avoided: number;
  }[];
  weeklyTotal: {
    searchTimeSaved: number;
    fuelSaved: number;
    co2Avoided: number;
  };
  monthlyTotal: {
    searchTimeSaved: number;
    fuelSaved: number;
    co2Avoided: number;
  };
}

export const calculateSustainabilityMetrics = (
  totalParkingSessions: number,
  avgSearchTimeWithoutAI: number = 8, // minutes
  avgSearchTimeWithAI: number = 1.5   // minutes
): SustainabilityMetrics => {
  const searchTimeSaved = totalParkingSessions * (avgSearchTimeWithoutAI - avgSearchTimeWithAI);
  
  // Average car burns ~0.15L/min while searching at parking lot speeds
  const fuelPerMinute = 0.15;
  const fuelSaved = searchTimeSaved * fuelPerMinute;
  
  // 2.31 kg CO2 per liter of petrol
  const co2PerLiter = 2.31;
  const co2Avoided = fuelSaved * co2PerLiter;
  
  // One tree absorbs ~22kg CO2 per year
  const treesEquivalent = co2Avoided / 22;
  
  // Fuel price ~₹100/L
  const moneyToDrivers = fuelSaved * 100;

  // Generate daily stats for last 7 days
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dailySessions = Math.floor(totalParkingSessions / 7 * (0.8 + Math.random() * 0.4));
    const dailySearchTime = dailySessions * (avgSearchTimeWithoutAI - avgSearchTimeWithAI);
    const dailyFuel = dailySearchTime * fuelPerMinute;
    
    dailyStats.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      searchTimeSaved: Math.round(dailySearchTime),
      fuelSaved: Math.round(dailyFuel * 10) / 10,
      co2Avoided: Math.round(dailyFuel * co2PerLiter * 10) / 10,
    });
  }

  const weeklyTotal = {
    searchTimeSaved: Math.round(searchTimeSaved),
    fuelSaved: Math.round(fuelSaved * 10) / 10,
    co2Avoided: Math.round(co2Avoided * 10) / 10,
  };

  const monthlyTotal = {
    searchTimeSaved: Math.round(searchTimeSaved * 4.3),
    fuelSaved: Math.round(fuelSaved * 4.3 * 10) / 10,
    co2Avoided: Math.round(co2Avoided * 4.3 * 10) / 10,
  };

  return {
    parkingSearchTimeSaved: searchTimeSaved,
    fuelSaved,
    co2Avoided,
    treesEquivalent: Math.round(treesEquivalent * 10) / 10,
    moneyToDrivers: Math.round(moneyToDrivers),
    dailyStats,
    weeklyTotal,
    monthlyTotal,
  };
};
