import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Filter out welcome, greeting, and login/auth success popups globally
const isSuppressedMessage = (msg) => {
  if (typeof msg !== 'string') return false;
  return /welcome/i.test(msg) || /authenticated/i.test(msg) || /signed in/i.test(msg) || /logged in/i.test(msg);
};

// Monkey-patch react-toastify's toast.success to ensure no component can trigger welcome toasts
if (toast.success && !toast.success.__suppressPatched) {
  const originalSuccess = toast.success.bind(toast);
  toast.success = (content, options) => {
    if (isSuppressedMessage(content)) {
      return null;
    }
    return originalSuccess(content, options);
  };
  toast.success.__suppressPatched = true;
}

export const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="bg-[#09090B] border border-zinc-800 text-white font-sans text-xs rounded-xl shadow-2xl backdrop-blur-xl"
    />
  );
};

export const showToast = {
  success: (message, options = {}) => {
    if (isSuppressedMessage(message)) return null;
    return toast.success(message, options);
  },
  error: (message, options = {}) => toast.error(message, options),
  warning: (message, options = {}) => toast.warning(message, options),
  // Info notifications (like "Signed out successfully") disabled so bright pop-ups never appear
  info: () => null,
};
