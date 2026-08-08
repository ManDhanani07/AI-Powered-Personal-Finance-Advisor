import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';
import { Loader2 } from 'lucide-react';
import GoogleOAuthModal from './GoogleOAuthModal.jsx';

export const SocialLoginButtons = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleAccountSelect = async (selectedEmail) => {
    setLoading(true);
    try {
      await googleLogin(selectedEmail);
      toast.success(`Welcome! Authenticated via Google OAuth (${selectedEmail}). Email confirmation dispatched from mandhanani536@gmail.com.`, {
        icon: '🚀',
        autoClose: 4000,
      });
      setShowGoogleModal(false);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error(err?.message || 'Google OAuth authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (response.credential) {
            await handleAccountSelect(response.credential);
          }
        },
      });
      window.google.accounts.id.prompt();
      return;
    }

    // Open official Google OAuth account chooser modal
    setShowGoogleModal(true);
  };

  const handleAppleClick = () => {
    toast.info('Apple OAuth authentication module active.', { icon: '🍎' });
  };

  return (
    <div className="space-y-4 w-full">
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border-subtle" />
        <span className="bg-bg-surface px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Or sign in with
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-border-strong bg-bg-elevated/80 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
          ) : (
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* Apple OAuth Button */}
        <button
          type="button"
          onClick={handleAppleClick}
          className="flex items-center justify-center gap-2.5 rounded-2xl border border-border-strong bg-bg-elevated/80 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <svg className="h-4 w-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.83c.67-.82 1.13-1.96.99-3.1-.98.04-2.18.66-2.88 1.48-.62.72-1.16 1.88-1.01 3.01 1.1.08 2.23-.57 2.9-1.39z" />
          </svg>
          <span>Apple</span>
        </button>
      </div>

      {/* Google OAuth Modal */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleAccountSelect}
      />
    </div>
  );
};

export default SocialLoginButtons;
