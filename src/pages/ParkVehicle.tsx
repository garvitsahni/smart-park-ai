import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { VehicleEntryForm } from '@/components/parking/VehicleEntryForm';
import { ParkingGrid } from '@/components/parking/ParkingGrid';
import { PaymentSimulator } from '@/components/parking/PaymentSimulator';
import { ActiveSessions } from '@/components/parking/ActiveSessions';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, CreditCard, Map, ListChecks, Zap, Accessibility } from 'lucide-react';
import { VehicleType } from '@/lib/parking-data';

const ParkVehicle = () => {
  const { slots, activeSessions, startParking, stats } = useParking();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [highlightedSlot, setHighlightedSlot] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedVehicleForExit, setSelectedVehicleForExit] = useState<string | undefined>();
  const [preSelectedSlotId, setPreSelectedSlotId] = useState<string | undefined>();

  const handleStartParking = (vehicleNumber: string, vehicleType?: VehicleType, preferredSlotId?: string, isAccessible?: boolean) => {
    const slot = startParking(vehicleNumber, vehicleType, preferredSlotId, isAccessible);
    if (slot) {
      setHighlightedSlot(slot.id);
      setSelectedFloor(slot.floor);
    }
    return slot;
  };

  const handleSelectForExit = (vehicleNumber: string) => {
    setSelectedVehicleForExit(vehicleNumber);
    setActiveTab('exit');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Driver <span className="gradient-text">Parking Interface</span>
          </h1>
          <p className="text-muted-foreground">
            Enter your vehicle, get AI-assigned slot, and pay seamlessly
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.available}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.occupied}</div>
            <div className="text-xs text-muted-foreground">Occupied</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4" />{stats.evSlotsAvailable}
            </div>
            <div className="text-xs text-muted-foreground">EV Chargers</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400 flex items-center justify-center gap-1">
              <Accessibility className="w-4 h-4" />{slots.filter(s => s.isAccessible && s.status === 'available').length}
            </div>
            <div className="text-xs text-muted-foreground">Accessible</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{activeSessions.length}</div>
            <div className="text-xs text-muted-foreground">Your Vehicles</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="entry" className="gap-2">
              <Car className="w-4 h-4" />
              Entry
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <ListChecks className="w-4 h-4" />
              Sessions
              {activeSessions.length > 0 && (
                <span className="ml-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeSessions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="w-4 h-4" />
              Slot Map
            </TabsTrigger>
            <TabsTrigger value="exit" className="gap-2" disabled={activeSessions.length === 0}>
              <CreditCard className="w-4 h-4" />
              Pay & Exit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="animate-fade-in-up">
            <VehicleEntryForm onSubmit={handleStartParking} preSelectedSlotId={preSelectedSlotId} />
          </TabsContent>

          <TabsContent value="sessions" className="animate-fade-in-up">
            <div className="max-w-md mx-auto">
              <ActiveSessions onSelectForExit={handleSelectForExit} />
            </div>
          </TabsContent>

          <TabsContent value="map" className="animate-fade-in-up">
            <div className="space-y-6">
              {/* Floor selector */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map(floor => (
                  <Button
                    key={floor}
                    variant={selectedFloor === floor ? 'default' : 'outline'}
                    onClick={() => setSelectedFloor(floor)}
                  >
                    Floor {floor}
                  </Button>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground mb-4">
                💡 Tip: Click on any available spot to immediately select it for parking. Look for the <Zap className="w-3 h-3 inline text-cyan-400" /> icon for EV Chargers and <Accessibility className="w-3 h-3 inline text-indigo-400" /> for Accessible spots.
              </div>

              <ParkingGrid
                slots={slots}
                selectedFloor={selectedFloor}
                highlightedSlot={highlightedSlot}
                onSlotClick={(slot) => {
                  setPreSelectedSlotId(slot.id);
                  setActiveTab('entry');
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="exit" className="animate-fade-in-up">
            <PaymentSimulator
              selectedVehicle={selectedVehicleForExit}
              onBack={() => {
                setSelectedVehicleForExit(undefined);
                setActiveTab('sessions');
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ParkVehicle;
