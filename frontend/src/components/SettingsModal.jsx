import { useState } from 'react';
import { KeyRound, Phone, X } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function SettingsModal({ onClose }) {
  const { settings, refreshSettings, logout } = useAuth();
  const [phone, setPhone] = useState(settings.admin_phone || '');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const savePhone = async () => {
    setSaving(true);
    setError('');
    try {
      await api.updateSettings({ admin_phone: phone });
      await refreshSettings();
      setMessage('Phone saved for WhatsApp reminders');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.changePin(oldPin, newPin);
      setOldPin('');
      setNewPin('');
      setMessage('PIN changed successfully');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-cream-50 rounded-t-3xl sm:rounded-3xl p-6 safe-bottom animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-cocoa-800">Settings</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-cream-200 text-cocoa-700"
          >
            <X size={18} />
          </button>
        </div>

        {message && (
          <p className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium">
            {error}
          </p>
        )}

        <div className="space-y-6">
          <section>
            <label className="flex items-center gap-2 text-sm font-semibold text-cocoa-700 mb-2">
              <Phone size={16} className="text-honey-500" />
              Your WhatsApp Number
            </label>
            <p className="text-xs text-cocoa-600/60 mb-2">
              Used for snack reminders. Include 10-digit mobile number.
            </p>
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="input flex-1"
                type="tel"
              />
              <button
                onClick={savePhone}
                disabled={saving}
                className="px-4 py-3 rounded-xl bg-honey-500 text-white font-semibold text-sm shrink-0"
              >
                Save
              </button>
            </div>
          </section>

          <section>
            <label className="flex items-center gap-2 text-sm font-semibold text-cocoa-700 mb-2">
              <KeyRound size={16} className="text-honey-500" />
              Change PIN
            </label>
            <form onSubmit={changePin} className="space-y-3">
              <input
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Current PIN"
                className="input"
                type="password"
                inputMode="numeric"
              />
              <input
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New PIN (min 4 digits)"
                className="input"
                type="password"
                inputMode="numeric"
              />
              <button
                type="submit"
                disabled={saving || !oldPin || newPin.length < 4}
                className="w-full py-3 rounded-xl bg-cocoa-700 text-white font-semibold disabled:opacity-50"
              >
                Update PIN
              </button>
            </form>
          </section>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-3 rounded-xl border-2 border-rose-200 text-rose-600 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
