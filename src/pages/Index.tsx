import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { CTASection } from '@/components/landing/CTASection';
import { Navbar } from '@/components/layout/Navbar';
import { PriceForecaster } from '@/components/parking/PriceForecaster';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        
        <div className="container mx-auto px-4 -mt-24 relative z-20 mb-24">
          <div className="max-w-2xl mx-auto">
            <PriceForecaster />
          </div>
        </div>

        <ProblemSection />
        <SolutionSection />
        <CTASection />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Parking Prabandh. Powered by Advanced Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
