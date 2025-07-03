import React from 'react';

interface CopyIconProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const CopyIcon: React.FC<CopyIconProps> = ({ 
  width = 20, 
  height = 20, 
  className,
  color = '#4f5fff' 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect 
      x="7" 
      y="7" 
      width="9" 
      height="9" 
      rx="2" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <rect 
      x="4" 
      y="4" 
      width="9" 
      height="9" 
      rx="2" 
      stroke={color} 
      strokeWidth="1.5" 
      fill="white"
    />
  </svg>
);