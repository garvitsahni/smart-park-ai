import React from 'react';
import { format } from 'date-fns';
import { Car, AlertTriangle, CheckCircle, Clock, Bike, Zap, Truck, Ticket } from 'lucide-react';
import { VehicleLog, VehicleType, VEHICLE_TYPE_CONFIG } from '@/lib/parking-data';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface VehicleLogsTableProps {
  logs: VehicleLog[];
  limit?: number;
}

const vehicleTypeEmoji: Record<VehicleType, string> = {
  car: '🚗',
  suv: '🚙',
  bike: '🏍️',
  ev: '⚡',
};

export const VehicleLogsTable: React.FC<VehicleLogsTableProps> = ({ logs, limit }) => {
  const displayLogs = limit ? logs.slice(0, limit) : logs;

  const getStatusBadge = (status: VehicleLog['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">
            <Clock className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'violation':
        return (
          <Badge variant="outline" className="border-rose-500/50 text-rose-400 bg-rose-500/10">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Violation
          </Badge>
        );
    }
  };

  if (displayLogs.length === 0) {
    return (
      <div className="glass-card-elevated p-8 text-center">
        <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">No vehicle logs yet. Park a vehicle to see activity here.</p>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Vehicle Logs</h3>
        <p className="text-sm text-muted-foreground">
          {limit ? `Showing latest ${displayLogs.length} of ${logs.length} records` : `${displayLogs.length} records`}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Vehicle</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Slot</TableHead>
              <TableHead className="text-muted-foreground">Entry</TableHead>
              <TableHead className="text-muted-foreground">Exit</TableHead>
              <TableHead className="text-muted-foreground">Duration</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Payment</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayLogs.map((log) => (
              <TableRow key={log.id} className="border-border hover:bg-secondary/30">
                <TableCell className="font-mono font-medium text-sm">{log.vehicleNumber}</TableCell>
                <TableCell>
                  <span className="text-sm" title={VEHICLE_TYPE_CONFIG[log.vehicleType || 'car']?.label}>
                    {vehicleTypeEmoji[log.vehicleType || 'car']}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{log.slotId}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(log.entryTime), 'MMM d, HH:mm')}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {log.exitTime ? format(new Date(log.exitTime), 'MMM d, HH:mm') : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.duration ? `${log.duration.toFixed(1)}h` : '-'}
                </TableCell>
                <TableCell className={cn(
                  'font-medium',
                  log.status === 'violation' ? 'text-rose-400' : 'text-foreground'
                )}>
                  {log.amount ? `₹${log.amount}` : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">{log.paymentMethod || '-'}</TableCell>
                <TableCell>{getStatusBadge(log.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
