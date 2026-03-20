import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, ArrowLeftRight, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({ className }: { className?: string }) {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Oversikt' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transaksjoner' },
    { to: '/invoices', icon: Receipt, label: 'Fakturaer' },
    { to: '/katalog', icon: Store, label: 'Katalog' },
  ];

  return (
    <aside className={cn("py-8 px-4", className)}>
      <div className="mb-8 px-4 flex items-center gap-2">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold font-heading">K</span>
        </div>
        <h1 className="text-xl font-heading font-semibold tracking-tight">Kottet</h1>
      </div>
      
      <nav className="space-y-2 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto px-4 py-4 border-t text-xs text-muted-foreground">
        Kottet OS
      </div>
    </aside>
  );
}
