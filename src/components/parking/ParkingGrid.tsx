import React, { useState } from 'react';
import { Car, AlertTriangle, Zap, Clock, MapPin, Accessibility } from 'lucide-react';
import { ParkingSlot } from '@/lib/parking-data';
import { cn } from '@/lib/utils';

interface ParkingGridProps {
  slots: ParkingSlot[];
  selectedFloor: number;
  highlightedSlot?: string;
  onSlotClick?: (slot: ParkingSlot) => void;
}

export const ParkingGrid: React.FC<ParkingGridProps> = ({
  slots,
  selectedFloor,
  highlightedSlot,
  onSlotClick,
}) => {
  const [hoveredSlot, setHoveredSlot] = useState<ParkingSlot | null>(null);
  const floorSlots = slots.filter(s => s.floor === selectedFloor);
  const zones = ['A', 'B', 'C', 'D'];

  const getSlotDuration = (entryTime?: Date) => {
    if (!entryTime) return null;
    const diff = Date.now() - new Date(entryTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {zones.map(zone => {
        const zoneSlots = floorSlots.filter(s => s.zone === zone);
        const availableCount = zoneSlots.filter(s => s.status === 'available').length;
        const occupancyPercent = Math.round(((zoneSlots.length - availableCount) / zoneSlots.length) * 100);

        return (
          <div key={zone} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">{zone}</span>
              </div>
              <span className="text-sm text-muted-foreground">Zone {zone}</span>
              <div className="ml-auto flex items-center gap-3">
                {/* Occupancy bar */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        occupancyPercent > 80 ? 'bg-rose-500' :
                        occupancyPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{occupancyPercent}%</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {availableCount}/{zoneSlots.length} free
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {zoneSlots.map(slot => {
                const isHighlighted = slot.id === highlightedSlot;
                const isHovered = hoveredSlot?.id === slot.id;

                return (
                  <div key={slot.id} className="relative">
                    <button
                      onClick={() => onSlotClick?.(slot)}
                      onMouseEnter={() => setHoveredSlot(slot)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      disabled={slot.status !== 'available' && !onSlotClick}
                      className={cn(
                        'relative aspect-[3/4] rounded-lg border-2 transition-all duration-500 flex flex-col items-center justify-center gap-1 w-full',
                        slot.status === 'available' && 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:scale-105 hover:bg-emerald-500/25 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer',
                        slot.status === 'occupied' && 'bg-amber-500/15 border-amber-500/40 text-amber-400 cursor-default',
                        slot.status === 'violation' && 'bg-rose-500/15 border-rose-500/40 text-rose-400 cursor-default animate-pulse',
                        slot.status === 'reserved' && 'bg-blue-500/15 border-blue-500/40 text-blue-400 cursor-default',
                        isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse-glow scale-110 z-10',
                        slot.hasEvCharger && slot.status === 'available' && 'border-cyan-500/50 bg-cyan-500/10',
                        slot.isAccessible && slot.status === 'available' && 'border-indigo-500/50 bg-indigo-500/10',
                      )}
                    >
                      {slot.status === 'occupied' || slot.status === 'violation' ? (
                        <Car className="w-4 h-4" />
                      ) : slot.status === 'reserved' ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : (
                        <>
                          <span className="text-xs font-medium">{slot.number}</span>
                          <div className="flex gap-0.5 mt-0.5">
                            {slot.hasEvCharger && (
                              <Zap className="w-2.5 h-2.5 text-cyan-400" />
                            )}
                            {slot.isAccessible && (
                              <Accessibility className="w-2.5 h-2.5 text-indigo-400" />
                            )}
                          </div>
                        </>
                      )}
                      {slot.status === 'violation' && (
                        <AlertTriangle className="w-3 h-3 absolute top-1 right-1" />
                      )}
                    </button>

                    {/* Tooltip */}
                    {isHovered && (slot.status === 'occupied' || slot.status === 'reserved') && (
                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-popover border border-border rounded-xl shadow-xl min-w-[160px] animate-scale-in-gentle pointer-events-none">
                        <div className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          Slot {slot.id}
                        </div>
                        <div className={cn(
                          'text-[10px] mb-1 font-medium',
                          slot.status === 'reserved' ? 'text-blue-400' : 'text-amber-400'
                        )}>
                          {slot.status.toUpperCase()}
                        </div>
                        {slot.vehicleNumber && (
                          <div className="text-[11px] font-mono text-foreground">
                            {slot.vehicleNumber}
                          </div>
                        )}
                        {slot.entryTime && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5" />
                            {getSlotDuration(slot.entryTime)}
                          </div>
                        )}
                        {slot.hasEvCharger && (
                          <div className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1">
                            <Zap className="w-2.5 h-2.5" />
                            EV Charger
                          </div>
                        )}
                        {slot.reservedBy && (
                          <div className="text-[10px] text-blue-400 mt-1">
                            Reserved: {slot.reservedBy}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border-2 border-emerald-500/40" />
          <span className="text-muted-foreground text-xs">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/20 border-2 border-amber-500/40" />
          <span className="text-muted-foreground text-xs">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/20 border-2 border-blue-500/40" />
          <span className="text-muted-foreground text-xs">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500/20 border-2 border-rose-500/40" />
          <span className="text-muted-foreground text-xs">Violation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-500/10 border-2 border-cyan-500/50 flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-cyan-400" />
          </div>
          <span className="text-muted-foreground text-xs">EV Charger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-500/10 border-2 border-indigo-500/50 flex items-center justify-center">
            <Accessibility className="w-2.5 h-2.5 text-indigo-400" />
          </div>
          <span className="text-muted-foreground text-xs">Accessible</span>
        </div>
      </div>
    </div>
  );
};
