import React from 'react';
import { Shield, TrendingUp, Clock, CreditCard, AlertTriangle, Gift } from 'lucide-react';
import { VehicleDNAScore } from '@/lib/parking-intelligence';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface DNAScoreCardProps {
  score: VehicleDNAScore;
  compact?: boolean;
}

export const DNAScoreCard: React.FC<DNAScoreCardProps> = ({ score, compact = false }) => {
  const levelColors = {
    green: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50',
    yellow: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
    red: 'text-rose-400 bg-rose-500/20 border-rose-500/50',
  };

  const levelLabels = {
    green: 'Excellent Driver',
    yellow: 'Average Driver',
    red: 'Needs Improvement',
  };

  if (compact) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
        levelColors[score.level]
      )}>
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">{score.overallScore}</span>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-16 h-16 rounded-2xl border-2 flex items-center justify-center',
            levelColors[score.level]
          )}>
            <span className="text-2xl font-bold">{score.overallScore}</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Parking DNA Score</h3>
            <p className={cn('text-sm', levelColors[score.level].split(' ')[0])}>
              {levelLabels[score.level]}
            </p>
          </div>
        </div>
        {score.discountEligible && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
            <Gift className="w-4 h-4" />
            <span>5% Discount</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              Slot Compliance
            </span>
            <span className="font-medium">{score.metrics.slotCompliance}%</span>
          </div>
          <Progress value={score.metrics.slotCompliance} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Timely Exit
            </span>
            <span className="font-medium">{score.metrics.timelyExit}%</span>
          </div>
          <Progress value={score.metrics.timelyExit} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              Off-Peak Usage
            </span>
            <span className="font-medium">{score.metrics.peakHourUsage}%</span>
          </div>
          <Progress value={score.metrics.peakHourUsage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5" />
              Payment History
            </span>
            <span className="font-medium">{score.metrics.paymentConsistency}%</span>
          </div>
          <Progress value={score.metrics.paymentConsistency} className="h-2" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{score.totalVisits}</span> visits
          {score.violations > 0 && (
            <span className="ml-3">
              <AlertTriangle className="w-3.5 h-3.5 inline-block text-amber-400 mr-1" />
              {score.violations} violations
            </span>
          )}
        </div>
        {score.penaltyMultiplier > 1 && (
          <div className="text-xs px-2 py-1 rounded bg-rose-500/20 text-rose-400">
            +{((score.penaltyMultiplier - 1) * 100).toFixed(0)}% penalty rate
          </div>
        )}
      </div>
    </div>
  );
};
