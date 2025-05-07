import React from 'react';
import { Link } from 'wouter';
import { Palette, ChevronRight } from 'lucide-react';

// This is a temporary page to directly access the Neo Brutalism demo without requiring dashboard loading
export default function DirectAccessDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Palette className="mx-auto h-12 w-12 text-sophera-brand-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Neo Brutalism Design
          </h2>
          <p className="mt-2 text-gray-600">
            Direct access to Sophera's new design system components
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Link href="/design/neo-brutalism">
            <div className="group relative w-full flex justify-center py-3 px-4 border-4 border-black text-lg font-bold rounded-xl text-white bg-sophera-brand-primary hover:bg-sophera-brand-primary-dark shadow-[0.3rem_0.3rem_0_#000000] hover:shadow-[0.5rem_0.5rem_0_#000000] hover:translate-x-[-0.2rem] hover:translate-y-[-0.2rem] transition-all duration-200 cursor-pointer">
              View Neo Brutalism Demo
              <ChevronRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
          <Link href="/design">
            <div className="group relative w-full flex justify-center py-3 px-4 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              View Design System Landing Page
            </div>
          </Link>
          <Link href="/">
            <div className="text-center text-sm text-gray-600 hover:text-sophera-brand-primary cursor-pointer">
              ← Return to Dashboard
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}