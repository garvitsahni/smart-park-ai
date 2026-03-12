import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActiveSession } from '@/lib/parking-data';
import { MapPin, ArrowUp, Navigation, Smartphone, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ARNavigationOverlayProps {
  session: ActiveSession;
  onClose: () => void;
}

export const ARNavigationOverlay: React.FC<ARNavigationOverlayProps> = ({ session, onClose }) => {
  const [distance, setDistance] = useState(120);
  const [stage, setStage] = useState<'walking' | 'arrived'>('walking');

  useEffect(() => {
    if (stage === 'arrived') return;
    
    const interval = setInterval(() => {
      setDistance(prev => {
        if (prev <= 5) {
          setStage('arrived');
          return 0;
        }
        return prev - Math.floor(Math.random() * 8 + 2);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      {/* Decorative AR Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgoJCTxwYXRoIGQ9Ik0wIDBMMCA0MEw0MCA0MEw0MCAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KCTwvc3ZnPg==')] opacity-30 pointer-events-none"></div>
      
      {/* Close Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose} 
        className="absolute top-6 right-6 z-50 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* AR Viewport */}
      <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden isolate flex flex-col pt-12">
        {/* Dynamic Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
        
        {/* AR Camera Simulated Feed (Gradient background) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black z-0"></div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          {stage === 'walking' ? (
            <div className="flex flex-col items-center perspective-[1000px]">
               <div className="bg-primary/20 p-4 rounded-full mb-8 animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                 <ArrowUp className="w-16 h-16 text-cyan-400 rotate-x-45 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ transform: 'rotateX(45deg)' }} />
               </div>
               
               <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                 {distance} m
               </h2>
               <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/30">
                 <Navigation className="w-4 h-4" />
                 <span className="text-sm font-medium">Head straight to Zone {session.assignedSlot.zone}</span>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-emerald-500/50">
                <MapPin className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-md">
                You have arrived
              </h2>
              <div className="text-center text-muted-foreground mb-8">
                 Your {session.vehicleType === 'ev' ? 'EV' : 'vehicle'} <span className="text-white font-mono">{session.vehicleNumber}</span> is at Slot {session.assignedSlot.id}.
              </div>
              
              <Button onClick={onClose} variant="hero" className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>

        {/* Telemetry Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="glass-card p-4 rounded-2xl bg-black/50 border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1"><Smartphone className="w-3 h-3"/> Target Location</span>
              {session.assignedSlot.hasEvCharger && <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full"><Zap className="w-3 h-3"/> EV Active</span>}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display font-bold text-lg text-white leading-tight">Floor {session.assignedSlot.floor}</div>
                <div className="text-sm text-primary">Slot {session.assignedSlot.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
