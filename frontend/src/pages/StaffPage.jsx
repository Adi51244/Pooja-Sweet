import { useCallback, useEffect, useState } from 'react';
import { Edit2, Phone, Plus, Trash2, User } from 'lucide-react';
import { api, formatCurrency } from '../api';
import Header from '../components/Header';
import StaffModal from '../components/StaffModal';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStaff();
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (formData) => {
    if (modal?.id) {
      await api.updateStaff(modal.id, formData);
    } else {
      await api.addStaff(formData);
    }
    await load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name} from active staff?`)) return;
    try {
      await api.deleteStaff(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Header
        title="My Staff"
        subtitle={`${staff.length} team member${staff.length !== 1 ? 's' : ''}`}
      />

      {error && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="px-4 mb-4">
        <button
          onClick={() => setModal({})}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-honey-500 to-rose-400 text-white font-semibold shadow-glow active:scale-[0.98] transition-transform"
        >
          <Plus size={20} />
          Add New Staff
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-honey-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : staff.length === 0 ? (
        <div className="mx-4 p-8 rounded-3xl bg-white border-2 border-dashed border-cream-200 text-center">
          <p className="font-semibold text-cocoa-800 mb-1">No staff yet</p>
          <p className="text-sm text-cocoa-600/60">
            Add your shop staff to start tracking snacks money
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-3 pb-4">
          {staff.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-4 shadow-card border border-cream-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-honey-400/20 to-rose-400/20 flex items-center justify-center shrink-0">
                  <User size={22} className="text-honey-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-cocoa-800">{s.name}</p>
                  {s.role && (
                    <p className="text-xs text-cocoa-600/60">{s.role}</p>
                  )}
                  {s.phone && (
                    <p className="flex items-center gap-1 text-xs text-cocoa-600/50 mt-1">
                      <Phone size={11} />
                      {s.phone}
                    </p>
                  )}
                  <div className="flex gap-3 mt-2">
                    <p className="text-sm font-semibold text-honey-600">
                      Snacks: {formatCurrency(s.snack_amount)}/day
                    </p>
                    {s.monthly_salary > 0 && (
                      <p className="text-sm font-semibold text-cocoa-700">
                        Salary: {formatCurrency(s.monthly_salary)}/mo
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setModal(s)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-cream-100 text-cocoa-700 active:scale-95"
                    aria-label="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 active:scale-95"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <StaffModal
          staff={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
