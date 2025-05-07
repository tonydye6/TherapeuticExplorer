import React, { useState } from 'react';
import { 
  NeoCard, 
  NeoCardHeader, 
  NeoCardFooter, 
  NeoCardTitle, 
  NeoCardDescription, 
  NeoCardContent,
  NeoCardBadge,
  NeoCardDecoration 
} from "@/components/ui/neo-card";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoInput, NeoInputWrapper } from "@/components/ui/neo-input";
import {
  NeoSelect,
  NeoSelectTrigger,
  NeoSelectContent,
  NeoSelectItem,
  NeoSelectValue,
  NeoSelectGroup,
  NeoSelectLabel,
  NeoSelectSeparator
} from "@/components/ui/neo-select";
import {
  NeoNavigationItem,
  NeoNavigationSection,
  NeoMenu
} from "@/components/ui/neo-navigation";
import { 
  Home, 
  BookOpen, 
  Search, 
  Activity, 
  Calendar, 
  Heart, 
  Settings, 
  FileText,
  Users,
  Leaf
} from 'lucide-react';
import { NeoColorPalette } from '@/components/ui/neo-color-palette';

export default function NeoBrutalismDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [planType, setPlanType] = useState("");

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold mb-2 text-sophera-text-heading">Neo Brutalism Design System</h1>
      <p className="text-xl text-sophera-text-body mb-10">Bold, playful components for Sophera's interface</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Card Examples */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-sophera-text-heading mb-6">Card Components</h2>

          <NeoCard className="w-full max-w-md">
            <NeoCardDecoration />
            <NeoCardHeader>
              <div className="flex justify-between items-center">
                <NeoCardTitle>Treatment Plan</NeoCardTitle>
                <NeoCardBadge>New</NeoCardBadge>
              </div>
            </NeoCardHeader>
            <NeoCardContent>
              <NeoCardDescription>
                Your personalized treatment plan includes medication schedules, 
                appointment reminders, and progress tracking. Stay on top of your journey.
              </NeoCardDescription>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-sophera-accent-secondary border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_rgba(0,0,0,0.2)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-sophera-text-heading">Weekly Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-sophera-accent-secondary border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_rgba(0,0,0,0.2)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-sophera-text-heading">Reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-sophera-accent-secondary border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_rgba(0,0,0,0.2)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-sophera-text-heading">Side Effects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-sophera-accent-secondary border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_rgba(0,0,0,0.2)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-sophera-text-heading">Doctor Notes</span>
                </div>
              </div>
            </NeoCardContent>
            <NeoCardFooter>
              <NeoButton variant="outline" size="sm">Learn More</NeoButton>
              <NeoButton variant="primary" size="sm" shine>View Plan</NeoButton>
            </NeoCardFooter>
          </NeoCard>

          <NeoCard className="w-full max-w-md bg-sophera-accent-tertiary/20">
            <NeoCardContent className="p-6">
              <div className="absolute top-[-0.5rem] right-[-0.5rem] w-5 h-5 bg-sophera-accent-secondary transform rotate-45 border-2 border-sophera-text-heading z-10"></div>
              <h3 className="text-xl font-bold text-sophera-text-heading mb-4">Research Findings</h3>
              <p className="text-sophera-text-body mb-4">Latest research on esophageal cancer treatment options and clinical trials that match your profile.</p>
              <NeoButton variant="secondary" className="w-full" shine>View Research</NeoButton>
            </NeoCardContent>
          </NeoCard>
        </div>

        {/* Form Elements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-sophera-text-heading mb-6">Form Components</h2>

          <div className="space-y-5 max-w-md">
            <NeoInputWrapper label="Your Name" htmlFor="name" corner="star">
              <NeoInput 
                id="name" 
                placeholder="Enter your full name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </NeoInputWrapper>

            <NeoInputWrapper label="Email Address" htmlFor="email" corner="dot">
              <NeoInput 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </NeoInputWrapper>

            <NeoInputWrapper label="Subscription Plan" htmlFor="plan" corner="triangle">
              <NeoSelect value={planType} onValueChange={setPlanType}>
                <NeoSelectTrigger id="plan" className="w-full">
                  <NeoSelectValue placeholder="Select your plan" />
                </NeoSelectTrigger>
                <NeoSelectContent>
                  <NeoSelectGroup>
                    <NeoSelectLabel>Plan Options</NeoSelectLabel>
                    <NeoSelectItem value="basic">Basic Plan</NeoSelectItem>
                    <NeoSelectItem value="premium">Premium Plan</NeoSelectItem>
                    <NeoSelectItem value="family">Family Plan</NeoSelectItem>
                  </NeoSelectGroup>
                  <NeoSelectSeparator />
                  <NeoSelectGroup>
                    <NeoSelectLabel>Enterprise</NeoSelectLabel>
                    <NeoSelectItem value="enterprise">Enterprise Plan</NeoSelectItem>
                  </NeoSelectGroup>
                </NeoSelectContent>
              </NeoSelect>
            </NeoInputWrapper>

            <div className="pt-4">
              <NeoButton className="w-full" shine>Submit Information</NeoButton>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-sophera-text-heading mb-6">Color Palette</h2>
        <NeoColorPalette />
      </div>

      {/* Navigation Showcase */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-bold text-sophera-text-heading mb-6">Navigation Elements</h2>
          <NeoMenu className="max-w-md">
            <NeoNavigationSection title="My Journey" icon={<Activity className="h-4 w-4" />}>
              <NeoNavigationItem active icon={<Home className="h-5 w-5" />} href="/today">
                Dashboard
              </NeoNavigationItem>
              <NeoNavigationItem icon={<Calendar className="h-5 w-5" />} href="/my-journey/plan" badge={3}>
                Treatment Plan
              </NeoNavigationItem>
              <NeoNavigationItem icon={<FileText className="h-5 w-5" />} href="/my-journey/journal">
                Journal
              </NeoNavigationItem>
            </NeoNavigationSection>

            <NeoNavigationSection title="Knowledge Hub" icon={<BookOpen className="h-4 w-4" />}>
              <NeoNavigationItem icon={<Search className="h-5 w-5" />} href="/understand/explainer">
                Medical Explainer
              </NeoNavigationItem>
              <NeoNavigationItem icon={<Activity className="h-5 w-5" />} href="/understand/treatments">
                Treatment Tracker
              </NeoNavigationItem>
            </NeoNavigationSection>

            <NeoNavigationSection title="Connect" icon={<Heart className="h-4 w-4" />}>
              <NeoNavigationItem icon={<Users className="h-5 w-5" />} href="/connect/stories">
                Survivor Stories
              </NeoNavigationItem>
              <NeoNavigationItem icon={<Leaf className="h-5 w-5" />} href="/connect/mindfulness" badge="New">
                Mindfulness Corner
              </NeoNavigationItem>
            </NeoNavigationSection>
          </NeoMenu>
        </div>

        {/* Button Showcase */}
        <div>
          <h2 className="text-2xl font-bold text-sophera-text-heading mb-6">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <NeoButton variant="primary">Primary Button</NeoButton>
            <NeoButton variant="secondary">Secondary Button</NeoButton>
            <NeoButton variant="tertiary">Tertiary Button</NeoButton>
            <NeoButton variant="outline">Outline Button</NeoButton>
            <NeoButton variant="destructive">Destructive Button</NeoButton>
            <NeoButton variant="link">Link Button</NeoButton>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <NeoButton variant="primary" size="sm">Small Button</NeoButton>
            <NeoButton variant="primary" size="default">Default Button</NeoButton>
            <NeoButton variant="primary" size="lg">Large Button</NeoButton>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <NeoButton variant="primary" shine>With Shine Effect</NeoButton>
            <NeoButton variant="secondary" shine>With Shine Effect</NeoButton>
          </div>
        </div>
      </div>
    </div>
  );
}