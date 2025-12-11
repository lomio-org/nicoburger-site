import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Home } from 'lucide-react';
import { PaintingsList } from './PaintingsList';
import { PaintingFormModal } from './PaintingFormModal';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                <Home className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="font-heading text-xl sm:text-2xl font-bold truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Painting</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button variant="outline" onClick={signOut} size="sm" className="flex-1 sm:flex-none">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <PaintingsList />
      </main>

      {/* Add Modal */}
      <PaintingFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
};
