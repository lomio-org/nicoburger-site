import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MagicLinkForm } from './MagicLinkForm';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <MagicLinkForm />;
  }

  return <>{children}</>;
};
