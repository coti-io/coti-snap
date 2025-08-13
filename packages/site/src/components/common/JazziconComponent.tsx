import React from 'react';
import { FromIcon, ToIcon } from '../../assets/icons';

interface JazziconComponentProps {
  address: string;
  size?: number;
  type?: 'from' | 'to';
}

export const JazziconComponent: React.FC<JazziconComponentProps> = ({
  size = 40,
  type = 'from'
}) => {
  const iconSrc = type === 'from' ? FromIcon : ToIcon;

  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%',
        display: 'inline-block',
        overflow: 'hidden'
      }} 
    >
      <img 
        src={iconSrc}
        alt={`${type} address`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
      />
    </div>
  );
};