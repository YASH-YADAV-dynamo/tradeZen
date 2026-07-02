import { useAuthStore } from '../store/useAuthStore';

export const useAuthSession = () => {
  const session = useAuthStore((state) => state.session);
  const status = useAuthStore((state) => state.status);
  return { session, status, isAuthenticated: status === 'authenticated' };
};
