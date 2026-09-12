import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { apiFetch } from '../../api/client';
import { CircularCarousel, CarouselItem } from '../ui/CircularCarousel';

export const PlatformImpactSection: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    apiFetch<any>('/public/settings')
      .then(res => setSettings(res))
      .catch(() => {});
  }, []);

  const impactItems: CarouselItem[] = [
    {
      id: '1',
      title: settings?.activeUsers || '50,000+ Active Users',
      description: 'Adolescents supported across India through private 24/7 AI listening.',
      tag: 'ACTIVE TELEMETRY',
    },
    {
      id: '2',
      title: settings?.satisfactionRate || '98.4% Attunement',
      description: 'Rated 5 stars for judgment-free emotional listening and regional attunement.',
      tag: 'ATTUNEMENT SCORE',
    },
    {
      id: '3',
      title: settings?.therapistsCount || '120+ Psychotherapists',
      description: 'Licensed youth psychologists & CBT specialists available for 1-on-1 care.',
      tag: 'CLINICAL CARE',
    },
    {
      id: '4',
      title: settings?.supportAvailable || '24/7/365 Safety Guardian',
      description: 'Continuous real-time background risk detection and care protocol safeguards.',
      tag: 'SAFETY PROTOCOL',
    },
    {
      id: '5',
      title: 'Sub-400ms Response Speed',
      description: 'Instant zero-wait conversational speed day or night at any hour.',
      tag: 'RESPONSE LATENCY',
    },
  ];

  return (
    <section className="py-24 sm:py-36 bg-[#f8fdf9] text-[#0e3820] border-b border-[#0e3820]/10 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Section Header aligned clean to section start */}
        <div className="text-left max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#c25a2a] text-sm">✱</span>
            <p className="font-sans text-xs sm:text-sm tracking-[0.2em] uppercase font-bold text-[#c25a2a]">
              MEASURABLE CARE IMPACT
            </p>
          </div>
          <h2 className="font-sans-main text-4xl sm:text-6xl md:text-7xl text-[#0e3820] font-normal leading-[1.02] tracking-tight">
            Trusted by Thousands
          </h2>
          <p className="text-base sm:text-lg text-[#0e3820]/80 mt-4 font-normal leading-relaxed">
            Quantifiable care outcomes powering India's leading adolescent mental health sanctuary.
          </p>
        </div>

        {/* ── CIRCULAR ARC 3D CAROUSEL INTEGRATION ── */}
        <div className="my-10">
          <CircularCarousel
            items={impactItems}
            autoPlay={true}
            autoPlayInterval={3800}
          />
        </div>

      </div>
    </section>
  );
};
