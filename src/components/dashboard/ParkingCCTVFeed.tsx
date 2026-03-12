import React, { useState, useEffect, useRef } from 'react';
import { Camera, Maximize2, Minimize2, Zap, Video, VideoOff } from 'lucide-react';
import { useParking } from '@/context/ParkingContext';

export const ParkingCCTVFeed = ({ zoneName, floorFilter, zoneFilter }: { zoneName: string, floorFilter: number, zoneFilter: string }) => {
  const { slots } = useParking();
  const [time, setTime] = useState(new Date());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Cleanup stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleCamera = async () => {
    if (isLiveCamera) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsLiveCamera(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setIsLiveCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const visibleSlots = slots.filter(s => s.floor === floorFilter && s.zone === zoneFilter);

  return (
    <div className={`glass-card flex flex-col border border-primary/20 overflow-hidden group transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-4 sm:inset-10 z-[100] shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-background/95 backdrop-blur-xl' 
        : 'h-full relative bg-background/50'
    }`}>
      <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center bg-secondary/30">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">{zoneName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">REC</span>
        </div>
      </div>

      <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center p-4 isolate">
        {/* Grayscale filter to make it look like CCTV */}
        <div className="absolute inset-0 grayscale-[80%] contrast-125 brightness-75 pointer-events-none z-10 mix-blend-overlay"></div>
        
        {/* Scanlines overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgoJCTxwYXRoIGQ9Ik0wIDBMMCA0MEw0MCA0MEw0MCAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KCTwvc3ZnPg==')] opacity-50 pointer-events-none z-20"></div>

        {/* Timestamp */}
        <div className="absolute top-4 left-4 font-mono text-white/80 text-xs z-30 drop-shadow-md flex flex-col">
          <span>{zoneName.toUpperCase()}</span>
          <span>{time.toLocaleDateString()} {time.toLocaleTimeString()}</span>
        </div>

        {/* Live Camera Feed */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${isLiveCamera ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Visual representation of parking spots */}
        <div className={`perspective-parking w-full h-full flex items-center justify-center transition-opacity duration-300 ${isLiveCamera ? 'opacity-0' : 'opacity-100'}`}>
          <div className="grid grid-cols-5 gap-3 transform rotate-x-12 scale-90 w-full max-w-sm">
            {visibleSlots.slice(0, 10).map(slot => (
              <div 
                key={slot.id} 
                className={`aspect-[2/3] border-2 rounded-sm relative flex flex-col items-center justify-center transition-colors
                  ${slot.status === 'occupied' ? 'border-amber-500/80 bg-amber-500/10' : 
                    slot.status === 'reserved' ? 'border-blue-500/80 bg-blue-500/10' : 
                    'border-white/20 bg-white/5'}`}
              >
                <span className="absolute top-1 left-1 text-[8px] text-white/40">{slot.number}</span>
                {slot.hasEvCharger && <Zap className="absolute top-1 right-1 w-2 h-2 text-cyan-500/50" />}
                
                {slot.status === 'occupied' && (
                  <div className="w-4/5 h-3/4 bg-amber-100 rounded shadow-lg shadow-black/50 flex items-center justify-center -translate-y-1">
                    <div className="w-full text-[8px] font-mono text-center text-black/80 rotate-90 scale-75 truncate px-1">
                      {slot.vehicleNumber}
                    </div>
                  </div>
                )}
                {slot.status === 'reserved' && (
                  <div className="w-1/2 h-1/2 border border-blue-400 border-dashed rounded flex items-center justify-center">
                    <span className="text-[10px] text-blue-400">R</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Camera Toggle Button */}
        <button 
          onClick={toggleCamera}
          className="absolute bottom-4 left-4 z-30 text-white/50 hover:text-white transition-colors bg-black/40 p-2 rounded-full backdrop-blur-sm"
          title={isLiveCamera ? "Switch to Digital Twin" : "Switch to Live Camera"}
        >
          {isLiveCamera ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Expand button (Functional Fullscreen Toggle) */}
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute bottom-4 right-4 z-30 text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100 bg-black/40 p-2 rounded-full backdrop-blur-sm"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
      
      {/* CCTV Meta */}
      <div className="h-10 border-t border-border/50 bg-black/60 flex items-center justify-between px-4 text-xs font-mono text-white/50">
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</span>
        <span>FPS: 24</span>
        <span>1080P</span>
      </div>
    </div>
  );
};
