import { useCallback, useEffect, useState } from 'react';
import { Calendar, IndianRupee } from 'lucide-react';
import { api, formatCurrency, formatDate } from '../api';
import Header from '../components/Header';

export default function HistoryPage() {
  const [dates, setDates] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDates();
      setDates(data);
      if (data.length > 0 && !selectedDate) {
        setSelectedDate(data[0].date);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const loadHistory = useCallback(async (date) => {
    if (!date) return;
    try {
      const data = await api.getHistory({ from: date, to: date });
      setHistory(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  useEffect(() => {
    if (selectedDate) loadHistory(selectedDate);
  }, [selectedDate, loadHistory]);

  const selectedSummary = dates.find((d) => d.date === selectedDate);

  return (
    <div>
      <Header
        title="History"
        subtitle="Past snack money records"
      />

      {error && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-honey-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : dates.length === 0 ? (
        <div className="mx-4 p-8 rounded-3xl bg-white border-2 border-dashed border-cream-200 text-center">
          <Calendar size={32} className="mx-auto mb-3 text-cocoa-600/30" />
          <p className="font-semibold text-cocoa-800 mb-1">No history yet</p>
          <p className="text-sm text-cocoa-600/60">
            Start marking payments on the Today tab
          </p>
        </div>
      ) : (
        <>
          <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-1">
              {dates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedDate === d.date
                      ? 'bg-honey-500 text-white shadow-glow'
                      : 'bg-white text-cocoa-700 border border-cream-200'
                  }`}
                >
                  {formatDate(d.date)}
                </button>
              ))}
            </div>
          </div>

          {selectedSummary && (
            <div className="px-4 mb-4">
              <div className="flex gap-3">
                <StatBox
                  label="Paid"
                  value={`${selectedSummary.paid_count}/${selectedSummary.total}`}
                  color="emerald"
                />
                <StatBox
                  label="Total Given"
                  value={formatCurrency(selectedSummary.total_amount)}
                  color="honey"
                />
              </div>
            </div>
          )}

          <div className="px-4 space-y-2 pb-4">
            {history.length === 0 ? (
              <p className="text-center text-sm text-cocoa-600/50 py-8">
                No payments recorded for this day
              </p>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-cream-200 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-cocoa-800 truncate">
                      {h.staff_name}
                    </p>
                    {h.staff_role && (
                      <p className="text-xs text-cocoa-600/50">{h.staff_role}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 font-semibold text-honey-600">
                    <IndianRupee size={14} />
                    {Number(h.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  const colors = {
    emerald: 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700',
    honey: 'from-cream-100 to-cream-200 border-honey-300 text-honey-600',
  };
  return (
    <div
      className={`flex-1 p-4 rounded-2xl bg-gradient-to-br border ${colors[color]}`}
    >
      <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}
