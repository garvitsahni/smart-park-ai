import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertCircle, ScanLine, Bot, CheckCircle2, Video, VideoOff } from 'lucide-react';
import { generateVehicleNumber } from '@/lib/parking-data';
import { Button } from '@/components/ui/button';
import { useParking } from '@/context/ParkingContext';

export const CameraMonitor = () => {
  const { startParking, activeSessions } = useParking();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPlate, setScannedPlate] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logMessages, setLogMessages] = useState<string[]>([
    'Camera feed initialized.',
    'Waiting for vehicles...',
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

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
      addLog('Live camera feed disconnected.');
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setIsLiveCamera(true);
        addLog('Live camera feed connected.');
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        addLog('Error: Could not access live camera.');
      }
    }
  };

  const addLog = (msg: string) => {
    setLogMessages(prev => [...prev.slice(-4), msg]);
  };

  const simulateVehicleArrival = () => {
    setIsScanning(true);
    setMatchStatus('idle');
    setScannedPlate(null);
    addLog('Vehicle detected approaching entrace...');

    setTimeout(() => {
      const plate = generateVehicleNumber();
      setScannedPlate(plate);
      addLog(`ALPR scanned plate: ${plate}`);
      
      setTimeout(() => {
        setIsScanning(false);
        // Automatically try to allocate a slot
        const slot = startParking(plate, 'car');
        if (slot) {
          setMatchStatus('success');
          addLog(`Access granted. Assigned slot ${slot.floor}-${slot.zone}-${slot.number}.`);
        } else {
          setMatchStatus('error');
          if (activeSessions.some(s => s.vehicleNumber === plate)) {
            addLog(`Access denied: Vehicle ${plate} is already parked.`);
          } else {
            addLog(`Access denied: Lot is full.`);
          }
        }
      }, 1500);

    }, 2000);
  };

  return (
    <div className="glass-card flex flex-col h-full border border-primary/20 bg-background/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center bg-secondary/30">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <h3 className="font-medium text-sm">Gate 1 ALPR Camera</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Camera Feed Simulator / Live Camera */}
        <div className="relative w-full aspect-video bg-black/80 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center isolate">
          
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLiveCamera ? 'opacity-100' : 'opacity-0'}`}
          />
          {isScanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="w-full h-1 bg-cyan-400/50 absolute top-0 animate-scan pointer-events-none" style={{ boxShadow: '0 0 15px 2px rgba(34,211,238,0.5)' }}></div>
               <ScanLine className="w-12 h-12 text-cyan-400 animate-pulse mb-2" />
               <span className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">ANALYZING FRAME</span>
            </div>
          ) : scannedPlate ? (
            <div className="flex flex-col items-center gap-3">
              <div className={`px-4 py-2 border-2 ${matchStatus === 'success' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : matchStatus === 'error' ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-white/20 text-white'} rounded text-xl font-mono tracking-[0.2em] font-bold shadow-lg`}>
                {scannedPlate}
              </div>
              {matchStatus === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              {matchStatus === 'error' && <AlertCircle className="w-6 h-6 text-red-400" />}
            </div>
          ) : (
             <span className={`text-white/30 font-mono text-xs tracking-widest absolute bottom-4 right-4 ${isLiveCamera ? 'bg-black/50 px-2 py-1 rounded' : ''}`}>
               {isLiveCamera ? 'LIVE CAMERA STREAM' : 'AWAITING VEHICLE...'}
             </span>
          )}

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgoJCTxwYXRoIGQ9Ik0wIDBMMCA0MEw0MCA0MEw0MCAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KCTwvc3ZnPg==')] opacity-50 pointer-events-none"></div>
          
          {/* Timestamp overlay */}
          <div className="absolute top-3 left-3 flex flex-col font-mono text-[10px] text-white/70">
            <span>CAM-GT1</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Console logs */}
        <div className="bg-black/40 rounded-lg p-3 border border-white/5 h-24 overflow-y-auto font-mono text-xs flex flex-col justify-end">
          {logMessages.map((msg, i) => (
            <div key={i} className="flex gap-2 text-muted-foreground my-0.5 animate-fade-in-up">
              <span className="text-cyan-500/70">{'>'}</span>
              <span className={msg.includes('success') || msg.includes('granted') ? 'text-emerald-400' : msg.includes('denied') ? 'text-red-400' : ''}>
                {msg}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Button 
            onClick={toggleCamera} 
            disabled={isScanning}
            className="w-1/3"
            variant={isLiveCamera ? "destructive" : "secondary"}
          >
            {isLiveCamera ? (
              <><VideoOff className="w-4 h-4 mr-2" /> Stop Live Feed</>
            ) : (
              <><Video className="w-4 h-4 mr-2" /> Use Live Camera</>
            )}
          </Button>

          <Button 
            onClick={simulateVehicleArrival} 
            disabled={isScanning}
            className="w-2/3"
            variant="heroOutline"
          >
            <Bot className="w-4 h-4 mr-2" />
            Simulate ALPR Event on Feed
          </Button>
        </div>
      </div>
    </div>
  );
};
