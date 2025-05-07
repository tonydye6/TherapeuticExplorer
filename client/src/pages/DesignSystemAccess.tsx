import React from 'react';
import { Link } from 'wouter';
import { Palette, ChevronRight } from 'lucide-react';

export default function DesignSystemAccess() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center mb-8">
        <Palette className="h-8 w-8 text-sophera-brand-primary mr-3" />
        <h1 className="text-3xl font-bold text-sophera-text-heading">Sophera Design System</h1>
      </div>
      
      <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[0.5rem_0.5rem_0_#000000] mb-8">
        <h2 className="text-2xl font-bold mb-4">Neo Brutalism Design</h2>
        <p className="text-lg mb-6">
          Explore our Neo Brutalism design system featuring exaggerated elements, thick borders, chunky shadows, and playful interactions.
        </p>
        <Link href="/design/neo-brutalism">
          <div className="inline-flex items-center px-6 py-3 bg-sophera-accent-secondary text-white font-bold rounded-xl border-3 border-black shadow-[0.3rem_0.3rem_0_#000000] hover:translate-x-[-0.2rem] hover:translate-y-[-0.2rem] hover:shadow-[0.5rem_0.5rem_0_#000000] transition-all duration-300 cursor-pointer">
            View Neo Brutalism Components 
            <ChevronRight className="ml-2 h-5 w-5" />
          </div>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-sophera-bg-subtle border border-sophera-border-primary rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3">Key Features</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-brand-primary mr-2"></div>
              Thick borders (3-4px)
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-brand-primary mr-2"></div>
              Chunky shadows (0.3-0.8rem)
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-brand-primary mr-2"></div>
              Bold, saturated colors
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-brand-primary mr-2"></div>
              Playful decorative elements
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-brand-primary mr-2"></div>
              Exaggerated hover effects
            </li>
          </ul>
        </div>
        
        <div className="bg-sophera-bg-subtle border border-sophera-border-primary rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3">Components</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-accent-secondary mr-2"></div>
              Cards with decorative elements
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-accent-secondary mr-2"></div>
              Interactive buttons with shine effects
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-accent-secondary mr-2"></div>
              Form inputs with decorative corners
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-accent-secondary mr-2"></div>
              Custom select menus
            </li>
            <li className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-sophera-accent-secondary mr-2"></div>
              Navigation elements with badges
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/">
          <div className="inline-flex items-center px-4 py-2 text-sophera-text-body hover:text-sophera-brand-primary transition-colors cursor-pointer">
            ← Return to Dashboard
          </div>
        </Link>
      </div>
    </div>
  );
}