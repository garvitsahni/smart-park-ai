import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card-elevated p-8 md:p-12 max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">Transform</span> Your Parking?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Experience the future of parking management with our AI-powered system. 
            Start with a demo or explore the admin dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/park">
              <Button variant="hero" size="lg">
                <Car className="w-5 h-5 mr-2" />
                Try Driver Interface
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="heroOutline" size="lg">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Explore Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No signup required • Full MVP demo • Investor-ready
          </p>
        </div>
      </div>
    </section>
  );
};
