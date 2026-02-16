import React, { useState, useEffect } from 'react';
import { Car, AlertTriangle, Clock, Zap, Eye } from 'lucide-react';
import { ParkingSlot } from '@/lib/parking-data';
import { ExitCongestionPrediction } from '@/lib/parking-intelligence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DigitalTwinProps {
  slots: ParkingSlot[];
  congestionPrediction?: ExitCongestionPrediction;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ slots, congestionPrediction }) => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [hoveredSlot, setHoveredSlot] = useState<ParkingSlot | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const floorSlots = slots.filter(s => s.floor === selectedFloor);
  const zones = ['A', 'B', 'C', 'D'];

  const getSlotTimer = (entryTime?: Date) => {
    if (!entryTime) return null;
    const diff = currentTime.getTime() - new Date(entryTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getCongestionColor = (zone: string) => {
    if (!congestionPrediction) return '';
    // Exit zones (A, B) show congestion risk
    if ((zone === 'A' || zone === 'B') && 
        (congestionPrediction.riskLevel === 'high' || congestionPrediction.riskLevel === 'critical')) {
      return 'ring-2 ring-amber-500/50 bg-amber-500/5';
    }
    return '';
  };

  return (
    <div className="glass-card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Digital Twin</h2>
            <p className="text-xs text-muted-foreground">Real-time parking visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(floor => (
            <Button
              key={floor}
              variant={selectedFloor === floor ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFloor(floor)}
            >
              F{floor}
            </Button>
          ))}
        </div>
      </div>

      {/* Exit Zones Indicator */}
      {congestionPrediction && (congestionPrediction.riskLevel === 'high' || congestionPrediction.riskLevel === 'critical') && (
        <div className={cn(
          'mb-4 p-3 rounded-lg border flex items-center gap-3',
          congestionPrediction.riskLevel === 'critical' 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        )}>
          <Zap className="w-5 h-5" />
          <div>
            <span className="font-medium">Exit Congestion {congestionPrediction.riskLevel === 'critical' ? 'Critical' : 'Warning'}</span>
            <span className="text-sm ml-2 opacity-80">
              {congestionPrediction.expectedExits} vehicles expected in {congestionPrediction.timeWindow}
            </span>
          </div>
        </div>
      )}

      {/* 2D Map Grid */}
      <div className="relative bg-background/50 rounded-xl p-4 border border-border/30">
        {/* Entry/Exit indicators */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="w-8 h-12 bg-emerald-500/20 border border-emerald-500/50 rounded flex items-center justify-center">
            <span className="text-[10px] font-medium text-emerald-400 rotate-90">ENTRY</span>
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center gap-1">
          <div className="w-8 h-12 bg-rose-500/20 border border-rose-500/50 rounded flex items-center justify-center">
            <span className="text-[10px] font-medium text-rose-400 rotate-90">EXIT</span>
          </div>
        </div>

        <div className="space-y-4 mx-6">
          {zones.map(zone => {
            const zoneSlots = floorSlots.filter(s => s.zone === zone);
            const occupiedCount = zoneSlots.filter(s => s.status !== 'available').length;
            
            return (
              <div 
                key={zone} 
                className={cn(
                  'relative p-3 rounded-lg bg-card/50 transition-all duration-300',
                  getCongestionColor(zone)
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {zone}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {occupiedCount}/{zoneSlots.length} occupied
                  </span>
                </div>
                
                <div className="grid grid-cols-10 gap-1.5">
                  {zoneSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredSlot(slot)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      <div
                        className={cn(
                          'aspect-[2/3] rounded-md border transition-all duration-200 flex items-center justify-center cursor-pointer',
                          slot.status === 'available' && 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30',
                          slot.status === 'occupied' && 'bg-amber-500/30 border-amber-500/50',
                          slot.status === 'violation' && 'bg-rose-500/30 border-rose-500/50 animate-pulse',
                        )}
                      >
                        {slot.status !== 'available' && (
                          <Car className={cn(
                            'w-3 h-3',
                            slot.status === 'violation' ? 'text-rose-400' : 'text-amber-400'
                          )} />
                        )}
                        {slot.status === 'violation' && (
                          <AlertTriangle className="w-2 h-2 absolute top-0.5 right-0.5 text-rose-400" />
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      {hoveredSlot?.id === slot.id && (
                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover border border-border rounded-lg shadow-lg min-w-[140px] animate-fade-in-up">
                          <div className="text-xs font-medium">Slot {slot.id}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Status: <span className={cn(
                              slot.status === 'available' ? 'text-emerald-400' :
                              slot.status === 'violation' ? 'text-rose-400' : 'text-amber-400'
                            )}>{slot.status}</span>
                          </div>
                          {slot.vehicleNumber && (
                            <>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                Vehicle: {slot.vehicleNumber}
                              </div>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {getSlotTimer(slot.entryTime)}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Driving lanes */}
        <div className="absolute inset-y-4 left-14 w-1 bg-gradient-to-b from-transparent via-muted/30 to-transparent rounded" />
        <div className="absolute inset-y-4 right-14 w-1 bg-gradient-to-b from-transparent via-muted/30 to-transparent rounded" />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-4 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-4 rounded-sm bg-amber-500/30 border border-amber-500/50 flex items-center justify-center">
            <Car className="w-2 h-2 text-amber-400" />
          </div>
          <span className="text-xs text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-4 rounded-sm bg-rose-500/30 border border-rose-500/50 animate-pulse" />
          <span className="text-xs text-muted-foreground">Violation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-4 rounded-sm ring-2 ring-amber-500/50" />
          <span className="text-xs text-muted-foreground">Congestion Zone</span>
        </div>
      </div>
    </div>
  );
};
