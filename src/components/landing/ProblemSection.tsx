import React from 'react';
import { AlertTriangle, Clock, Receipt, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Long Entry Queues',
    description: 'Drivers waste 15-30 minutes searching for parking, causing traffic jams and frustration.',
    stat: '20 min avg wait',
  },
  {
    icon: Receipt,
    title: 'Manual Ticketing Errors',
    description: 'Paper tickets get lost, payments are miscalculated, and disputes are common.',
    stat: '15% error rate',
  },
  {
    icon: TrendingDown,
    title: 'Revenue Leakage',
    description: 'Poor tracking leads to unpaid parking, incorrect fees, and lost revenue.',
    stat: '₹2L+ lost monthly',
  },
  {
    icon: AlertTriangle,
    title: 'Poor Slot Utilization',
    description: 'Without real-time visibility, premium slots stay empty while drivers circle aimlessly.',
    stat: '40% underutilized',
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            The <span className="text-destructive">Urban Parking Crisis</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Malls and commercial complexes lose millions annually due to outdated parking management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <div 
              key={problem.title}
              className="glass-card p-6 border-destructive/20 hover:border-destructive/40 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{problem.description}</p>
              <div className="text-sm font-medium text-destructive">{problem.stat}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
