import React from 'react';
import { 
  ArrowRightLeft, Gift, Sparkles, Clock, MapPin, CheckCircle 
} from 'lucide-react';
import { SwapOffer, GraceExtension } from '@/lib/civic-intelligence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SlotSwapOfferProps {
  offer: SwapOffer;
  onAccept: () => void;
  onDecline: () => void;
}

export const SlotSwapOffer: React.FC<SlotSwapOfferProps> = ({
  offer,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="glass-card-elevated overflow-hidden animate-smooth-fade-in max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">
              Voluntary Relocation Offer
            </h3>
            <p className="text-xs text-muted-foreground">
              Earn rewards by helping ease congestion
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Swap visualization */}
        <div className="flex items-center justify-center gap-4">
          <div className="glass-subtle px-4 py-3 rounded-xl text-center">
            <div className="text-xs text-muted-foreground mb-1">Current</div>
            <div className="text-lg font-bold">{offer.currentSlot}</div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
          </div>
          <div className="glass-subtle px-4 py-3 rounded-xl text-center border-2 border-amber-500/30">
            <div className="text-xs text-amber-400 mb-1">Suggested</div>
            <div className="text-lg font-bold">{offer.suggestedSlot}</div>
          </div>
        </div>

        {/* Reward */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 text-center">
          <div className="text-sm text-muted-foreground mb-1">You'll earn</div>
          <div className="text-2xl font-bold gradient-text-reward">
            +{offer.rewardCredits} Eco Credits
          </div>
        </div>

        {/* Reason */}
        <div className="glass-subtle p-4 rounded-xl">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-sm text-foreground/80">
              {offer.reason}
            </p>
          </div>
        </div>

        {/* Emphasis on voluntary */}
        <p className="text-xs text-muted-foreground text-center">
          This is completely optional. Your choice won't affect your experience.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDecline}
          >
            No, Thanks
          </Button>
          <Button
            className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            onClick={onAccept}
          >
            <CheckCircle className="w-4 h-4" />
            Accept & Relocate
          </Button>
        </div>
      </div>
    </div>
  );
};

// Grace Extension Notification
interface GraceNotificationProps {
  extension: GraceExtension;
}

export const GraceNotification: React.FC<GraceNotificationProps> = ({ extension }) => {
  if (!extension.granted) return null;

  return (
    <div className="glass-subtle p-4 rounded-xl border-l-4 border-blue-500 animate-smooth-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-blue-400">Grace Period Extended</h4>
            <span className="ai-disclosure text-[10px]">
              <Sparkles className="w-2.5 h-2.5" />
              Auto
            </span>
          </div>
          <p className="text-sm text-foreground/80">
            {extension.reason}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            +{extension.additionalMinutes} minutes added automatically
          </p>
        </div>
      </div>
    </div>
  );
};

// Future Availability Preview
interface FutureAvailabilityProps {
  prediction: {
    timeFrame: string;
    predictedOpenings: number;
    zones: { zone: string; expectedSlots: number }[];
    explanation: string;
  };
}

export const FutureAvailabilityPreview: React.FC<FutureAvailabilityProps> = ({ prediction }) => {
  return (
    <div className="glass-subtle p-4 rounded-xl animate-smooth-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Availability Forecast</span>
        <span className="ai-disclosure text-[10px] ml-auto">
          <Sparkles className="w-2.5 h-2.5" />
          AI Prediction
        </span>
      </div>

      {prediction.predictedOpenings > 0 ? (
        <>
          <div className="text-center py-4">
            <div className="text-3xl font-bold gradient-text">
              {prediction.predictedOpenings}
            </div>
            <div className="text-sm text-muted-foreground">
              slots opening in ~{prediction.timeFrame.replace('Next ', '')}
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            {prediction.zones.filter(z => z.expectedSlots > 0).map(zone => (
              <div key={zone.zone} className="flex-1 glass-subtle p-2 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Zone {zone.zone}</div>
                <div className="text-lg font-medium">{zone.expectedSlots}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <MapPin className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {prediction.explanation}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Based on parking patterns and estimated durations
      </p>
    </div>
  );
};
