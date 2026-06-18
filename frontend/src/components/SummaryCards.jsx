import { formatCurrency } from '../api';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const { total, paid, pending, totalAmount } = summary;
  const progress = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div className="px-4 mb-4">
      <div className="bg-gradient-to-br from-cocoa-700 to-cocoa-800 rounded-3xl p-5 text-white shadow-card relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-honey-500/10" />
        <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-rose-400/10" />

        <p className="text-cream-200/80 text-sm font-medium mb-1">Today's Progress</p>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-display text-4xl font-bold text-honey-400">{paid}</span>
            <span className="text-cream-200/60 text-lg"> / {total}</span>
            <p className="text-cream-200/70 text-sm mt-1">staff paid</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            <p className="text-cream-200/70 text-xs">given today</p>
          </div>
        </div>

        <div className="h-2.5 bg-cocoa-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-honey-400 to-rose-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {pending > 0 && (
          <p className="mt-3 text-sm text-rose-300 font-medium">
            ⚠️ {pending} staff still waiting for snacks money
          </p>
        )}
        {pending === 0 && total > 0 && (
          <p className="mt-3 text-sm text-honey-300 font-medium">
            ✅ All staff paid for today!
          </p>
        )}
      </div>
    </div>
  );
}
