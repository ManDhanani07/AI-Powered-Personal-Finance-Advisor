import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  success: (message, options = {}) => toast.success(message, options),
  error: (message, options = {}) => toast.error(message, options),
  warning: (message, options = {}) => toast.warning(message, options),
  // Info notifications (like "Signed out successfully") disabled so bright pop-ups never appear
  info: () => null,
};
