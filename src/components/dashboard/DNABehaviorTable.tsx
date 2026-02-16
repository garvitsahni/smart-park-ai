import React, { useState } from 'react';
import { Shield, ArrowUpDown, TrendingUp, TrendingDown, AlertTriangle, Gift } from 'lucide-react';
import { VehicleDNAScore } from '@/lib/parking-intelligence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DNABehaviorTableProps {
  scores: VehicleDNAScore[];
}

type SortField = 'overallScore' | 'slotCompliance' | 'timelyExit' | 'totalVisits' | 'violations';
type SortOrder = 'asc' | 'desc';

export const DNABehaviorTable: React.FC<DNABehaviorTableProps> = ({ scores }) => {
  const [sortField, setSortField] = useState<SortField>('overallScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedScores = [...scores].sort((a, b) => {
    let aVal: number, bVal: number;
    switch (sortField) {
      case 'overallScore':
        aVal = a.overallScore;
        bVal = b.overallScore;
        break;
      case 'slotCompliance':
        aVal = a.metrics.slotCompliance;
        bVal = b.metrics.slotCompliance;
        break;
      case 'timelyExit':
        aVal = a.metrics.timelyExit;
        bVal = b.metrics.timelyExit;
        break;
      case 'totalVisits':
        aVal = a.totalVisits;
        bVal = b.totalVisits;
        break;
      case 'violations':
        aVal = a.violations;
        bVal = b.violations;
        break;
      default:
        return 0;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const levelColors = {
    green: 'text-emerald-400 bg-emerald-500/20',
    yellow: 'text-amber-400 bg-amber-500/20',
    red: 'text-rose-400 bg-rose-500/20',
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 hover:bg-transparent font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={cn(
        'ml-1 h-3 w-3',
        sortField === field ? 'text-primary' : 'text-muted-foreground'
      )} />
    </Button>
  );

  return (
    <div className="glass-card-elevated overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Vehicle Behavior Analysis</h3>
        <span className="text-sm text-muted-foreground ml-auto">{scores.length} vehicles</span>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Vehicle</TableHead>
              <TableHead>
                <SortableHeader field="overallScore">DNA Score</SortableHeader>
              </TableHead>
              <TableHead>Level</TableHead>
              <TableHead>
                <SortableHeader field="slotCompliance">Compliance</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="timelyExit">Timely Exit</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="totalVisits">Visits</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="violations">Violations</SortableHeader>
              </TableHead>
              <TableHead>Benefits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedScores.map((score) => (
              <TableRow key={score.vehicleNumber}>
                <TableCell className="font-mono text-sm">{score.vehicleNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                      levelColors[score.level]
                    )}>
                      {score.overallScore}
                    </div>
                    {score.overallScore >= 80 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : score.overallScore < 50 ? (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    levelColors[score.level]
                  )}>
                    {score.level.charAt(0).toUpperCase() + score.level.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full',
                          score.metrics.slotCompliance >= 80 ? 'bg-emerald-500' :
                          score.metrics.slotCompliance >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                        style={{ width: `${score.metrics.slotCompliance}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{score.metrics.slotCompliance}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full',
                          score.metrics.timelyExit >= 80 ? 'bg-emerald-500' :
                          score.metrics.timelyExit >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                        style={{ width: `${score.metrics.timelyExit}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{score.metrics.timelyExit}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{score.totalVisits}</TableCell>
                <TableCell>
                  {score.violations > 0 ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {score.violations}
                    </span>
                  ) : (
                    <span className="text-emerald-400">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {score.discountEligible && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        <Gift className="w-3 h-3" />
                        5% off
                      </span>
                    )}
                    {score.penaltyMultiplier > 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs">
                        +{((score.penaltyMultiplier - 1) * 100).toFixed(0)}% penalty
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
