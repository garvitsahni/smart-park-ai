import React, { useState } from 'react';
import { Car, ArrowRight, Bot, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ParkingSlot } from '@/lib/parking-data';
import { IntentSelector } from './IntentSelector';
import { AIExplanation } from './AIExplanation';
import { VisitIntent, allocateSlotByIntent, SlotAllocationResult } from '@/lib/parking-intelligence';

interface VehicleEntryFormProps {
  onSubmit: (vehicleNumber: string, intent?: VisitIntent) => ParkingSlot | null;
  isLoading?: boolean;
}

export const VehicleEntryForm: React.FC<VehicleEntryFormProps> = ({ onSubmit, isLoading }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<VisitIntent | null>(null);
  const [assignedSlot, setAssignedSlot] = useState<ParkingSlot | null>(null);
  const [allocationResult, setAllocationResult] = useState<SlotAllocationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<'input' | 'processing' | 'assigned'>('input');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !selectedIntent) return;

    setIsProcessing(true);
    setStage('processing');

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const slot = onSubmit(vehicleNumber.toUpperCase(), selectedIntent);
    setAssignedSlot(slot);
    
    if (slot) {
      // Generate AI explanation
      const result = allocateSlotByIntent([slot], selectedIntent);
      setAllocationResult(result);
    }
    
    setIsProcessing(false);
    setStage('assigned');
  };

  const handleReset = () => {
    setVehicleNumber('');
    setSelectedIntent(null);
    setAssignedSlot(null);
    setAllocationResult(null);
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
            <h2 className="font-display text-2xl font-bold">Vehicle Entry</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your vehicle number to get an AI-assigned parking slot
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
            <Input
              id="vehicleNumber"
              placeholder="e.g., MH12AB1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-wider"
              maxLength={12}
            />
          </div>

          <IntentSelector selectedIntent={selectedIntent} onSelect={setSelectedIntent} />

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={!vehicleNumber.trim() || !selectedIntent || isLoading}
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
            Analyzing visit intent and finding optimal slot...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
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
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Floor {assignedSlot.floor}</span>
              <span>•</span>
              <span>Zone {assignedSlot.zone}</span>
            </div>
          </div>

          {allocationResult && <AIExplanation result={allocationResult} />}

          <Button variant="heroOutline" onClick={handleReset} className="w-full mt-4">
            Park Another Vehicle
          </Button>
        </div>
      )}

      {stage === 'assigned' && !assignedSlot && (
        <div className="text-center py-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-destructive" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2 text-destructive">No Slots Available</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Sorry, all parking slots are currently occupied.
          </p>
          <Button variant="heroOutline" onClick={handleReset} className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
