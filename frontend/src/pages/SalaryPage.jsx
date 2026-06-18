import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react';
import { api, currentMonth, formatCurrency, formatMonth, shiftMonth } from '../api';
import Header from '../components/Header';
import AdvanceModal from '../components/AdvanceModal';

export default function SalaryPage() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdvance, setShowAdvance] = useState(false);
  const [advanceStaffId, setAdvanceStaffId] = useState(null);
  const [processing, setProcessing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getSalary(month);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddAdvance = async (body) => {
    await api.addAdvance(body);
    await load();
  };

  const handleDeleteAdvance = async (id) => {
    if (!confirm('Remove this advance record?')) return;
    try {
      await api.deleteAdvance(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkPaid = async (staffId) => {
    setProcessing(staffId);
    try {
      await api.markSalaryPaid(staffId, month);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleUnmark = async (staffId) => {
    setProcessing(staffId);
    try {
      await api.unmarkSalaryPaid(staffId, month);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const records = data?.records || [];
  const summary = data?.summary;
  const staffList = records.map((r) => r.staff);
  const isCurrentMonth = month === currentMonth();

  return (
    <div>
      <Header
        title="Salary & Advances"
        subtitle="Snacks are tracked separately"
      />

      <div className="px-4 mb-4">
        <div className="flex items-center justify-between bg-white/70 rounded-2xl p-2 shadow-card border border-cream-200">
          <button
            onClick={() => setMonth(shiftMonth(month, -1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-cream-100 text-cocoa-700"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-sm text-cocoa-800">{formatMonth(month)}</p>
            {isCurrentMonth && (
              <p className="text-xs text-honey-600 font-medium">Current month</p>
            )}
          </div>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={isCurrentMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-cream-100 text-cocoa-700 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {summary && (
        <div className="px-4 mb-4 grid grid-cols-2 gap-3">
          <MiniStat label="Total Salary" value={formatCurrency(summary.total_salary)} />
          <MiniStat label="Advances Given" value={formatCurrency(summary.total_advances)} color="rose" />
          <MiniStat label="Net to Pay" value={formatCurrency(summary.total_net)} color="honey" wide />
          <MiniStat
            label="Salary Paid"
            value={`${summary.paid_count}/${summary.total_staff}`}
            color="emerald"
          />
        </div>
      )}

      <div className="px-4 mb-4">
        <button
          onClick={() => {
            setAdvanceStaffId(null);
            setShowAdvance(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-cocoa-700 to-cocoa-800 text-white font-semibold shadow-card active:scale-[0.98]"
        >
          <Plus size={18} />
          Record Advance Payment
        </button>
      </div>

      {error && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-honey-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="mx-4 p-8 rounded-3xl bg-white border-2 border-dashed border-cream-200 text-center">
          <Wallet size={32} className="mx-auto mb-3 text-cocoa-600/30" />
          <p className="font-semibold text-cocoa-800">No staff yet</p>
          <p className="text-sm text-cocoa-600/60">Add staff with monthly salary first</p>
        </div>
      ) : (
        <div className="px-4 space-y-4 pb-4">
          {records.map((r) => (
            <div
              key={r.staff.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all ${
                r.paid
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-cream-200 shadow-card'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-cocoa-800">{r.staff.name}</p>
                    {r.staff.role && (
                      <p className="text-xs text-cocoa-600/60">{r.staff.role}</p>
                    )}
                  </div>
                  {r.paid ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold">
                      Paid ✓
                    </span>
                  ) : r.salary_amount > 0 ? (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-600 text-xs font-bold">
                      Pending
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <AmountBox label="Salary" amount={r.salary_amount} />
                  <AmountBox label="Advances" amount={r.advances_total} negative />
                  <AmountBox label="Net Pay" amount={r.net_amount} highlight />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAdvanceStaffId(r.staff.id);
                      setShowAdvance(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cream-100 text-cocoa-700 text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    Advance
                  </button>
                  {r.salary_amount > 0 && (
                    <button
                      onClick={() => (r.paid ? handleUnmark(r.staff.id) : handleMarkPaid(r.staff.id))}
                      disabled={processing === r.staff.id}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-60 ${
                        r.paid
                          ? 'bg-cream-200 text-cocoa-600'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      <Check size={14} />
                      {r.paid ? 'Undo Paid' : 'Mark Salary Paid'}
                    </button>
                  )}
                </div>
              </div>

              {r.advances.length > 0 && (
                <div className="border-t border-cream-200 bg-cream-50/50 px-4 py-3">
                  <p className="text-xs font-semibold text-cocoa-600/60 uppercase mb-2">
                    Advances this month
                  </p>
                  <div className="space-y-1.5">
                    {r.advances.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="text-cocoa-700">{a.date}</span>
                          {a.note && (
                            <span className="text-cocoa-600/50 text-xs ml-2">{a.note}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-rose-600">
                            -{formatCurrency(a.amount)}
                          </span>
                          <button
                            onClick={() => handleDeleteAdvance(a.id)}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdvance && (
        <AdvanceModal
          staffList={staffList}
          defaultStaffId={advanceStaffId}
          onClose={() => setShowAdvance(false)}
          onSave={handleAddAdvance}
        />
      )}
    </div>
  );
}

function MiniStat({ label, value, color, wide }) {
  const colors = {
    rose: 'from-rose-50 to-rose-100/50 border-rose-200 text-rose-700',
    honey: 'from-cream-100 to-honey-100/30 border-honey-300 text-honey-600',
    emerald: 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700',
  };
  const cls = colors[color] || 'from-white to-cream-50 border-cream-200 text-cocoa-800';

  return (
    <div
      className={`p-3 rounded-2xl bg-gradient-to-br border ${cls} ${wide ? 'col-span-2' : ''}`}
    >
      <p className="text-[10px] font-semibold uppercase opacity-70">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}

function AmountBox({ label, amount, negative, highlight }) {
  return (
    <div
      className={`p-2 rounded-xl text-center ${
        highlight ? 'bg-honey-100/60' : 'bg-cream-100/80'
      }`}
    >
      <p className="text-[10px] text-cocoa-600/60 font-medium">{label}</p>
      <p
        className={`text-sm font-bold flex items-center justify-center gap-0.5 ${
          negative ? 'text-rose-600' : highlight ? 'text-honey-600' : 'text-cocoa-800'
        }`}
      >
        {negative && amount > 0 && '-'}
        <IndianRupee size={11} />
        {Number(amount).toLocaleString('en-IN')}
      </p>
    </div>
  );
}
