import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Zap, PauseCircle, PlayCircle, Bell } from 'lucide-react';
import { ExitCongestionPrediction } from '@/lib/parking-intelligence';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface CongestionPredictionProps {
  prediction: ExitCongestionPrediction;
}

export const CongestionPrediction: React.FC<CongestionPredictionProps> = ({ prediction }) => {
  const riskColors = {
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  const riskLabels = {
    low: 'Low Risk',
    medium: 'Moderate Risk',
    high: 'High Risk',
    critical: 'Critical',
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'activate_lane': return PlayCircle;
      case 'pause_entry': return PauseCircle;
      case 'alert': return Bell;
      default: return CheckCircle;
    }
  };

  const capacityPercentage = Math.min(100, (prediction.expectedExits / prediction.currentCapacity) * 100);

  return (
    <div className="glass-card-elevated p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Exit Congestion AI</h3>
            <p className="text-xs text-muted-foreground">Predictive control agent</p>
          </div>
        </div>
        <div className={cn(
          'px-3 py-1.5 rounded-full border text-sm font-medium',
          riskColors[prediction.riskLevel]
        )}>
          {riskLabels[prediction.riskLevel]}
        </div>
      </div>

      {/* Capacity Gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{prediction.timeWindow} Forecast</span>
          <span className="font-medium">
            {prediction.expectedExits} / {prediction.currentCapacity} capacity
          </span>
        </div>
        <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-500',
              capacityPercentage > 100 ? 'bg-rose-500' :
              capacityPercentage > 75 ? 'bg-amber-500' :
              capacityPercentage > 50 ? 'bg-blue-500' : 'bg-emerald-500'
            )}
            style={{ width: `${Math.min(100, capacityPercentage)}%` }}
          />
          {capacityPercentage > 100 && (
            <div className="absolute inset-0 bg-rose-500/20 animate-pulse" />
          )}
        </div>
      </div>

      {/* Upcoming Exits */}
      {prediction.predictions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Predicted Exits
          </h4>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {prediction.predictions.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-secondary/30">
                <span className="font-mono text-xs">{p.vehicleNumber}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.expectedExit).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    p.confidence > 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    p.confidence > 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-muted text-muted-foreground'
                  )}>
                    {p.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {prediction.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">AI Recommendations</h4>
          <div className="space-y-1.5">
            {prediction.recommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Triggered Actions */}
      {prediction.actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Triggered Actions</h4>
          <div className="flex flex-wrap gap-2">
            {prediction.actions.map((action, i) => {
              const Icon = getActionIcon(action.type);
              return (
                <div 
                  key={i}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border',
                    action.type === 'pause_entry' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    action.type === 'activate_lane' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {action.description}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
