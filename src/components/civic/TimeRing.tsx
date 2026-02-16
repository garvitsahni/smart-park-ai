import React from 'react';
import { Clock, AlertCircle, Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeRingProps {
  totalMinutes: number;
  elapsedMinutes: number;
  graceMinutes?: number;
  showExtension?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TimeRing: React.FC<TimeRingProps> = ({
  totalMinutes,
  elapsedMinutes,
  graceMinutes = 0,
  showExtension = false,
  size = 'md',
}) => {
  const progress = Math.min((elapsedMinutes / totalMinutes) * 100, 100);
  const isOvertime = elapsedMinutes > totalMinutes;
  const inGracePeriod = isOvertime && (elapsedMinutes - totalMinutes) <= graceMinutes;
  
  const remainingMinutes = Math.max(0, totalMinutes + graceMinutes - elapsedMinutes);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = Math.round(remainingMinutes % 60);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-44 h-44',
  };

  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const radius = size === 'sm' ? 36 : size === 'md' ? 58 : 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColors = () => {
    if (isOvertime && !inGracePeriod) {
      return { stroke: 'stroke-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    }
    if (inGracePeriod) {
      return { stroke: 'stroke-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' };
    }
    if (progress > 80) {
      return { stroke: 'stroke-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    }
    return { stroke: 'stroke-primary', text: 'text-primary', bg: 'bg-primary/10' };
  };

  const colors = getColors();

  return (
    <div className="flex flex-col items-center gap-4 animate-smooth-fade-in">
      <div className={cn('relative', sizeClasses[size])}>
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress ring */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-1000 ease-out', colors.stroke)}
          />
          {/* Grace period overlay */}
          {graceMinutes > 0 && progress >= 100 && (
            <circle
              cx="50%"
              cy="50%"
              r={radius - strokeWidth - 2}
              fill="none"
              strokeWidth={2}
              strokeDasharray="4 4"
              className="stroke-blue-400/50"
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {remainingMinutes > 0 ? (
            <>
              <div className={cn('font-display font-bold', colors.text, 
                size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl'
              )}>
                {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
              </div>
              <div className={cn('text-muted-foreground',
                size === 'sm' ? 'text-[9px]' : 'text-xs'
              )}>
                {inGracePeriod ? 'grace period' : 'remaining'}
              </div>
            </>
          ) : (
            <>
              <Clock className={cn(colors.text, size === 'sm' ? 'w-5 h-5' : 'w-8 h-8')} />
              <div className={cn('text-muted-foreground mt-1',
                size === 'sm' ? 'text-[9px]' : 'text-xs'
              )}>
                Time to exit
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status message - calm, non-aggressive */}
      {inGracePeriod && (
        <div className="glass-subtle px-4 py-2 rounded-xl flex items-center gap-2 animate-calm-pulse">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">
            Grace period active - take your time
          </span>
        </div>
      )}

      {showExtension && !isOvertime && progress > 70 && (
        <div className="glass-subtle px-4 py-2 rounded-xl">
          <p className="text-xs text-muted-foreground text-center">
            Need more time? Extensions available based on demand.
          </p>
        </div>
      )}
    </div>
  );
};

// Time Extension Dashboard Component
interface TimeExtensionDashboardProps {
  currentSession: {
    entryTime: Date;
    originalDuration: number;
    extendedDuration?: number;
  };
  trustScore: number;
  demandLevel: 'low' | 'medium' | 'high';
  onExtend: (minutes: number) => void;
}

export const TimeExtensionDashboard: React.FC<TimeExtensionDashboardProps> = ({
  currentSession,
  trustScore,
  demandLevel,
  onExtend,
}) => {
  const now = new Date();
  const entryTime = new Date(currentSession.entryTime);
  const elapsedMinutes = (now.getTime() - entryTime.getTime()) / 60000;
  const totalMinutes = (currentSession.extendedDuration || currentSession.originalDuration) * 60;

  const getExtensionOptions = () => {
    // Trust-based extension options
    const baseOptions = [15, 30, 60];
    if (trustScore >= 80) {
      return [...baseOptions, 120];
    }
    return baseOptions;
  };

  const getExtensionCost = (minutes: number) => {
    // Rewards-based: lower cost for trusted users
    const baseCost = minutes * 0.5;
    const trustDiscount = trustScore >= 80 ? 0.5 : trustScore >= 60 ? 0.75 : 1;
    const demandMultiplier = demandLevel === 'high' ? 1.2 : demandLevel === 'medium' ? 1 : 0.8;
    
    return Math.round(baseCost * trustDiscount * demandMultiplier);
  };

  return (
    <div className="glass-card-elevated p-6 animate-smooth-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Time Management</h2>
          <p className="text-xs text-muted-foreground">Extend your parking duration</p>
        </div>
      </div>

      {/* Current time status */}
      <div className="flex justify-center mb-6">
        <TimeRing
          totalMinutes={totalMinutes}
          elapsedMinutes={elapsedMinutes}
          graceMinutes={trustScore >= 80 ? 15 : trustScore >= 60 ? 10 : 5}
          size="lg"
        />
      </div>

      {/* Extension options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Extension Options</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            demandLevel === 'high' ? 'bg-amber-500/20 text-amber-400' :
            demandLevel === 'medium' ? 'bg-blue-500/20 text-blue-400' :
            'bg-emerald-500/20 text-emerald-400'
          )}>
            {demandLevel === 'high' ? 'High demand' : demandLevel === 'medium' ? 'Moderate' : 'Low demand'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {getExtensionOptions().map(minutes => {
            const cost = getExtensionCost(minutes);
            const isFree = cost === 0;
            
            return (
              <button
                key={minutes}
                onClick={() => onExtend(minutes)}
                className="glass-subtle p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">+{minutes} min</span>
                  {isFree ? (
                    <span className="text-xs badge-eco px-2 py-0.5 rounded-full">FREE</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">₹{cost}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {trustScore >= 80 && minutes <= 30 ? 'Courtesy extension' : 'Based on current demand'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI suggestion */}
      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-foreground">
              {demandLevel === 'low' 
                ? 'Low demand right now - extensions are discounted!'
                : demandLevel === 'high'
                ? 'Consider a shorter extension to help other visitors find parking.'
                : 'Based on patterns, 30 minutes should give you enough time.'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="ai-disclosure">AI Suggestion</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
