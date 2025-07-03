import { keyframes } from 'styled-components';

export const slideUpFadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(48px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

export const colors = {
  primary: '#4664ff',
  primaryHover: '#3350e6',
  primaryDark: '#2946c7',
  secondary: '#3d5afe',
  secondaryHover: '#2946c7',
  success: '#10b981',
  successHover: '#059669',
  error: '#e53935',
  text: {
    primary: '#18191d',
    secondary: '#6b7280',
    tertiary: '#8a8f98',
    muted: '#bfc2c6',
    light: '#9ca3af'
  },
  background: {
    primary: '#fff',
    secondary: '#f7f7f7',
    tertiary: '#f3f5fa',
    success: '#ecfdf5',
    hover: '#f8fafc'
  },
  border: {
    primary: '#e5e7eb',
    secondary: '#d0d0d0'
  }
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
  xxxxl: '40px'
} as const;

export const typography = {
  sizes: {
    xs: '1.1rem',
    sm: '1.2rem',
    base: '1.4rem',
    md: '1.5rem',
    lg: '1.6rem',
    xl: '1.7rem',
    xxl: '1.8rem',
    xxxl: '2rem',
    xxxxl: '2.1rem',
    xxxxxl: '2.4rem',
    huge: '3.4rem'
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
} as const;

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
  xxxxl: '24px',
  full: '50%'
} as const;

export const shadows = {
  sm: '0 1px 4px rgba(0,0,0,0.04)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 32px 0 rgba(0,0,0,0.12)',
  dropdown: '0 2px 12px rgba(0,0,0,0.10)'
} as const;

export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.32s cubic-bezier(0.4, 0.8, 0.4, 1)'
} as const;

export const buttonBase = `
  border: none;
  outline: none;
  cursor: pointer;
  font-weight: ${typography.weights.semibold};
  transition: all ${transitions.normal};
  
  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const inputBase = `
  border: 1.5px solid ${colors.border.primary};
  border-radius: ${borderRadius.md};
  font-size: ${typography.sizes.lg};
  color: ${colors.text.primary};
  background: ${colors.background.secondary};
  outline: none;
  transition: border-color ${transitions.fast}, background-color ${transitions.fast};
  
  &:focus {
    border-color: ${colors.primary};
    background: ${colors.background.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;