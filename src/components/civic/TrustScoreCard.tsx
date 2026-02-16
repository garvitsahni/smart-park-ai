import React from 'react';
import { Shield, Sparkles, Award, Leaf, Clock, Star } from 'lucide-react';
import { TrustScore, Badge } from '@/lib/civic-intelligence';
import { cn } from '@/lib/utils';

interface TrustScoreCardProps {
  trustScore: TrustScore;
  compact?: boolean;
}

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({ trustScore, compact }) => {
  const getLevelStyles = () => {
    switch (trustScore.level) {
      case 'trusted':
        return {
          bg: 'from-emerald-500/20 to-teal-500/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          glow: 'shadow-[0_0_30px_hsl(160_60%_45%/0.2)]',
        };
      case 'established':
        return {
          bg: 'from-amber-500/20 to-yellow-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          glow: 'shadow-[0_0_25px_hsl(45_70%_55%/0.15)]',
        };
      default:
        return {
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          glow: 'shadow-[0_0_20px_hsl(220_50%_55%/0.15)]',
        };
    }
  };

  const styles = getLevelStyles();

  if (compact) {
    return (
      <div className={cn(
        'glass-subtle px-4 py-3 flex items-center gap-4 animate-smooth-fade-in',
        styles.border, styles.glow
      )}>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
          styles.bg
        )}>
          <span className={cn('text-lg font-bold', styles.text)}>{trustScore.score}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Shield className={cn('w-4 h-4', styles.text)} />
            <span className="text-sm font-medium capitalize">{trustScore.level} Member</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {trustScore.rewards.freeMinutesEarned} free minutes earned
          </p>
        </div>
        {trustScore.badges.length > 0 && (
          <div className="flex -space-x-1">
            {trustScore.badges.slice(0, 3).map(badge => (
              <span key={badge.id} className="text-lg" title={badge.name}>
                {badge.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'glass-card-elevated overflow-hidden animate-smooth-fade-in',
      styles.glow
    )}>
      {/* Header */}
      <div className={cn('bg-gradient-to-r p-6', styles.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center bg-background/50 backdrop-blur-sm border',
              styles.border
            )}>
              <span className={cn('text-2xl font-bold', styles.text)}>{trustScore.score}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Shield className={cn('w-5 h-5', styles.text)} />
                <h3 className="font-display text-lg font-semibold capitalize">
                  {trustScore.level} Member
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {trustScore.vehicleNumber}
              </p>
            </div>
          </div>
          <div className="ai-disclosure">
            <Sparkles className="w-3 h-3" />
            AI Calculated
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Rewards earned */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Rewards Earned
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-subtle p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold">{trustScore.rewards.freeMinutesEarned}</div>
              <div className="text-xs text-muted-foreground">Free Minutes</div>
            </div>
            <div className="glass-subtle p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold">{trustScore.rewards.ecoCredits}</div>
              <div className="text-xs text-muted-foreground">Eco Credits</div>
            </div>
            <div className="glass-subtle p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Star className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold">₹{trustScore.rewards.cashbackEarned}</div>
              <div className="text-xs text-muted-foreground">Cashback</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {trustScore.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skill Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {trustScore.badges.map(badge => (
                <div
                  key={badge.id}
                  className="badge-reward px-3 py-2 rounded-xl flex items-center gap-2"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{badge.name}</div>
                    <div className="text-xs opacity-70">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positive actions */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Your Positive Contributions
          </h4>
          <ul className="space-y-2">
            {trustScore.positiveActions.map((action, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer - Privacy notice */}
      <div className="px-6 py-3 bg-muted/30 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          Your trust score is private and only visible to you. 
          <button className="ml-1 text-primary hover:underline">Learn more</button>
        </p>
      </div>
    </div>
  );
};
