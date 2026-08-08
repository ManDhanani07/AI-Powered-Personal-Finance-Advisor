import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export const PasswordInput = ({
  id,
  name,
  label,
  placeholder = '••••••••',
  register,
  error,
  validation,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id || name} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Lock className="h-4 w-4" />
        </div>
        <input
          id={id || name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          {...(register ? register(name, validation) : {})}
          className={`block w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 bg-slate-950 text-white placeholder-slate-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
            error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

export default PasswordInput;
