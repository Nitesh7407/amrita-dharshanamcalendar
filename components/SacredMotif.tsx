import React from 'react';

export function LotusIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central Petal */}
      <path
        d="M24 6C24 6 18 18 18 28C18 34 20.6863 38 24 38C27.3137 38 30 34 30 28C30 18 24 6 24 6Z"
        fill={color}
        fillOpacity="0.85"
      />
      {/* Left Petal */}
      <path
        d="M21 16C21 16 11 22 10 30C9 35 12 39 16 39C20 39 23 34 23 30C23 27 21 16 21 16Z"
        fill={color}
        fillOpacity="0.7"
      />
      {/* Right Petal */}
      <path
        d="M27 16C27 16 37 22 38 30C39 35 36 39 32 39C28 39 25 34 25 30C25 27 27 16 27 16Z"
        fill={color}
        fillOpacity="0.7"
      />
      {/* Outer Left Petal */}
      <path
        d="M17 26C17 26 6 30 5 36C4 39.5 8 41 12 41C16 41 19 37 19 33C19 31 17 26 17 26Z"
        fill={color}
        fillOpacity="0.5"
      />
      {/* Outer Right Petal */}
      <path
        d="M31 26C31 26 42 30 43 36C44 39.5 40 41 36 41C32 41 29 37 29 33C29 31 31 26 31 26Z"
        fill={color}
        fillOpacity="0.5"
      />
      {/* Base Stem / Water Ripple */}
      <path
        d="M12 43C18 45 30 45 36 43"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SacredDivider({ className = "my-6" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1 max-w-xs" />
      <div className="flex items-center space-x-1.5 text-amber-600">
        <span className="text-xs">✦</span>
        <LotusIcon className="w-5 h-5 text-amber-600" />
        <span className="text-xs">✦</span>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1 max-w-xs" />
    </div>
  );
}

export function TempleGopuramIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v3" />
      <path d="M9 5h6" />
      <path d="M7 8h10" />
      <path d="M5 11h14" />
      <path d="M4 14h16" />
      <path d="M3 17h18" />
      <path d="M2 20h20" />
      <path d="M10 20v-4h4v4" />
    </svg>
  );
}
