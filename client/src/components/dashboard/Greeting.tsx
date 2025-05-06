import React from 'react';

interface GreetingProps {
  userName: string;
}

export function Greeting({ userName }: GreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-primary-900">
        {getTimeBasedGreeting()}, {userName}
      </h1>
      <p className="text-gray-600 mt-1">
        Welcome to your personal healing space.
      </p>
    </div>
  );
}
