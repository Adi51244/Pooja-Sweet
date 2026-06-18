import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function StaffModal({ staff, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    role: '',
    phone: '',
    snack_amount: '',
    monthly_salary: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setForm({
        name: staff.name || '',
        role: staff.role || '',
        phone: staff.phone || '',
        snack_amount: staff.snack_amount?.toString() || '',
        monthly_salary: staff.monthly_salary?.toString() || '',
      });
    }
  }, [staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        name: form.name.trim(),
        role: form.role.trim(),
        phone: form.phone.trim(),
        snack_amount: Number(form.snack_amount) || 0,
        monthly_salary: Number(form.monthly_salary) || 0,
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
      <div
        className="absolute inset-0 bg-cocoa-800/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-cream-50 rounded-t-3xl sm:rounded-3xl p-6 safe-bottom animate-slide-up shadow-2xl mx-0 sm:mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-cocoa-800">
            {staff ? 'Edit Staff' : 'Add Staff'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-cream-200 text-cocoa-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name *" id="name">
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              className="input"
              autoFocus
            />
          </Field>

          <Field label="Role" id="role">
            <input
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Counter Staff"
              className="input"
            />
          </Field>

          <Field label="Phone" id="phone">
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="input"
            />
          </Field>

          <Field label="Daily Snack Amount (₹)" id="amount">
            <input
              id="amount"
              type="number"
              min="0"
              step="1"
              value={form.snack_amount}
              onChange={(e) => setForm({ ...form, snack_amount: e.target.value })}
              placeholder="e.g. 50"
              className="input"
            />
            <p className="text-xs text-cocoa-600/50 mt-1">Separate from salary — not deducted</p>
          </Field>

          <Field label="Monthly Salary (₹)" id="salary">
            <input
              id="salary"
              type="number"
              min="0"
              step="1"
              value={form.monthly_salary}
              onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
              placeholder="e.g. 15000"
              className="input"
            />
          </Field>

          {error && (
            <p className="text-rose-500 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-honey-500 to-honey-600 text-white font-semibold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {saving ? 'Saving...' : staff ? 'Update Staff' : 'Add Staff'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-cocoa-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
