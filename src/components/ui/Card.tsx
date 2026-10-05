import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, footer }) => {
  return (
    <div className={`bg-white border border-industrial-200/60 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 pt-6 pb-4">
          {title && <h3 className="text-[17px] font-semibold text-industrial-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-industrial-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={`px-6 ${title || subtitle ? 'pb-6 pt-2' : 'py-6'}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-industrial-50/50 border-t border-industrial-100 text-xs text-industrial-500 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;