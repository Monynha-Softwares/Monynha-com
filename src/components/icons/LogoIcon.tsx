import { SVGProps, useId } from 'react';

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  variant?: 'gradient' | 'solid';
}

export const LogoIcon = ({ 
  size = 40, 
  variant = 'gradient',
  className, 
  ...props 
}: LogoIconProps) => {
  const gradientId = `logo-grad-${useId()}`;
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-label="Monynha Softwares Logo"
      {...props}
    >
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B2C6F"/>
            <stop offset="25%" stopColor="#4A90E2"/>
            <stop offset="75%" stopColor="#E06666"/>
            <stop offset="100%" stopColor="#F7B500"/>
          </linearGradient>
        </defs>
      )}
      <rect 
        width="64" 
        height="64" 
        rx="12" 
        fill={variant === 'gradient' ? `url(#${gradientId})` : 'currentColor'}
      />
      <g fill="#fff">
        <path 
          d="M16 44 V20 L28 32 L40 20 V44" 
          fill="none" 
          stroke="#fff" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <circle cx="28" cy="26" r="2.5"/>
        <circle cx="28" cy="38" r="2.5"/>
        <path d="M42 28 L50 32 L42 36 Z" fill="#EA33F7"/>
      </g>
    </svg>
  );
};
