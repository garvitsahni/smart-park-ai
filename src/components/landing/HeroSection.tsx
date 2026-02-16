import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, Shield, Leaf, Heart, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects - calmer */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-calm-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-gentle-float" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(94,234,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-smooth-fade-in">
          {/* AI Disclosure Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Ethical AI-Powered Civic Mobility
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-foreground">Parking That</span>
            <br />
            <span className="gradient-text">Respects You</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Park-Prabandh is human-centric smart parking for Indian cities. 
            No penalties. Just rewards, transparency, and calm.
          </p>

          {/* Ethics badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="badge-civic px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Privacy-First
            </span>
            <span className="badge-eco px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" />
              ESG Compliant
            </span>
            <span className="badge-reward px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Rewards-Only
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/park">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-lg glow-calm">
                <Car className="w-5 h-5" />
                Start Parking
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="lg" className="gap-2 px-8 py-6 text-lg rounded-2xl">
                <Eye className="w-5 h-5" />
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats - positive framing */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Faster Parking', value: '85%', icon: '⚡' },
              { label: 'Driver Satisfaction', value: '4.9★', icon: '💚' },
              { label: 'CO₂ Saved Weekly', value: '2.1T', icon: '🌱' },
              { label: 'Rewards Given', value: '₹12L', icon: '🎁' },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className="glass-card p-4 animate-slide-up-gentle"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
