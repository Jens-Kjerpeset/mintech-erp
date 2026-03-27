import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faReceipt, faArrowRightArrowLeft, faStore } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';


export function Sidebar({ className }: { className?: string }) {
 const links = [
 { to: '/', icon: faHouse, label: 'Oversikt' },
 { to: '/transactions', icon: faArrowRightArrowLeft, label: 'Transaksjoner' },
 { to: '/invoices', icon: faReceipt, label: 'Fakturaer' },
 { to: '/katalog', icon: faStore, label: 'Katalog' },
 ];

 return (
 <aside className={["py-8 px-4", className].filter(Boolean).join(' ')}>
 <div className="mb-8 px-4 flex items-center gap-2">
 <div className="size-8 rounded-none bg-primary flex items-center justify-center">
 <span className="text-primary-foreground font-medium tracking-tight font-heading">K</span>
 </div>
 <h1 className="text-xl font-heading font-medium tracking-tight">Kottet</h1>
 </div>
 
 <nav className="space-y-2 flex-1">
 {links.map(({ to, icon: Icon, label }) => (
 <NavLink
 key={to}
 to={to}
 className={({ isActive }) =>
 [
 "flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-colors",
 isActive 
 ? "bg-accent text-accent-foreground shadow-sm"
 : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
 ].filter(Boolean).join(' ')
 }
 >
 <FontAwesomeIcon icon={Icon} className="w-5 h-5" />
 {label}
 </NavLink>
 ))}
 </nav>
 
 <div className="mt-auto px-4 py-4 border-t text-xs text-muted-foreground">
 Designet og utviklet av{" "}
 <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors">
 Jens Kjerpeset
 </a>
 </div>
 </aside>
 );
}
