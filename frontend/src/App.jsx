import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import BottomNav from './components/BottomNav';
import TodayPage from './pages/TodayPage';
import StaffPage from './pages/StaffPage';
import SalaryPage from './pages/SalaryPage';
import HistoryPage from './pages/HistoryPage';

function AppContent() {
  const { authenticated, loading } = useAuth();
  const [tab, setTab] = useState('today');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-honey-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-cocoa-600/60">Loading Pooja Sweets...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 via-cream-50 to-cream-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-honey-400/10 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-48 h-48 rounded-full bg-rose-400/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 rounded-full bg-honey-500/8 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-lg min-h-screen pb-28">
        {tab === 'today' && <TodayPage />}
        {tab === 'staff' && <StaffPage />}
        {tab === 'salary' && <SalaryPage />}
        {tab === 'history' && <HistoryPage />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
