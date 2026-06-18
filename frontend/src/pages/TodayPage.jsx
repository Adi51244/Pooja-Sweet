import { useCallback, useEffect, useState } from 'react';
import { CheckCheck, MessageCircle, RefreshCw, Users } from 'lucide-react';
import { api, openWhatsApp, todayISO } from '../api';
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import StaffCard from '../components/StaffCard';

export default function TodayPage() {
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [reminding, setReminding] = useState(null); // staff_id or 'all'
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getToday(date);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (staffId) => {
    setToggling(staffId);
    try {
      await api.togglePayment(staffId, date);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setToggling(null);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await api.markAll(date, true);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  // Send WhatsApp to a single staff member
  const handleStaffWhatsApp = async (staffId) => {
    setReminding(staffId);
    try {
      const result = await api.getStaffWhatsApp(staffId, date);
      if (!result.has_phone) {
        setError(`No phone number saved for ${result.staff_name}. Edit staff to add one.`);
        return;
      }
      openWhatsApp(result.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setReminding(null);
    }
  };

  // Send WhatsApp to ALL pending staff
  const handleRemindAll = async () => {
    setReminding('all');
    try {
      const result = await api.getWhatsAppReminder(date);
      const withPhone = result.records.filter((r) => r.has_phone && !r.paid);
      if (withPhone.length === 0) {
        setError('No pending staff have phone numbers saved.');
        return;
      }
      // Open WhatsApp for each one with a small delay
      withPhone.forEach((r, i) => {
        setTimeout(() => openWhatsApp(r.url), i * 1500);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setReminding(null);
    }
  };

  const records = data?.records || [];
  const pending = records.filter((r) => !r.paid);
  const paid = records.filter((r) => r.paid);

  return (
    <div>
      <Header
        title="Snacks Tracker"
        subtitle="Tap a staff member to mark paid"
        date={date}
        onDateChange={setDate}
      />

      <SummaryCards summary={data?.summary} />

      {error && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="px-4 flex items-center justify-between mb-3">
        <h2 className="font-semibold text-cocoa-800">Staff List</h2>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl bg-cream-200 text-cocoa-700 active:scale-95 transition-transform"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {pending.length > 0 && (
            <>
              <button
                onClick={handleRemindAll}
                disabled={reminding === 'all'}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold active:scale-95 transition-transform disabled:opacity-60"
              >
                <MessageCircle size={14} />
                {reminding === 'all' ? 'Opening...' : 'Remind All'}
              </button>
              <button
                onClick={handleMarkAll}
                disabled={markingAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold active:scale-95 transition-transform disabled:opacity-60"
              >
                <CheckCheck size={14} />
                Mark All
              </button>
            </>
          )}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-16 text-cocoa-600/50">
          <div className="w-10 h-10 border-3 border-honey-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading...</p>
        </div>
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-4 space-y-3 pb-4">
          {pending.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                Pending ({pending.length})
              </p>
              {pending.map((r) => (
                <StaffCard
                  key={r.staff.id}
                  record={r}
                  onToggle={handleToggle}
                  loading={toggling === r.staff.id}
                  onWhatsApp={() => handleStaffWhatsApp(r.staff.id)}
                  whatsAppLoading={reminding === r.staff.id}
                />
              ))}
            </>
          )}

          {paid.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mt-4">
                Paid ({paid.length})
              </p>
              {paid.map((r) => (
                <StaffCard
                  key={r.staff.id}
                  record={r}
                  onToggle={handleToggle}
                  loading={toggling === r.staff.id}
                  onWhatsApp={() => handleStaffWhatsApp(r.staff.id)}
                  whatsAppLoading={reminding === r.staff.id}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-4 p-8 rounded-3xl bg-white border-2 border-dashed border-cream-200 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream-100 flex items-center justify-center">
        <Users size={28} className="text-cocoa-600/40" />
      </div>
      <p className="font-semibold text-cocoa-800 mb-1">No staff added yet</p>
      <p className="text-sm text-cocoa-600/60">
        Go to the Staff tab to add your team members
      </p>
    </div>
  );
}