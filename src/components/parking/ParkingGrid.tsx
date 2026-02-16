import React from 'react';
import { Car, AlertTriangle } from 'lucide-react';
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
  const floorSlots = slots.filter(s => s.floor === selectedFloor);
  const zones = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {zones.map(zone => {
        const zoneSlots = floorSlots.filter(s => s.zone === zone);
        
        return (
          <div key={zone} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">{zone}</span>
              </div>
              <span className="text-sm text-muted-foreground">Zone {zone}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {zoneSlots.filter(s => s.status === 'available').length}/{zoneSlots.length} available
              </span>
            </div>
            
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {zoneSlots.map(slot => {
                const isHighlighted = slot.id === highlightedSlot;
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => onSlotClick?.(slot)}
                    disabled={slot.status !== 'available'}
                    className={cn(
                      'relative aspect-[3/4] rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1',
                      slot.status === 'available' && 'slot-available hover:scale-105 hover:glow-success cursor-pointer',
                      slot.status === 'occupied' && 'slot-occupied cursor-not-allowed',
                      slot.status === 'violation' && 'slot-violation cursor-not-allowed',
                      slot.status === 'reserved' && 'slot-reserved cursor-not-allowed',
                      isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse-glow scale-110',
                    )}
                  >
                    {slot.status === 'occupied' || slot.status === 'violation' ? (
                      <Car className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{slot.number}</span>
                    )}
                    {slot.status === 'violation' && (
                      <AlertTriangle className="w-3 h-3 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded slot-available border" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded slot-occupied border" />
          <span className="text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded slot-violation border" />
          <span className="text-muted-foreground">Violation</span>
        </div>
      </div>
    </div>
  );
};
