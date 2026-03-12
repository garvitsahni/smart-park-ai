import React, { useState, useEffect } from 'react';
import { Car, Clock, MapPin, CreditCard, Bike, Zap, Truck, ScanLine, Key, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParking } from '@/context/ParkingContext';
import { ActiveSession, VehicleType, VEHICLE_TYPE_CONFIG } from '@/lib/parking-data';
import { useNotifications } from '@/context/NotificationContext';
import { ARNavigationOverlay } from '@/components/parking/ARNavigationOverlay';

const vehicleIcons: Record<VehicleType, React.ReactNode> = {
  car: <Car className="w-4 h-4" />,
  suv: <Truck className="w-4 h-4" />,
  bike: <Bike className="w-4 h-4" />,
  ev: <Zap className="w-4 h-4" />,
};

interface ActiveSessionsProps {
  onSelectForExit: (vehicleNumber: string) => void;
}

export const ActiveSessions: React.FC<ActiveSessionsProps> = ({ onSelectForExit }) => {
  const { activeSessions, endParking } = useParking();
  const { addNotification } = useNotifications();
  const [timers, setTimers] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'valet' | 'find' | 'fastag' | null>(null);
  const [arNavigationSession, setArNavigationSession] = useState<ActiveSession | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, string> = {};
      activeSessions.forEach(session => {
        const now = new Date();
        const diff = now.getTime() - new Date(session.entryTime).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        newTimers[session.vehicleNumber] =
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSessions]);

  if (activeSessions.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">No Active Sessions</h3>
        <p className="text-sm text-muted-foreground">
          Park a vehicle from the Entry tab to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="font-display text-lg font-semibold">
          Active Sessions ({activeSessions.length})
        </h3>
        <p className="text-sm text-muted-foreground">
          Select a vehicle to process exit & payment
        </p>
      </div>

      {activeSessions.map((session) => {
        const config = VEHICLE_TYPE_CONFIG[session.vehicleType || 'car'];
        return (
          <div
            key={session.vehicleNumber}
            className="glass-card-elevated p-4 transition-all duration-300 hover:glow-calm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white shrink-0`}>
                  {vehicleIcons[session.vehicleType || 'car']}
                </div>
                <div>
                  <div className="font-mono font-bold text-sm">{session.vehicleNumber}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Slot {session.assignedSlot.id}
                    </span>
                    <span>•</span>
                    <span>Floor {session.assignedSlot.floor}</span>
                    <span>•</span>
                    <span>Zone {session.assignedSlot.zone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{config.icon} {config.label}</span>
                    <span>•</span>
                    <span>₹{config.ratePerHour}/hr</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  Duration
                </div>
                <div className="font-mono font-bold text-lg gradient-text">
                  {timers[session.vehicleNumber] || '00:00:00'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                <Ticket className="w-3 h-3" />
                {session.ticketId}
              </span>
              <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setArNavigationSession(session)}
                  className="text-xs px-2 glow-calm"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400"/>
                  Find Car
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={processingId === session.vehicleNumber}
                  onClick={() => {
                    setProcessingId(session.vehicleNumber);
                    setProcessingAction('valet');
                    setTimeout(() => {
                      addNotification('success', 'Valet Dispatched', `A driver is on their way to Slot ${session.assignedSlot.id}. ETA: 3 mins.`);
                      setProcessingId(null);
                    }, 2000);
                  }}
                  className="text-xs px-2"
                >
                  {processingId === session.vehicleNumber && processingAction === 'valet' ? <ScanLine className="w-3.5 h-3.5 mr-1 animate-pulse text-primary" /> : <Key className="w-3.5 h-3.5 mr-1 text-primary"/>}
                  Request Valet
                </Button>

                <Button
                  variant="heroOutline"
                  size="sm"
                  disabled={processingId === session.vehicleNumber}
                  onClick={() => {
                    setProcessingId(session.vehicleNumber);
                    setProcessingAction('fastag');
                    setTimeout(() => {
                      endParking(session.vehicleNumber, 'fastag');
                      addNotification('success', 'Auto-Pay Successful', `₹ deducted from FASTag Wallet. Boom barrier opened for ${session.vehicleNumber}.`);
                      setProcessingId(null);
                    }, 1500);
                  }}
                  className="text-xs px-2 glow-calm border-indigo-500/30 hover:border-indigo-400 transition-colors"
                >
                  {processingId === session.vehicleNumber && processingAction === 'fastag' ? <ScanLine className="w-3.5 h-3.5 mr-1 animate-spin text-indigo-400" /> : <Zap className="w-3.5 h-3.5 mr-1 text-indigo-400"/>}
                  FASTag Exit
                </Button>

                <Button
                  variant="hero"
                  size="sm"
                  disabled={processingId === session.vehicleNumber}
                  onClick={() => onSelectForExit(session.vehicleNumber)}
                  className="gap-1 px-3"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Manual Pay
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {arNavigationSession && (
        <ARNavigationOverlay 
          session={arNavigationSession} 
          onClose={() => setArNavigationSession(null)} 
        />
      )}
    </div>
  );
};
