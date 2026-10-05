import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string | React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30',
    secondary: 'bg-white text-industrial-800 border-2 border-industrial-100 hover:bg-industrial-50 hover:border-industrial-200 shadow-sm',
    outline: 'bg-transparent text-industrial-600 border border-industrial-200 hover:bg-industrial-50 shadow-sm',
    ghost: 'bg-transparent text-industrial-500 hover:bg-industrial-50 hover:text-industrial-800',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};

export default Button;