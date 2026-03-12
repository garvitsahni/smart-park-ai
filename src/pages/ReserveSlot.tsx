import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleType, VEHICLE_TYPE_CONFIG, validateVehicleNumber } from '@/lib/parking-data';
import {
  CalendarClock, Car, CheckCircle, AlertCircle, Bike, Truck, Zap,
  Clock, MapPin, X, Ticket
} from 'lucide-react';
import { PriceForecaster } from '@/components/parking/PriceForecaster';

const ReserveSlot = () => {
  const { reserveSlot, reservations, cancelReservation, stats } = useParking();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('2');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeReservations = reservations.filter(r => r.status === 'upcoming');
  const pastReservations = reservations.filter(r => r.status !== 'upcoming');

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
    if (!validateVehicleNumber(cleanNumber)) {
      setError('Invalid Indian vehicle number format');
      return;
    }

    if (!startTime) {
      setError('Please select a start time');
      return;
    }

    const start = new Date(startTime);
    if (start <= new Date()) {
      setError('Start time must be in the future');
      return;
    }

    const durationHrs = parseFloat(duration);
    const end = new Date(start.getTime() + durationHrs * 60 * 60 * 1000);

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const reservation = reserveSlot(cleanNumber, vehicleType, start, end);
    setIsProcessing(false);

    if (reservation) {
      setSuccessMsg(`Slot ${reservation.slotId} reserved for ${cleanNumber}`);
      setVehicleNumber('');
      setStartTime('');
    } else {
      setError('No slots available for reservation');
    }
  };

  const vehicleIcons: Record<VehicleType, React.ReactNode> = {
    car: <Car className="w-4 h-4" />,
    suv: <Truck className="w-4 h-4" />,
    bike: <Bike className="w-4 h-4" />,
    ev: <Zap className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Reserve</span> a Slot
          </h1>
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-sm mb-4 bg-cyan-950/30 px-4 py-1.5 rounded-full w-fit mx-auto border border-cyan-500/20">
            <Clock className="w-4 h-4" />
            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            <span className="opacity-50 mx-1">|</span>
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <p className="text-muted-foreground">
            Pre-book your parking spot and skip the queue
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Reservation Form */}
          <div className="glass-card-elevated p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">New Reservation</h2>
                <p className="text-xs text-muted-foreground">{stats.available} slots available</p>
              </div>
            </div>

            <form onSubmit={handleReserve} className="space-y-5">
              {/* Vehicle Number */}
              <div className="space-y-2">
                <Label htmlFor="resVehicleNumber">Vehicle Number</Label>
                <Input
                  id="resVehicleNumber"
                  placeholder="e.g., MH12AB1234"
                  value={vehicleNumber}
                  onChange={(e) => { setVehicleNumber(e.target.value.toUpperCase()); setError(null); }}
                  className="font-mono tracking-wider"
                  maxLength={12}
                />
              </div>

              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['bike', 'car', 'suv', 'ev'] as VehicleType[]).map(type => {
                    const config = VEHICLE_TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setVehicleType(type)}
                        className={`p-2 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1 text-xs ${
                          vehicleType === type
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                      >
                        <span>{config.icon}</span>
                        <span className="font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setError(null); }}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                    <SelectItem value="4">4 Hours</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                    <SelectItem value="8">8 Hours (Full Day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isProcessing || !vehicleNumber.trim() || !startTime}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Reserving...
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-5 h-5 mr-2" />
                    Reserve Slot
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Right Column: Price Forecaster & Reservations */}
          <div className="space-y-6">
            <PriceForecaster />
            
            <div>
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Your Reservations ({activeReservations.length})
              </h2>

              {activeReservations.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <p className="text-muted-foreground text-sm">No active reservations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeReservations.map(res => {
                    const config = VEHICLE_TYPE_CONFIG[res.vehicleType];
                    return (
                      <div key={res.id} className="glass-card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white`}>
                              {vehicleIcons[res.vehicleType]}
                            </div>
                            <div>
                              <div className="font-mono font-bold text-sm">{res.vehicleNumber}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                Slot {res.slotId}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(res.startTime).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                                {' → '}
                                {new Date(res.endTime).toLocaleTimeString('en-IN', {
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelReservation(res.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {pastReservations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Past Reservations</h3>
                <div className="space-y-2">
                  {pastReservations.slice(0, 5).map(res => (
                    <div key={res.id} className="glass-subtle p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{res.vehicleNumber}</span>
                        <span className="text-xs text-muted-foreground">→ {res.slotId}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        res.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        res.status === 'cancelled' ? 'bg-muted text-muted-foreground' : ''
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReserveSlot;
