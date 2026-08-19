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

  const handleAccountSelect = async (selectedEmailOrToken) => {
    setLoading(true);
    try {
      const authResult = await googleLogin(selectedEmailOrToken);
      const user = authResult?.user || {};
      const userEmail = user.email || (typeof selectedEmailOrToken === 'string' && selectedEmailOrToken.includes('@') ? selectedEmailOrToken : 'User');
      const displayName = user.first_name || userEmail.split('@')[0] || 'User';

      toast.success(`Welcome back, ${displayName}!`, {
        icon: '🚀',
        autoClose: 2500,
      });
      setShowGoogleModal(false);

      // Instant role-aware redirection based on resolved user email
      const isAdmin = userEmail.toLowerCase() === 'fintech0707@gmail.com';
      const targetRoute = isAdmin ? '/admin/overview' : ROUTES.DASHBOARD;

      navigate(targetRoute, { replace: true });
      
      // Fallback reload if modal overlay blocks router
      setTimeout(() => {
        if (window.location.pathname.includes('/login') || window.location.pathname === '/') {
          window.location.href = targetRoute;
        }
      }, 300);
    } catch (err) {
      console.error('[GoogleAuth] Error:', err);
      toast.error(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              await handleAccountSelect(response.credential);
            }
          },
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
        return;
      } catch (err) {
        console.warn('Google GSI notice:', err);
      }
    }

    // Open Google OAuth account chooser modal
    setShowGoogleModal(true);
  };

  return (
    <div className="space-y-2.5 w-full">
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-zinc-800" />
        <span className="bg-[#09090B] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 absolute">
          Or continue with
        </span>
      </div>

      <div className="w-full">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-800 bg-[#09090B] py-2.5 px-4 text-xs font-bold text-slate-200 transition-all hover:bg-zinc-900 hover:border-zinc-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>Continue with Google</span>
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
