
import React from 'react';

const colorGroups = [
  {
    name: 'Violet',
    colors: [
      { name: '200', value: '#A8A6FF', class: 'bg-neo-violet-200' },
      { name: '300', value: '#918efa', class: 'bg-neo-violet-300' },
      { name: '400', value: '#807dfa', class: 'bg-neo-violet-400' }
    ]
  },
  {
    name: 'Pink',
    colors: [
      { name: '200', value: '#FFA6F6', class: 'bg-neo-pink-200' },
      { name: '300', value: '#fa8cef', class: 'bg-neo-pink-300' },
      { name: '400', value: '#fa7fee', class: 'bg-neo-pink-400' }
    ]
  },
  {
    name: 'Red',
    colors: [
      { name: '200', value: '#FF9F9F', class: 'bg-neo-red-200' },
      { name: '300', value: '#fa7a7a', class: 'bg-neo-red-300' },
      { name: '400', value: '#f76363', class: 'bg-neo-red-400' }
    ]
  },
  {
    name: 'Orange',
    colors: [
      { name: '200', value: '#FFC29F', class: 'bg-neo-orange-200' },
      { name: '300', value: '#FF965B', class: 'bg-neo-orange-300' },
      { name: '400', value: '#fa8543', class: 'bg-neo-orange-400' }
    ]
  },
  {
    name: 'Yellow',
    colors: [
      { name: '200', value: '#FFF066', class: 'bg-neo-yellow-200' },
      { name: '300', value: '#FFE500', class: 'bg-neo-yellow-300' },
      { name: '400', value: '#FFE500', class: 'bg-neo-yellow-400' }
    ]
  },
  {
    name: 'Lime',
    colors: [
      { name: '200', value: '#B8FF9F', class: 'bg-neo-lime-200' },
      { name: '300', value: '#9dfc7c', class: 'bg-neo-lime-300' },
      { name: '400', value: '#7df752', class: 'bg-neo-lime-400' }
    ]
  },
  {
    name: 'Cyan',
    colors: [
      { name: '200', value: '#A6FAFF', class: 'bg-neo-cyan-200' },
      { name: '300', value: '#79F7FF', class: 'bg-neo-cyan-300' },
      { name: '400', value: '#53f2fc', class: 'bg-neo-cyan-400' }
    ]
  }
];

export const NeoColorPalette = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {colorGroups.map((group) => (
        <div key={group.name} className="space-y-3">
          <h3 className="text-lg font-bold text-sophera-text-heading">{group.name}</h3>
          <div className="space-y-2">
            {group.colors.map((color) => (
              <div key={color.name} className="flex items-center gap-3">
                <div className={`w-16 h-16 ${color.class} rounded-md border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]`} />
                <div>
                  <p className="font-mono font-semibold">{color.value}</p>
                  <p className="text-sm text-sophera-text-subtle">{color.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
