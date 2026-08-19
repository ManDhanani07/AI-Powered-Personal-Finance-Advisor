export const PageContainer = ({ title, description, actions, children }) => {
  return (
    <div className="space-y-6">
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default PageContainer;
