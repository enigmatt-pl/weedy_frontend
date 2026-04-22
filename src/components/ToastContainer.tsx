import { useToastStore } from '../store/toastStore';
import { Toast } from './ui/Toast';

export const ToastContainer = () => {
  const { show, message, type, hideToast } = useToastStore();

  if (!show) return null;

  return <Toast message={message} type={type} onClose={hideToast} />;
};
