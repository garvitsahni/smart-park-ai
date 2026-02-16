import React from 'react';
import { Leaf, Fuel, Wind, TreeDeciduous, TrendingUp, Sparkles, Building } from 'lucide-react';
import { SustainabilityMetrics } from '@/lib/civic-intelligence';
import { cn } from '@/lib/utils';

interface SustainabilityPanelProps {
  metrics: SustainabilityMetrics;
}

export const SustainabilityPanel: React.FC<SustainabilityPanelProps> = ({ metrics }) => {
  return (
    <div className="glass-card-elevated overflow-hidden animate-smooth-fade-in">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-green-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                Smart City Impact
              </h2>
              <p className="text-sm text-muted-foreground">ESG & Sustainability Intelligence</p>
            </div>
          </div>
          <div className="ai-disclosure">
            <Sparkles className="w-3 h-3" />
            AI Tracked
          </div>
        </div>
      </div>

      {/* Main metrics */}
      <div className="p-6 space-y-6">
        {/* Key stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-subtle p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Wind className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-bold gradient-text-eco">
              {metrics.co2Avoided.kg.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">kg CO₂ Avoided</div>
          </div>

          <div className="glass-subtle p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Fuel className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold gradient-text-reward">
              {metrics.fuelSaved.liters.toFixed(1)}L
            </div>
            <div className="text-xs text-muted-foreground">Fuel Saved</div>
          </div>

          <div className="glass-subtle p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <TreeDeciduous className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <div className="text-2xl font-bold gradient-text">
              {metrics.co2Avoided.treesEquivalent}
            </div>
            <div className="text-xs text-muted-foreground">Trees Equivalent</div>
          </div>

          <div className="glass-subtle p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold gradient-text">
              ₹{metrics.fuelSaved.rupees}
            </div>
            <div className="text-xs text-muted-foreground">Saved for Drivers</div>
          </div>
        </div>

        {/* City impact */}
        <div className="glass-subtle p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Civic Impact</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.cityImpact.vehiclesOptimized}</div>
              <div className="text-xs text-muted-foreground">Vehicles Helped</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.cityImpact.peakHoursSmoothed}</div>
              <div className="text-xs text-muted-foreground">Peak Hours Smoothed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{metrics.cityImpact.congestionReduced}</div>
              <div className="text-xs text-muted-foreground">Congestion Reduced</div>
            </div>
          </div>
        </div>

        {/* Search time saved visualization */}
        <div className="glass-subtle p-4 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Parking Search Time Saved</h3>
            <span className="text-sm text-muted-foreground">
              Avg: {metrics.searchTimeSaved.average} min/vehicle
            </span>
          </div>
          <div className="space-y-2">
            {metrics.dailyTrend.map((day, index) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="w-8 text-xs text-muted-foreground">{day.date}</span>
                <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min((day.saved / 100) * 100, 100)}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
                <span className="text-xs text-emerald-400 w-16 text-right">
                  {day.saved.toFixed(0)} min
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Eco reward multiplier */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="badge-eco px-3 py-1 rounded-full text-sm">
                Eco Multiplier: {metrics.ecoRewardMultiplier.toFixed(2)}x
              </div>
              <span className="text-sm text-muted-foreground">
                Applied to all rewards
              </span>
            </div>
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/20 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          Environmental impact calculated using standard vehicle emission factors. 
          These are estimates for awareness purposes.
        </p>
      </div>
    </div>
  );
};
