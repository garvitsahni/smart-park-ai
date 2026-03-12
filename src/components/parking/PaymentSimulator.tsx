import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Banknote, CheckCircle, Clock, Receipt, Bot, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateParkingFee, VEHICLE_TYPE_CONFIG } from '@/lib/parking-data';
import { useParking } from '@/context/ParkingContext';

const paymentMethods = [
  { id: 'fastag', label: 'FASTag', icon: CreditCard, color: 'from-blue-500 to-indigo-500' },
  { id: 'upi', label: 'UPI / Wallet', icon: Wallet, color: 'from-green-500 to-emerald-500' },
  { id: 'cash', label: 'Cash', icon: Banknote, color: 'from-amber-500 to-orange-500' },
];

interface PaymentSimulatorProps {
  selectedVehicle?: string;
  onBack?: () => void;
}

export const PaymentSimulator: React.FC<PaymentSimulatorProps> = ({ selectedVehicle, onBack }) => {
  const { activeSessions, endParking } = useParking();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feeDetails, setFeeDetails] = useState<{ fee: number; breakdown: string[] } | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Find the active session for the selected vehicle
  const activeSession = activeSessions.find(s => s.vehicleNumber === selectedVehicle);

  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - new Date(activeSession.entryTime).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">No Vehicle Selected</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select a vehicle from the Active Sessions tab to process payment
        </p>
        {onBack && (
          <Button variant="heroOutline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go to Sessions
          </Button>
        )}
      </div>
    );
  }

  const vehicleConfig = VEHICLE_TYPE_CONFIG[activeSession.vehicleType || 'car'];
  const { totalFee, breakdown } = calculateParkingFee(
    new Date(activeSession.entryTime),
    new Date(),
    activeSession.vehicleType || 'car'
  );

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = endParking(activeSession.vehicleNumber, selectedMethod);
    setFeeDetails(result);
    setIsProcessing(false);
    setIsComplete(true);
  };

  if (isComplete && feeDetails) {
    return (
      <div className="glass-card-elevated p-6 md:p-8 max-w-md mx-auto animate-fade-in-up">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center mx-auto mb-6 glow-success">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Thank you for using Park-Prabandh
          </p>

          <div className="glass-card p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-primary" />
              <span className="font-medium">Payment Receipt</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Vehicle: <span className="font-mono font-medium text-foreground">{activeSession.vehicleNumber}</span>
              <span className="ml-2">{vehicleConfig.icon} {vehicleConfig.label}</span>
            </div>
            {feeDetails.breakdown.map((line, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground">{line.split(':')[0]}</span>
                <span className="font-medium">{line.split(':').slice(1).join(':')}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground mb-4">
            <span className="inline-flex items-center gap-1">
              <Bot className="w-3 h-3" />
              Processed by AI Payment Agent
            </span>
          </div>

          {onBack && (
            <Button variant="heroOutline" onClick={onBack} className="w-full">
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated p-6 md:p-8 max-w-md mx-auto">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Button>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold mb-2">Exit & Payment</h3>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <span className="font-mono font-medium text-foreground">{activeSession.vehicleNumber}</span>
          <span>•</span>
          <span>{vehicleConfig.icon} {vehicleConfig.label}</span>
          <span>•</span>
          <span>Slot {activeSession.assignedSlot.id}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="glass-card p-4 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Parking Duration</span>
        </div>
        <div className="text-3xl font-display font-bold font-mono gradient-text">
          {elapsedTime}
        </div>
      </div>

      {/* Fee breakdown */}
      <div className="glass-card p-4 mb-6">
        <div className="text-sm text-muted-foreground mb-2">Fee Breakdown</div>
        {breakdown.map((line, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">{line.split(':')[0]}</span>
            <span className="font-medium">{line.split(':').slice(1).join(':')}</span>
          </div>
        ))}
        <div className="border-t border-border mt-2 pt-2 flex justify-between">
          <span className="font-semibold">Total Amount</span>
          <span className="text-xl font-bold gradient-text">₹{totalFee}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-3 mb-6">
        <div className="text-sm text-muted-foreground">Select Payment Method</div>
        {paymentMethods.map(method => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full glass-card p-4 flex items-center gap-4 transition-all duration-300 ${
              selectedMethod === method.id
                ? 'ring-2 ring-primary glow-primary'
                : 'hover:bg-secondary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
              <method.icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">{method.label}</span>
          </button>
        ))}
      </div>

      <Button
        variant="hero"
        size="lg"
        className="w-full"
        disabled={!selectedMethod || isProcessing}
        onClick={handlePayment}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            Pay ₹{totalFee} & Exit
          </>
        )}
      </Button>
    </div>
  );
};
