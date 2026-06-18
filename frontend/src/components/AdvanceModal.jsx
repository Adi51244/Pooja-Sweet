import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api, todayISO } from '../api';

export default function AdvanceModal({ staffList, onClose, onSave, defaultStaffId }) {
  const [form, setForm] = useState({
    staff_id: defaultStaffId || '',
    amount: '',
    date: todayISO(),
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultStaffId) {
      setForm((f) => ({ ...f, staff_id: String(defaultStaffId) }));
    }
  }, [defaultStaffId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.staff_id || !form.amount) {
      setError('Select staff and enter amount');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        staff_id: Number(form.staff_id),
        amount: Number(form.amount),
        date: form.date,
        note: form.note.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-cocoa-800/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-cream-50 rounded-t-3xl sm:rounded-3xl p-6 safe-bottom animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-cocoa-800">Give Advance</h2>
            <p className="text-xs text-cocoa-600/60 mt-0.5">
              Deducted from monthly salary only (not snacks)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-cream-200 text-cocoa-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-cocoa-700 mb-1.5">Staff *</label>
            <select
              value={form.staff_id}
              onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
              className="input"
            >
              <option value="">Select staff</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-cocoa-700 mb-1.5">
              Amount (₹) *
            </label>
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="e.g. 2000"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cocoa-700 mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cocoa-700 mb-1.5">Note</label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Optional reason"
              className="input"
            />
          </div>

          {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cocoa-700 to-cocoa-800 text-white font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Record Advance'}
          </button>
        </form>
      </div>
    </div>
  );
}
