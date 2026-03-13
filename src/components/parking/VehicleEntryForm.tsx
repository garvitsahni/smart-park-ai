import React, { useState } from 'react';
import { Car, ArrowRight, Bot, MapPin, AlertCircle, Bike, Zap, Truck, Camera, Mic, TrendingUp, ScanLine, Accessibility, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParkingSlot, VehicleType, VEHICLE_TYPE_CONFIG, validateVehicleNumber, generateVehicleNumber } from '@/lib/parking-data';
import { IntentSelector } from './IntentSelector';
import { AIExplanation } from './AIExplanation';
import { ParkingTicket } from './ParkingTicket';
import { VisitIntent, allocateSlotByIntent, SlotAllocationResult } from '@/lib/parking-intelligence';
import { useParking } from '@/context/ParkingContext';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VehicleEntryFormProps {
  onSubmit: (vehicleNumber: string, vehicleType?: VehicleType, preferredSlotId?: string, isAccessible?: boolean, expectedHours?: number) => ParkingSlot | null;
  isLoading?: boolean;
  preSelectedSlotId?: string;
}

const vehicleTypes: { id: VehicleType; label: string; icon: React.ReactNode; rate: string; color: string }[] = [
  { id: 'bike', label: 'Bike', icon: <Bike className="w-5 h-5" />, rate: '₹15/hr', color: 'from-green-500 to-emerald-500' },
  { id: 'car', label: 'Car', icon: <Car className="w-5 h-5" />, rate: '₹30/hr', color: 'from-blue-500 to-indigo-500' },
  { id: 'suv', label: 'SUV', icon: <Truck className="w-5 h-5" />, rate: '₹45/hr', color: 'from-purple-500 to-violet-500' },
  { id: 'ev', label: 'EV', icon: <Zap className="w-5 h-5" />, rate: '₹25/hr', color: 'from-cyan-500 to-teal-500' },
];

export const VehicleEntryForm: React.FC<VehicleEntryFormProps> = ({ onSubmit, isLoading, preSelectedSlotId }) => {
  const { activeSessions, slots } = useParking();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedType, setSelectedType] = useState<VehicleType>('car');
  const [selectedIntent, setSelectedIntent] = useState<VisitIntent | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(preSelectedSlotId || 'auto');
  const [needsAccessible, setNeedsAccessible] = useState(false);
  const [useDuration, setUseDuration] = useState(false);
  const [duration, setDuration] = useState('2');
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    if (preSelectedSlotId) {
      setSelectedSlotId(preSelectedSlotId);
    }
  }, [preSelectedSlotId]);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [assignedSlot, setAssignedSlot] = useState<ParkingSlot | null>(null);
  const [allocationResult, setAllocationResult] = useState<SlotAllocationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<'input' | 'processing' | 'assigned'>('input');
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const isValidPlate = vehicleNumber.length >= 4 && validateVehicleNumber(vehicleNumber.replace(/\s/g, ''));
  const isAlreadyParked = activeSessions.some(s => s.vehicleNumber === vehicleNumber.replace(/\s/g, '').toUpperCase());
  const availableSlots = slots.filter(s => s.status === 'available');

  const currentHour = new Date().getHours();
  const isPeakHour = (currentHour >= 10 && currentHour <= 14) || (currentHour >= 18 && currentHour <= 21);
  const isSurgeActive = isPeakHour || (availableSlots.length / slots.length) < 0.2;

  const simulateALPR = async () => {
    setIsScanning(true);
    setVehicleNumber('Scanning...');
    await new Promise(r => setTimeout(r, 1500));
    setVehicleNumber(generateVehicleNumber());
    setIsScanning(false);
    setError(null);
  };

  const simulateVoiceCommand = async () => {
    setIsListening(true);
    setError(null);
    await new Promise(r => setTimeout(r, 2000));
    setVehicleNumber(generateVehicleNumber());
    setSelectedType('ev');
    setSelectedIntent('shopping');
    setIsListening(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
    if (!cleanNumber.trim()) {
      setError('Please enter a vehicle number');
      return;
    }
    if (!validateVehicleNumber(cleanNumber)) {
      setError('Invalid Indian vehicle number format (e.g., MH12AB1234)');
      return;
    }
    if (isAlreadyParked) {
      setError('This vehicle is already parked!');
      return;
    }
    if (!selectedIntent) {
      setError('Please select your visit purpose');
      return;
    }

    setIsProcessing(true);
    setStage('processing');

    await new Promise(resolve => setTimeout(resolve, 1800));

    // Pass accessibility needs and expected duration to onSubmit
    const slot = onSubmit(
      cleanNumber, 
      selectedType, 
      selectedSlotId === 'auto' ? undefined : selectedSlotId, 
      needsAccessible,
      useDuration ? parseInt(duration) : undefined
    );
    setAssignedSlot(slot);

    if (slot) {
      const result = allocateSlotByIntent([slot], selectedIntent);
      setAllocationResult(result);
      const session = JSON.parse(localStorage.getItem('smartpark_active_sessions') || '[]');
      const latestSession = session.find((s: any) => s.vehicleNumber === cleanNumber);
      setTicketId(latestSession?.ticketId || `TKT-${Date.now().toString(36).toUpperCase()}`);
    } else {
      setError('No parking slots available at this time');
    }

    setIsProcessing(false);
    setStage(slot ? 'assigned' : 'input');
  };

  const handleReset = () => {
    setVehicleNumber('');
    setSelectedType('car');
    setSelectedIntent(null);
    setSelectedSlotId('auto');
    setNeedsAccessible(false);
    setUseDuration(false);
    setDuration('2');
    setAssignedSlot(null);
    setAllocationResult(null);
    setError(null);
    setStage('input');
  };

  return (
    <div className="glass-card-elevated p-6 md:p-8 max-w-md mx-auto">
      {stage === 'input' && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-1">Vehicle Entry</h2>
            
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-sm mb-4 bg-cyan-950/30 px-4 py-1.5 rounded-full w-fit mx-auto border border-cyan-500/20">
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              <span className="opacity-50 mx-1">|</span>
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <p className="text-muted-foreground text-sm mt-1 mb-3">
              Enter your vehicle details to get an AI-assigned parking slot
            </p>
            {isSurgeActive && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-medium animate-pulse">
                <TrendingUp className="w-3.5 h-3.5" />
                High Demand: Surge Pricing Active (1.5x)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleNumber" className="flex justify-between items-center">
              <span>Vehicle Number</span>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={simulateALPR}
                  disabled={isScanning || isListening}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-medium"
                >
                  {isScanning ? <ScanLine className="w-3.5 h-3.5 animate-pulse text-primary" /> : <Camera className="w-3.5 h-3.5" />}
                  ALPR Scan
                </button>
                <button 
                  type="button" 
                  onClick={simulateVoiceCommand}
                  disabled={isScanning || isListening}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-medium"
                >
                  {isListening ? <span className="flex gap-0.5"><span className="w-1 h-3 bg-primary animate-pulse"/><span className="w-1 h-3 bg-primary animate-pulse" style={{animationDelay: '100ms'}}/></span> : <Mic className="w-3.5 h-3.5" />}
                  Voice
                </button>
              </div>
            </Label>
            <Input
              id="vehicleNumber"
              placeholder="e.g., MH12AB1234"
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value.toUpperCase());
                setError(null);
              }}
              className={`text-center text-lg font-mono tracking-wider ${
                vehicleNumber.length > 0 && !isValidPlate && !isScanning && !isListening ? 'border-destructive/50' : ''
              } ${isValidPlate ? 'border-emerald-500/50' : ''} ${isScanning || isListening ? 'border-primary/50 text-primary animate-pulse' : ''}`}
              maxLength={12}
              disabled={isScanning || isListening}
            />
          </div>

          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {vehicleTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1.5 ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/10 glow-calm'
                      : 'border-border/50 hover:border-primary/30 hover:bg-secondary/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center text-white`}>
                    {type.icon}
                  </div>
                  <span className="text-xs font-medium">{type.label}</span>
                  <span className="text-[10px] text-muted-foreground">{type.rate}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border-2 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer group"
               onClick={() => setNeedsAccessible(!needsAccessible)}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                needsAccessible ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-indigo-500/20 text-indigo-400"
              )}>
                <Accessibility className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Old Age / Handicapped</div>
                <div className="text-[10px] text-muted-foreground">Request priority accessible slot</div>
              </div>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              needsAccessible ? "border-indigo-500 bg-indigo-500" : "border-border"
            )}>
            {needsAccessible && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>

          {/* Billing Mode / Duration Selection */}
          <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-secondary/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Billing Mode</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUseDuration(false)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                  !useDuration 
                    ? "border-primary bg-primary/10 glow-calm" 
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">Live Billing</span>
                <span className="text-[9px] text-muted-foreground">Pay per time spent</span>
              </button>
              
              <button
                type="button"
                onClick={() => setUseDuration(true)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                  useDuration 
                    ? "border-primary bg-primary/10 glow-calm" 
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Fixed Stay</span>
                <span className="text-[9px] text-muted-foreground">Pre-select duration</span>
              </button>
            </div>
            
            {useDuration && (
              <div className="space-y-3 pt-2 border-t border-border/30 animate-scale-in">
                <Label className="text-[10px] text-muted-foreground">STAY DURATION (HOURS)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {['1', '2', '4', '8', '12'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDuration(h)}
                      className={cn(
                        "py-2 rounded-lg border text-xs font-bold transition-all",
                        duration === h 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                          : "bg-background border-border hover:border-primary/50"
                      )}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  AI will prioritize slots optimized for {duration}h stay.
                </p>
              </div>
            )}
            
            {!useDuration && (
              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 animate-fade-in">
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Live Billing Active: Charges calculated automatically on exit.
                </p>
              </div>
            )}
          </div>

          <IntentSelector selectedIntent={selectedIntent} onSelect={setSelectedIntent} />

          <div className="space-y-2">
            <Label>Preferred Parking Spot (Optional)</Label>
            <Select value={selectedSlotId} onValueChange={setSelectedSlotId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a specific spot" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="auto">Wait for AI Allocation</SelectItem>
                {availableSlots.map(slot => (
                  <SelectItem key={slot.id} value={slot.id}>
                    Slot {slot.floor}-{slot.zone}-{slot.number} {slot.hasEvCharger ? '(EV)' : ''} {slot.isAccessible ? '(Accessible)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={!vehicleNumber.trim() || !selectedIntent || !isValidPlate || isAlreadyParked || isLoading}
          >
            Find Parking Slot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
      )}

      {stage === 'processing' && (
        <div className="text-center py-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Bot className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">AI Agent Processing</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Analyzing {VEHICLE_TYPE_CONFIG[selectedType].label} parking needs...
          </p>
        </div>
      )}

      {stage === 'assigned' && assignedSlot && (
        <div className="text-center py-4 animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center mx-auto mb-6 glow-success">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Slot Assigned!</h3>

          <div className="glass-card p-6 mb-4">
            <div className="text-sm text-muted-foreground mb-1">Your Slot</div>
            <div className="text-4xl font-display font-bold gradient-text mb-2">
              {assignedSlot.floor}-{assignedSlot.zone}-{assignedSlot.number}
            </div>
          </div>

          <ParkingTicket
            ticketId={ticketId}
            vehicleNumber={vehicleNumber.replace(/\s/g, '').toUpperCase()}
            vehicleType={selectedType}
            slotId={`${assignedSlot.floor}-${assignedSlot.zone}-${assignedSlot.number}`}
            entryTime={new Date()}
            floor={assignedSlot.floor}
            zone={assignedSlot.zone}
          />

          {allocationResult && <AIExplanation result={allocationResult} />}

          <Button variant="heroOutline" onClick={handleReset} className="w-full mt-4">
            Park Another Vehicle
          </Button>
        </div>
      )}
    </div>
  );
};
