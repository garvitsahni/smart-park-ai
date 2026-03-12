import React from 'react';
import { Clock, MapPin, Car, QrCode, Ticket } from 'lucide-react';
import { VehicleType, VEHICLE_TYPE_CONFIG } from '@/lib/parking-data';

interface ParkingTicketProps {
  ticketId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  slotId: string;
  entryTime: Date;
  floor: number;
  zone: string;
}

export const ParkingTicket: React.FC<ParkingTicketProps> = ({
  ticketId,
  vehicleNumber,
  vehicleType,
  slotId,
  entryTime,
  floor,
  zone,
}) => {
  const config = VEHICLE_TYPE_CONFIG[vehicleType];

  // Generate a simple QR-like visual pattern from ticket ID
  const qrPattern = ticketId.split('').map((char, i) => {
    const val = char.charCodeAt(0) % 2;
    return val;
  });

  return (
    <div className="glass-card p-4 mb-4 relative overflow-hidden">
      {/* Ticket header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">PARKING TICKET</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{ticketId}</span>
      </div>

      {/* Dashed separator */}
      <div className="border-t border-dashed border-border/60 mb-3" />

      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div className="text-left space-y-2 flex-1">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Vehicle</div>
            <div className="font-mono font-bold text-sm">{vehicleNumber}</div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</div>
              <div className="text-sm font-medium flex items-center gap-1">
                {config.icon} {config.label}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Rate</div>
              <div className="text-sm font-medium">₹{config.ratePerHour}/hr</div>
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Slot
              </div>
              <div className="text-sm font-bold gradient-text">{slotId}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Entry
              </div>
              <div className="text-sm font-medium">
                {entryTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Simulation */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center">
            <div className="grid grid-cols-5 gap-[1px] w-full h-full">
              {Array.from({ length: 25 }).map((_, i) => {
                const filled = (qrPattern[i % qrPattern.length] === 1) || i < 3 || i > 21 || i % 5 === 0;
                return (
                  <div
                    key={i}
                    className={`rounded-[1px] ${filled ? 'bg-gray-900' : 'bg-gray-200'}`}
                  />
                );
              })}
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <QrCode className="w-2.5 h-2.5" /> Scan to pay
          </span>
        </div>
      </div>

      {/* Dashed separator */}
      <div className="border-t border-dashed border-border/60 mt-3 pt-2">
        <p className="text-[10px] text-muted-foreground text-center">
          🕐 First 10 minutes free • Show this ticket at exit gate
        </p>
      </div>

      {/* Decorative corner cuts */}
      <div className="absolute -left-2 top-1/2 w-4 h-4 rounded-full bg-background" />
      <div className="absolute -right-2 top-1/2 w-4 h-4 rounded-full bg-background" />
    </div>
  );
};
