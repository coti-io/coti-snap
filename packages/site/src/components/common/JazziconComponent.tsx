import React, { useRef, useEffect } from 'react';
import jazzicon from 'jazzicon-ts';

interface JazziconComponentProps {
  address: string;
  size?: number;
}

export const JazziconComponent: React.FC<JazziconComponentProps> = ({ 
  address, 
  size = 40 
}) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iconRef.current && address) {
      iconRef.current.innerHTML = '';
      const identicon = jazzicon(size, parseInt(address.slice(2, 10), 16));
      iconRef.current.appendChild(identicon);
    }
  }, [address, size]);

  return (
    <div 
      ref={iconRef} 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%',
        display: 'inline-block'
      }} 
    />
  );
};