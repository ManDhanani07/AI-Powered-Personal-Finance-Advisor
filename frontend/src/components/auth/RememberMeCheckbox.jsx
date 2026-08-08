import React from 'react';

export const RememberMeCheckbox = ({ id = 'remember_me', name = 'remember_me', register, label = 'Remember me for 30 days' }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        {...(register ? register(name) : {})}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-offset-slate-900 cursor-pointer"
      />
      <label htmlFor={id} className="ml-2.5 block text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};

export default RememberMeCheckbox;
