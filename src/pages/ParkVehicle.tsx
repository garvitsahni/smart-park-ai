import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { VehicleEntryForm } from '@/components/parking/VehicleEntryForm';
import { ParkingGrid } from '@/components/parking/ParkingGrid';
import { PaymentSimulator } from '@/components/parking/PaymentSimulator';
import { useParking } from '@/context/ParkingContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, CreditCard, Map } from 'lucide-react';

const ParkVehicle = () => {
  const { slots, activeSession, startParking, stats } = useParking();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [highlightedSlot, setHighlightedSlot] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('entry');

  const handleStartParking = (vehicleNumber: string) => {
    const slot = startParking(vehicleNumber);
    if (slot) {
      setHighlightedSlot(slot.id);
      setSelectedFloor(slot.floor);
    }
    return slot;
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
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.available}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.occupied}</div>
            <div className="text-xs text-muted-foreground">Occupied</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalSlots}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="entry" className="gap-2">
              <Car className="w-4 h-4" />
              Entry
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="w-4 h-4" />
              Slot Map
            </TabsTrigger>
            <TabsTrigger value="exit" className="gap-2" disabled={!activeSession}>
              <CreditCard className="w-4 h-4" />
              Exit & Pay
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="animate-fade-in-up">
            <VehicleEntryForm onSubmit={handleStartParking} />
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

              <ParkingGrid
                slots={slots}
                selectedFloor={selectedFloor}
                highlightedSlot={highlightedSlot}
              />
            </div>
          </TabsContent>

          <TabsContent value="exit" className="animate-fade-in-up">
            <PaymentSimulator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ParkVehicle;
