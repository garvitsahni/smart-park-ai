import React, { useState, useEffect } from 'react';
import { Car, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SlotState = 'idle' | 'reserved' | 'occupied' | 'exiting';

interface ParkingSlot3D {
  id: string;
  floor: number;
  zone: string;
  number: number;
  state: SlotState;
  vehicleNumber?: string;
  entryTime?: Date;
  estimatedExit?: Date;
}

interface ParkingVisualization3DProps {
  slots: ParkingSlot3D[];
  selectedFloor: number;
  onFloorChange: (floor: number) => void;
  highlightedSlot?: string;
  onSlotSelect?: (slot: ParkingSlot3D) => void;
}

export const ParkingVisualization3D: React.FC<ParkingVisualization3DProps> = ({
  slots,
  selectedFloor,
  onFloorChange,
  highlightedSlot,
  onSlotSelect,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const floorSlots = slots.filter(s => s.floor === selectedFloor);
  const zones = ['A', 'B', 'C', 'D'];

  const getTimeRemaining = (exitTime?: Date) => {
    if (!exitTime) return null;
    const diff = exitTime.getTime() - currentTime.getTime();
    if (diff <= 0) return 'Soon';
    const mins = Math.floor(diff / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const getStateColors = (state: SlotState) => {
    switch (state) {
      case 'idle':
        return 'bg-teal-500/15 border-teal-500/40 text-teal-400 shadow-[0_0_15px_hsl(180_50%_45%/0.2)]';
      case 'reserved':
        return 'bg-blue-500/15 border-blue-500/40 text-blue-400 shadow-[0_0_15px_hsl(220_60%_55%/0.2)]';
      case 'occupied':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
      case 'exiting':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-400 animate-calm-pulse';
    }
  };

  return (
    <div className="glass-card-elevated p-6 animate-smooth-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Live Parking View</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="ai-disclosure">AI Assisted</span>
              <span className="ml-1">Updated in real-time</span>
            </p>
          </div>
        </div>
        
        {/* Floor selector */}
        <div className="flex items-center gap-1 glass-subtle p-1">
          {[1, 2, 3].map(floor => (
            <button
              key={floor}
              onClick={() => onFloorChange(floor)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                selectedFloor === floor
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Level {floor}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Perspective Container */}
      <div className="perspective-parking relative">
        {/* Entry/Exit labels */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-10">
          <div className="glass-subtle px-3 py-6 rounded-xl flex flex-col items-center gap-1">
            <ArrowRight className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-medium text-teal-400 writing-vertical">ENTRY</span>
          </div>
        </div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
          <div className="glass-subtle px-3 py-6 rounded-xl flex flex-col items-center gap-1">
            <ArrowRight className="w-4 h-4 text-purple-400 rotate-180" />
            <span className="text-xs font-medium text-purple-400 writing-vertical">EXIT</span>
          </div>
        </div>

        {/* Parking grid with 3D effect */}
        <div className="bg-gradient-to-b from-card/50 to-background/50 rounded-2xl border border-border/30 p-6 mx-8">
          <div className="space-y-4">
            {zones.map((zone, zoneIndex) => {
              const zoneSlots = floorSlots.filter(s => s.zone === zone);
              const idleCount = zoneSlots.filter(s => s.state === 'idle').length;
              const exitingCount = zoneSlots.filter(s => s.state === 'exiting').length;
              
              return (
                <div 
                  key={zone} 
                  className="relative animate-slide-up-gentle"
                  style={{ animationDelay: `${zoneIndex * 100}ms` }}
                >
                  {/* Zone header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                      <span className="text-sm font-bold text-primary">{zone}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Zone {zone}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      {idleCount > 0 && (
                        <span className="text-xs text-teal-400">
                          {idleCount} available
                        </span>
                      )}
                      {exitingCount > 0 && (
                        <span className="text-xs text-purple-400">
                          {exitingCount} departing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slots */}
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {zoneSlots.map(slot => {
                      const isHighlighted = slot.id === highlightedSlot;
                      const isHovered = slot.id === hoveredSlot;
                      
                      return (
                        <div
                          key={slot.id}
                          className="relative"
                          onMouseEnter={() => setHoveredSlot(slot.id)}
                          onMouseLeave={() => setHoveredSlot(null)}
                        >
                          <button
                            onClick={() => slot.state === 'idle' && onSlotSelect?.(slot)}
                            disabled={slot.state !== 'idle'}
                            className={cn(
                              'slot-3d w-full aspect-[3/4] rounded-xl border-2 transition-all duration-500 flex flex-col items-center justify-center gap-0.5',
                              getStateColors(slot.state),
                              slot.state === 'idle' && 'cursor-pointer hover:scale-105',
                              slot.state !== 'idle' && 'cursor-default',
                              isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                            )}
                          >
                            {slot.state !== 'idle' ? (
                              <>
                                <Car className="w-4 h-4" />
                                {slot.state === 'exiting' && (
                                  <span className="text-[8px] font-medium">
                                    {getTimeRemaining(slot.estimatedExit)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs font-semibold">{slot.number}</span>
                            )}
                          </button>

                          {/* Tooltip on hover */}
                          {isHovered && (
                            <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 animate-scale-in-gentle">
                              <div className="glass-card-elevated p-3 min-w-[140px] text-left">
                                <div className="font-medium text-sm mb-1">
                                  Slot {slot.floor}-{slot.zone}-{slot.number}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  Status: <span className={cn(
                                    slot.state === 'idle' && 'text-teal-400',
                                    slot.state === 'reserved' && 'text-blue-400',
                                    slot.state === 'occupied' && 'text-amber-400',
                                    slot.state === 'exiting' && 'text-purple-400'
                                  )}>{slot.state}</span>
                                </div>
                                {slot.vehicleNumber && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Vehicle: {slot.vehicleNumber}
                                  </div>
                                )}
                                {slot.state === 'exiting' && slot.estimatedExit && (
                                  <div className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Departing in {getTimeRemaining(slot.estimatedExit)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Driving lane indicators */}
          <div className="absolute inset-y-6 left-16 w-0.5 bg-gradient-to-b from-transparent via-muted/40 to-transparent" />
          <div className="absolute inset-y-6 right-16 w-0.5 bg-gradient-to-b from-transparent via-muted/40 to-transparent" />
        </div>
      </div>

      {/* Legend - calm, informative */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t border-border/30">
        {[
          { state: 'idle', label: 'Available', color: 'bg-teal-500/30 border-teal-500/50' },
          { state: 'reserved', label: 'Reserved', color: 'bg-blue-500/30 border-blue-500/50' },
          { state: 'occupied', label: 'Occupied', color: 'bg-amber-500/30 border-amber-500/50' },
          { state: 'exiting', label: 'Departing', color: 'bg-purple-500/30 border-purple-500/50' },
        ].map(item => (
          <div key={item.state} className="flex items-center gap-2">
            <div className={cn('w-4 h-5 rounded border', item.color)} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
