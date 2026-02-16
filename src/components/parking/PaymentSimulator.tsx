import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Banknote, CheckCircle, Clock, Receipt, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateParkingFee } from '@/lib/parking-data';
import { useParking } from '@/context/ParkingContext';

const paymentMethods = [
  { id: 'fastag', label: 'FASTag', icon: CreditCard, color: 'from-blue-500 to-indigo-500' },
  { id: 'upi', label: 'UPI / Wallet', icon: Wallet, color: 'from-green-500 to-emerald-500' },
  { id: 'cash', label: 'Cash', icon: Banknote, color: 'from-amber-500 to-orange-500' },
];

export const PaymentSimulator: React.FC = () => {
  const { activeSession, endParking } = useParking();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feeDetails, setFeeDetails] = useState<{ fee: number; breakdown: string[] } | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - activeSession.entryTime.getTime();
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
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">No active parking session</p>
      </div>
    );
  }

  const { totalFee, breakdown } = calculateParkingFee(activeSession.entryTime);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = endParking(selectedMethod);
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
            {feeDetails.breakdown.map((line, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground">{line.split(':')[0]}</span>
                <span className="font-medium">{line.split(':')[1]}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Bot className="w-3 h-3" />
              Processed by AI Payment Agent
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated p-6 md:p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold mb-2">Exit & Payment</h3>
        <p className="text-muted-foreground text-sm">
          Vehicle: <span className="font-mono font-medium text-foreground">{activeSession.vehicleNumber}</span>
        </p>
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
            <span className="font-medium">{line.split(':')[1]}</span>
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
