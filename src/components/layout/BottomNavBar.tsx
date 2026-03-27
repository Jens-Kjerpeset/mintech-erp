import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faReceipt, faArrowRightArrowLeft, faStore } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';


export function BottomNavBar({ className }: { className?: string }) {
 const links = [
 { to: '/', icon: faHouse, label: 'Hjem' },
 { to: '/transactions', icon: faArrowRightArrowLeft, label: 'Transaksjoner' },
 { to: '/invoices', icon: faReceipt, label: 'Fakturaer' },
 { to: '/katalog', icon: faStore, label: 'Katalog' },
 ];

 return (
 <nav className={[className].filter(Boolean).join(' ')}>
 {links.map(({ to, icon: Icon, label }) => (
 <NavLink
 key={to}
 to={to}
 className={({ isActive }) =>
 [
 "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
 isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
 ].filter(Boolean).join(' ')
 }
 >
 {({ isActive }) => (
 <>
 {isActive && (
 <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-md" />
 )}
 <FontAwesomeIcon icon={Icon} className={["w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]"].filter(Boolean).join(' ')} />
 <span className="text-[10px] font-medium">{label}</span>
 </>
 )}
 </NavLink>
 ))}
 </nav>
 );
}
