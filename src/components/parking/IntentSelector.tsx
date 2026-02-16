import React from 'react';
import { cn } from '@/lib/utils';
import { VisitIntent, INTENT_CONFIGS } from '@/lib/parking-intelligence';

interface IntentSelectorProps {
  selectedIntent: VisitIntent | null;
  onSelect: (intent: VisitIntent) => void;
}

export const IntentSelector: React.FC<IntentSelectorProps> = ({ selectedIntent, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        What's your visit purpose?
      </label>
      <div className="grid grid-cols-2 gap-3">
        {INTENT_CONFIGS.map((config) => (
          <button
            key={config.id}
            type="button"
            onClick={() => onSelect(config.id)}
            className={cn(
              'group relative p-4 rounded-xl border-2 transition-all duration-300',
              'flex flex-col items-center gap-2 text-center',
              selectedIntent === config.id
                ? 'border-primary bg-primary/10 glow-primary'
                : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80'
            )}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {config.icon}
            </span>
            <span className={cn(
              'text-sm font-medium transition-colors',
              selectedIntent === config.id ? 'text-primary' : 'text-foreground'
            )}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">
              ~{config.avgDuration}h avg
            </span>
            {selectedIntent === config.id && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
