import { Calendar, CheckCircle2, Users, Wallet } from 'lucide-react';

const tabs = [
  { id: 'today', label: 'Snacks', icon: CheckCircle2 },
  { id: 'salary', label: 'Salary', icon: Wallet },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'history', label: 'History', icon: Calendar },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      <div className="mx-auto max-w-lg px-3 pb-4">
        <div className="flex items-center justify-around bg-cocoa-800 rounded-2xl shadow-card py-2 px-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 flex-1 ${
                  isActive
                    ? 'bg-honey-500 text-white shadow-glow'
                    : 'text-cream-200/70 active:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
