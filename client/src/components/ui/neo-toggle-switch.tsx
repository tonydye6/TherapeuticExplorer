import React from "react";
import { cn } from "@/lib/utils";

interface NeoToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onToggle?: (checked: boolean) => void;
}

export function NeoToggleSwitch({ 
  className, 
  label, 
  checked, 
  defaultChecked,
  onToggle,
  ...props 
}: NeoToggleSwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggle) {
      onToggle(e.target.checked);
    }
  };

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <label className="switch">
        <input
          type="checkbox"
          className="toggle"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          {...props}
        />
        <span className="slider"></span>
      </label>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}