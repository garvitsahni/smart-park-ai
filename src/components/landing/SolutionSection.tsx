import React from 'react';
import { Bot, MapPin, CreditCard, BarChart3, Shield, Zap } from 'lucide-react';

const solutions = [
  {
    icon: Bot,
    title: 'AI Slot Allocation',
    description: 'Intelligent agent assigns the nearest available slot instantly upon entry.',
    color: 'from-primary to-cyan-400',
  },
  {
    icon: MapPin,
    title: 'Real-Time Tracking',
    description: 'Live occupancy map shows available slots across all floors and zones.',
    color: 'from-emerald-500 to-green-400',
  },
  {
    icon: CreditCard,
    title: 'Automated Payments',
    description: 'FASTag, UPI, and wallet integration for seamless exit without stops.',
    color: 'from-blue-500 to-indigo-400',
  },
  {
    icon: Shield,
    title: 'Compliance Monitoring',
    description: 'AI detects wrong parking and generates instant penalties.',
    color: 'from-amber-500 to-orange-400',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Predict peak hours, optimize pricing, and maximize revenue.',
    color: 'from-purple-500 to-pink-400',
  },
  {
    icon: Zap,
    title: 'Dynamic Pricing',
    description: 'AI adjusts rates based on demand, time, and special events.',
    color: 'from-rose-500 to-red-400',
  },
];

export const SolutionSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            The <span className="gradient-text">Smart Solution</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Park-Prabandh deploys multiple AI agents working in harmony to automate every aspect of parking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {solutions.map((solution, i) => (
            <div 
              key={solution.title}
              className="glass-card-elevated p-6 hover:scale-105 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                <solution.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{solution.title}</h3>
              <p className="text-muted-foreground text-sm">{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
