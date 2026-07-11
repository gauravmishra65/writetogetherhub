import { BookOpen, LogOut, Clock, UserCheck, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type Props = {
  adminEmail: string;
  totalPending: number;
  onSignOut: () => void;
};

export default function AdminHeader({ adminEmail, totalPending, onSignOut }: Props) {
  const { pathname } = useLocation();

  const navItems = [
    { to: '/admin', label: 'All Entries' },
    { to: '/admin/approvals', label: 'Approvals', badge: totalPending },
    { to: '/admin/members', label: 'Members' },
    { to: '/admin/testimonials', label: 'Testimonials' },
  ];

  return (
    <header className="bg-ink-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ember-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-serif font-bold text-white text-sm leading-tight">Write Together Hub</p>
              <p className="text-ink-400 text-xs">Admin Panel</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-ink-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.to === '/admin/approvals' && <UserCheck className="w-3.5 h-3.5" />}
                  {item.label}
                  {item.badge != null && item.badge > 0 && (
                    <span className="ml-0.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {totalPending > 0 && (
            <span className="hidden lg:flex items-center gap-1 text-amber-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              {totalPending} pending
            </span>
          )}
          <span className="hidden md:block text-ink-400 text-xs truncate max-w-[180px]">{adminEmail}</span>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 text-ink-400 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
