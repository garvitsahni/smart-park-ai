import React, { useMemo, useState } from 'react';
import { useParking } from '@/context/ParkingContext';
import { ParkingSlot } from '@/lib/parking-data';
import { Flame, Zap, Power, Leaf } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const HeatmapView = () => {
  const { slots } = useParking();
  const [activeFloor, setActiveFloor] = useState(1);
  const [ecoMode, setEcoMode] = useState(false);

  // Generate deterministic "heat" based on slot location (near exit = hotter, deeper = cooler)
  // Also factor in current occupancy
  const generateHeat = (slot: ParkingSlot) => {
    // Base heat depends on zone (A is usually closest to entrance/exit)
    let heat = slot.zone === 'A' ? 0.7 : slot.zone === 'B' ? 0.4 : 0.2;
    
    // Higher numbers in a zone are typically further away
    heat -= (slot.number * 0.05);

    // EV chargers might be hotter
    if (slot.hasEvCharger) heat += 0.3;

    // Current status bumps up the heat slightly
    if (slot.status === 'occupied') heat += 0.4;
    else if (slot.status === 'reserved') heat += 0.2;

    // Clamp between 0.1 and 1
    return Math.max(0.1, Math.min(1, heat));
  };
  const getHeatColor = (slot: ParkingSlot & { heat: number }) => {
    // If ecoMode is on and slot is completely idle, we dim it out entirely
    if (ecoMode && slot.heat <= 0.3 && slot.status === 'available') return 'from-slate-900 to-black bg-black border-white/5 opacity-20';
    
    if (slot.heat > 0.8) return 'from-red-500 to-rose-600 bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    if (slot.heat > 0.5) return 'from-amber-400 to-orange-500 bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    if (slot.heat > 0.3) return 'from-emerald-400 to-teal-500 bg-emerald-500/10 border-emerald-500/30';
    return 'from-blue-400 to-indigo-500 bg-blue-500/5 border-blue-500/20 opacity-50';
  };
  const floorSlots = useMemo(() => {
    return slots.filter(s => s.floor === activeFloor).map(s => ({
      ...s,
      heat: generateHeat(s)
    }));
  }, [slots, activeFloor]);

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="font-display text-xl font-bold flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Demand Heatmap & Energy
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Visually track popular zones and AI energy usage.</p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-lg border border-border/50">
            <Leaf className={`w-4 h-4 ${ecoMode ? 'text-emerald-400' : 'text-muted-foreground'}`} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold">AI Smart Lighting</span>
              <span className="text-[10px] text-muted-foreground">{ecoMode ? 'Saving ~42% Power' : 'Full Power Mode'}</span>
            </div>
            <Switch checked={ecoMode} onCheckedChange={setEcoMode} className="ml-2" />
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map(floor => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFloor === floor 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl border border-white/10 bg-black/40 p-8 overflow-hidden isolate">
        {/* Glow effect in background */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-red-500/10 blur-[100px] pointer-events-none rounded-full translate-y-1/2" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col gap-12 relative z-10 w-full max-w-4xl mx-auto">
          {/* Group by Zones */}
          {['A', 'B', 'C'].map(zone => {
            const zoneSlots = floorSlots.filter(s => s.zone === zone);
            if (zoneSlots.length === 0) return null;

            return (
              <div key={zone} className="flex gap-8 items-center border-l-2 border-white/5 pl-6 relative">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border border-white/10 shadow-lg">
                  {zone}
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {zoneSlots.map(slot => (
                    <div 
                      key={slot.id} 
                      className={`w-14 h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 bg-gradient-to-br ${getHeatColor(slot)}`}
                      title={`Heat Level: ${Math.round(slot.heat * 100)}%`}
                    >
                      <span className="text-xs font-mono font-bold text-white drop-shadow-md">
                        {slot.number}
                      </span>
                      {slot.hasEvCharger && <Zap className="w-3 h-3 text-white mix-blend-overlay" />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white/70">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Cold</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Warm</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Hot</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span> Critical</div>
        </div>
      </div>
    </div>
  );
};
