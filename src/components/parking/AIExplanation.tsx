import React from 'react';
import { Bot, CheckCircle, Lightbulb } from 'lucide-react';
import { SlotAllocationResult } from '@/lib/parking-intelligence';

interface AIExplanationProps {
  result: SlotAllocationResult;
}

export const AIExplanation: React.FC<AIExplanationProps> = ({ result }) => {
  if (!result.slot) return null;

  return (
    <div className="glass-card p-4 mt-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">AI Allocation Agent</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {result.confidence}% confidence
            </span>
          </div>
          
          <p className="text-sm text-foreground leading-relaxed">
            <Lightbulb className="w-4 h-4 inline-block mr-1 text-amber-400" />
            {result.explanation}
          </p>
          
          <div className="space-y-1.5">
            {result.factors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
