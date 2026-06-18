import { useState } from 'react';
import { Lock, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('Enter at least 4 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(pin);
    } catch (err) {
      setError(err.message);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit) => {
    if (pin.length >= 6) return;
    setPin((p) => p + digit);
    setError('');
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 via-cream-50 to-rose-100/30 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-honey-400/15 blur-3xl" />
        <div className="absolute bottom-1/3 -left-16 w-48 h-48 rounded-full bg-rose-400/15 blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-honey-400 to-rose-400 flex items-center justify-center text-4xl shadow-glow mb-6">
          🍬
        </div>

        <h1 className="font-display text-3xl font-bold text-cocoa-800 text-center">
          Pooja Sweets
        </h1>
        <p className="text-cocoa-600/70 text-sm mt-1 mb-8 flex items-center gap-1.5">
          <Store size={14} />
          Admin Login
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs">
          <div className="flex items-center justify-center gap-3 mb-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < pin.length
                    ? 'bg-honey-500 scale-110'
                    : 'bg-cream-200 border-2 border-cream-300'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-rose-500 text-sm font-medium mb-4">{error}</p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handlePinInput(String(n))}
                className="h-16 rounded-2xl bg-white border-2 border-cream-200 text-xl font-semibold text-cocoa-800 shadow-sm active:scale-95 active:bg-cream-100 transition-all"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="h-16 rounded-2xl bg-cream-200 text-sm font-semibold text-cocoa-600 active:scale-95"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handlePinInput('0')}
              className="h-16 rounded-2xl bg-white border-2 border-cream-200 text-xl font-semibold text-cocoa-800 shadow-sm active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-cream-200 text-sm font-semibold text-cocoa-600 active:scale-95"
            >
              ⌫
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-honey-500 to-rose-400 text-white font-semibold flex items-center justify-center gap-2 shadow-glow active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            <Lock size={18} />
            {loading ? 'Logging in...' : 'Unlock'}
          </button>
        </form>

        <p className="text-xs text-cocoa-600/40 mt-8 text-center max-w-xs">
          Default PIN is 1234 — change it in Settings after first login
        </p>
      </div>
    </div>
  );
}
