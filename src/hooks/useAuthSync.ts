import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout, updateTokens } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to synchronize authentication state across browser tabs.
 *
 * When a user logs out in one tab, all other tabs will also be logged out.
 * When a token is refreshed in one tab, all other tabs will receive the new token.
 */
export const useAuthSync = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Handle logout in another tab
      if (event.key === 'authToken') {
        if (!event.newValue) {
          // Token was removed - logout in this tab too
          dispatch(logout());
          navigate('/iniciar-sesion');
        } else if (event.newValue !== event.oldValue && event.newValue) {
          // Token was updated - sync to this tab
          dispatch(updateTokens({ token: event.newValue }));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch, navigate]);
};
