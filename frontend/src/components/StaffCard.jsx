import { Check, IndianRupee, MessageCircle, User } from 'lucide-react';
import { formatCurrency } from '../api';

export default function StaffCard({ record, onToggle, loading, onWhatsApp, whatsAppLoading }) {
  const { staff, paid, amount } = record;

  return (
    <div
      className={`w-full text-left rounded-2xl p-4 border-2 transition-all duration-200 ${
        paid
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm'
          : 'bg-white border-cream-200 shadow-card hover:border-honey-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(staff.id)}
          disabled={loading}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-60 active:scale-95 ${
            paid
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-br from-cream-100 to-cream-200 text-cocoa-600'
          }`}
        >
          {paid ? <Check size={22} strokeWidth={3} /> : <User size={22} />}
        </button>

        <button
          onClick={() => onToggle(staff.id)}
          disabled={loading}
          className="flex-1 min-w-0 text-left disabled:opacity-60 active:scale-[0.98]"
        >
          <p className="font-semibold text-cocoa-800 truncate">{staff.name}</p>
          {staff.role && (
            <p className="text-xs text-cocoa-600/60 truncate">{staff.role}</p>
          )}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {staff.phone && onWhatsApp && (
            <button
              onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
              disabled={whatsAppLoading}
              className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-60"
              aria-label={`Send WhatsApp to ${staff.name}`}
            >
              <MessageCircle size={15} />
            </button>
          )}

          <div className="text-right">
            <div className="flex items-center gap-0.5 font-semibold text-cocoa-800">
              <IndianRupee size={14} className="text-honey-600" />
              <span>{formatCurrency(amount).replace('₹', '')}</span>
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${paid ? 'text-emerald-600' : 'text-rose-500'}`}>
              {paid ? 'Paid ✓' : 'Pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}