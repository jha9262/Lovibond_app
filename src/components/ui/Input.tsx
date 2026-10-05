import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold text-industrial-600 uppercase tracking-wider mb-1.5 pl-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-industrial-400 group-focus-within:text-brand-500 transition-colors duration-300">
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full transition-all duration-300
            bg-white border text-industrial-900 text-sm rounded-xl
            focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500
            ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'} py-3
            ${error ? 'border-red-500/50 bg-red-50/30' : 'border-industrial-200 hover:border-industrial-300'}
            placeholder:text-industrial-400 outline-none
            shadow-sm
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-industrial-400 hover:text-industrial-900 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{error}</p>}
    </div>
  );
};

export default Input;