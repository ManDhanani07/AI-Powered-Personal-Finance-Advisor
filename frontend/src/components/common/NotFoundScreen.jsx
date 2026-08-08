import { Link } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';
import { ROUTES } from '../../constants/index.js';

export const NotFoundScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="max-w-md w-full fintech-card flex flex-col items-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 flex items-center justify-center text-brand-600">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Page Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The requested page does not exist or has been moved.
        </p>
        <Link to={ROUTES.HOME} className="btn-primary mt-4">
          <Home className="w-4 h-4 mr-2" /> Return Home
        </Link>
      </div>
    </div>
  );
};
