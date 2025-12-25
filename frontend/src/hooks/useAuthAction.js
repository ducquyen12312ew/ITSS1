import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Hook để kiểm tra authentication trước khi thực hiện action
 * Nếu chưa đăng nhập, hiện thông báo và chuyển đến login
 */
export const useAuthAction = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (callback, message = 'Vui lòng đăng nhập để sử dụng chức năng này') => {
    if (!isAuthenticated) {
      // Hiển thị thông báo
      alert(message);
      // Lưu URL hiện tại để redirect về sau khi đăng nhập
      const currentPath = window.location.pathname;
      navigate('/login', { state: { from: currentPath } });
      return false;
    }
    
    // Nếu đã đăng nhập, thực hiện callback
    if (callback) {
      callback();
    }
    return true;
  };

  return { requireAuth, isAuthenticated };
};
