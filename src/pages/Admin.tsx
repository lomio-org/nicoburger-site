import { AuthGuard } from '@/components/admin/AuthGuard';
import { Dashboard } from '@/components/admin/Dashboard';

const Admin = () => {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
};

export default Admin;
