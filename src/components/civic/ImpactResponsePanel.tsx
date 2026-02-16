import React, { useState } from 'react';
import { 
  AlertTriangle, Shield, Clock, Download, X, Check, 
  Camera, Eye, EyeOff, Sparkles, FileText 
} from 'lucide-react';
import { ImpactEvent } from '@/lib/civic-intelligence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImpactResponsePanelProps {
  event: ImpactEvent;
  onDismiss: () => void;
  onViewEvidence?: () => void;
  onDownloadReport?: () => void;
}

export const ImpactResponsePanel: React.FC<ImpactResponsePanelProps> = ({
  event,
  onDismiss,
  onViewEvidence,
  onDownloadReport,
}) => {
  const [evidenceVisible, setEvidenceVisible] = useState(false);
  const [responsibilityAcknowledged, setResponsibilityAcknowledged] = useState(false);

  const getSeverityStyles = () => {
    switch (event.severity) {
      case 'significant':
        return {
          bg: 'from-amber-500/20 to-orange-500/20',
          border: 'border-amber-500/30',
          icon: 'text-amber-400',
        };
      case 'moderate':
        return {
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
        };
      default:
        return {
          bg: 'from-muted to-muted/50',
          border: 'border-border/50',
          icon: 'text-muted-foreground',
        };
    }
  };

  const styles = getSeverityStyles();

  const formatTimeRemaining = () => {
    if (!event.retentionExpiry) return 'N/A';
    const diff = event.retentionExpiry.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  return (
    <div className="glass-card-elevated overflow-hidden animate-smooth-fade-in max-w-lg mx-auto">
      {/* Header - Calm, not alarming */}
      <div className={cn('bg-gradient-to-r p-6', styles.bg)}>
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center bg-background/50 backdrop-blur-sm border',
            styles.border
          )}>
            <Shield className={cn('w-6 h-6', styles.icon)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-lg font-semibold">
                Vehicle Safety Notice
              </h2>
              <span className="ai-disclosure">
                <Sparkles className="w-3 h-3" />
                AI Detected
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A potential impact event was detected near your vehicle.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Important disclaimers first */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
          <h3 className="text-sm font-medium mb-2">Important Information</h3>
          <ul className="space-y-2">
            {event.disclaimers.map((disclaimer, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0" />
                {disclaimer}
              </li>
            ))}
          </ul>
        </div>

        {/* Event details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-subtle p-4 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Severity Estimate</div>
            <div className={cn('text-lg font-medium capitalize', styles.icon)}>
              {event.severity}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              (AI preliminary estimate)
            </div>
          </div>
          <div className="glass-subtle p-4 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1">Detection Time</div>
            <div className="text-lg font-medium">
              {event.timestamp.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {event.timestamp.toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        {/* Evidence handling - privacy-first */}
        <div className="glass-subtle p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Evidence (Encrypted)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Auto-deletes in {formatTimeRemaining()}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            Short clips before and after detection are securely stored. 
            Only you can access them. They will be automatically deleted 
            if no action is taken.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEvidenceVisible(!evidenceVisible)}
              className="gap-2"
            >
              {evidenceVisible ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Evidence
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  View Evidence (Opt-in)
                </>
              )}
            </Button>
            {onDownloadReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadReport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            )}
          </div>
        </div>

        {/* Evidence preview (opt-in) */}
        {evidenceVisible && (
          <div className="glass-subtle p-4 rounded-xl animate-scale-in-gentle">
            <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Evidence clips would appear here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Demo - no actual footage)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            If this alert appears incorrect, you may dismiss it. 
            All evidence will be immediately deleted.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={onDismiss}
            >
              <X className="w-4 h-4" />
              Dismiss (False Alarm)
            </Button>
            <Button
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-cyan-500"
              onClick={() => setResponsibilityAcknowledged(true)}
            >
              <Check className="w-4 h-4" />
              Keep Evidence
            </Button>
          </div>
        </div>
      </div>

      {/* Privacy footer */}
      <div className="px-6 py-3 bg-muted/20 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          Your privacy is protected. Evidence access is opt-in and encrypted. 
          <button className="ml-1 text-primary hover:underline">Data policy</button>
        </p>
      </div>
    </div>
  );
};
