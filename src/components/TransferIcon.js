import React from 'react';

const TransferIcon = ({ size = 64, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#4A90E2', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#357ABD', stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Rounded rectangle background */}
      <rect x="32" y="32" width="448" height="448" rx="80" ry="80" fill="url(#blueGradient)"/>
      
      {/* Right arrow (top) */}
      <g fill="white">
        {/* Arrow shaft */}
        <rect x="120" y="160" width="200" height="40" />
        {/* Arrow head */}
        <polygon points="320,140 320,220 400,180" />
      </g>
      
      {/* Left arrow (bottom) */}
      <g fill="white">
        {/* Arrow shaft */}
        <rect x="192" y="312" width="200" height="40" />
        {/* Arrow head */}
        <polygon points="192,292 192,372 112,332" />
      </g>
    </svg>
  );
};

export default TransferIcon;
