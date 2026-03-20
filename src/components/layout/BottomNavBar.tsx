import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, ArrowLeftRight, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavBar({ className }: { className?: string }) {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Hjem' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transaksjoner' },
    { to: '/invoices', icon: Receipt, label: 'Fakturaer' },
    { to: '/katalog', icon: Store, label: 'Katalog' },
  ];

  return (
    <nav className={cn(className)}>
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-md" />
              )}
              <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
