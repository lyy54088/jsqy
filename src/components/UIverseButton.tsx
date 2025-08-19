import React from 'react';

interface UIverseButtonProps {
  children: React.ReactNode;
  onClick?: (e?: any) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

const UIverseButton: React.FC<UIverseButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary' 
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: '#1e40af', // blue-800
          gradientColors: ['#f59e0b', '#3b82f6'], // amber-500, blue-500
        };
      case 'secondary':
        return {
          background: '#374151', // gray-700
          gradientColors: ['#6b7280', '#9ca3af'], // gray-500, gray-400
        };
      case 'accent':
        return {
          background: '#7c3aed', // violet-600
          gradientColors: ['#ec4899', '#8b5cf6'], // pink-500, violet-500
        };
      default:
        return {
          background: '#1e40af',
          gradientColors: ['#f59e0b', '#3b82f6'],
        };
    }
  };

  const { background, gradientColors } = getVariantColors();

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    margin: '0 1em',
    display: 'inline-block',
  };

  const borderStyle: React.CSSProperties = {
    padding: '3px',
    position: 'absolute',
    inset: '0',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 'inherit',
    clipPath: 'path("M 90 0 C 121 0 126 5 126 33 C 126 61 121 66 90 66 L 33 66 C 5 66 0 61 0 33 C 0 5 5 0 33 0 Z")',
  };

  const mainButtonStyle: React.CSSProperties = {
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    borderRadius: '0.875em',
    clipPath: 'path("M 90 0 C 115 0 120 5 120 30 C 120 55 115 60 90 60 L 30 60 C 5 60 0 55 0 30 C 0 5 5 0 30 0 Z")',
    width: '120px',
    height: '60px',
    background: background,
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  const realButtonStyle: React.CSSProperties = {
    position: 'absolute',
    width: '120px',
    height: '60px',
    zIndex: 1,
    outline: 'none',
    border: 'none',
    borderRadius: '17px',
    cursor: 'pointer',
    opacity: 0,
  };

  const backdropStyle: React.CSSProperties = {
    position: 'absolute',
    inset: '-9900%',
    background: 'radial-gradient(circle at 50% 50%, transparent 0, transparent 20%, rgba(17, 17, 17, 0.67) 50%)',
    backgroundSize: '3px 3px',
    zIndex: -1,
  };

  const spinStyle: React.CSSProperties = {
    position: 'absolute',
    inset: '0',
    zIndex: -2,
    opacity: 0.5,
    overflow: 'hidden',
    transition: '0.3s',
  };

  const spinBlurStyle: React.CSSProperties = {
    ...spinStyle,
    filter: 'blur(2em)',
  };

  const spinIntenseStyle: React.CSSProperties = {
    ...spinStyle,
    inset: '-0.125em',
    filter: 'blur(0.25em)',
    borderRadius: '0.75em',
  };

  const spinInsideStyle: React.CSSProperties = {
    ...spinStyle,
    inset: '-2px',
    borderRadius: 'inherit',
    filter: 'blur(2px)',
    zIndex: 0,
  };

  const createSpinBeforeStyle = (gradientColor1: string, gradientColor2: string): React.CSSProperties => ({
    content: '""',
    position: 'absolute',
    inset: '-150%',
    background: `linear-gradient(90deg, ${gradientColor1} 30%, transparent 50%, ${gradientColor2} 70%)`,
    animation: 'speen 8s cubic-bezier(0.56, 0.15, 0.28, 0.86) infinite, woah 4s infinite',
    animationPlayState: 'paused',
  });

  return (
    <>
      <style>
        {`
          @keyframes speen {
            0% { transform: rotate(10deg); }
            50% { transform: rotate(190deg); }
            100% { transform: rotate(370deg); }
          }
          
          @keyframes woah {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.75); }
          }
          
          .uiverse-button:hover .spin-element::before {
            animation-play-state: running !important;
          }
          
          .uiverse-button:active .spin-element {
            opacity: 1 !important;
          }
          
          .spin-element::before {
            content: "";
            position: absolute;
            inset: -150%;
            animation: speen 8s cubic-bezier(0.56, 0.15, 0.28, 0.86) infinite, woah 4s infinite;
            animation-play-state: paused;
          }
          
          .spin-blur::before {
            background: linear-gradient(90deg, ${gradientColors[0]} 30%, transparent 50%, ${gradientColors[1]} 70%);
          }
          
          .spin-intense::before {
            background: linear-gradient(90deg, ${gradientColors[0]}cc 20%, transparent 45%, transparent 55%, ${gradientColors[1]}cc 80%);
          }
          
          .spin-inside::before {
            background: linear-gradient(90deg, ${gradientColors[0]}99 30%, transparent 45%, transparent 55%, ${gradientColors[1]}99 70%);
          }
        `}
      </style>
      <div className={`uiverse-button ${className}`} style={buttonStyle}>
        <div style={borderStyle} />
        <button 
          style={realButtonStyle} 
          onClick={onClick}
        />
        <div style={mainButtonStyle}>
          <div style={backdropStyle} />
          <div className="spin-element spin-blur" style={spinBlurStyle} />
          <div className="spin-element spin-intense" style={spinIntenseStyle} />
          <div className="spin-element spin-inside" style={spinInsideStyle} />
          {children}
        </div>
      </div>
    </>
  );
};

export default UIverseButton;