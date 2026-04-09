import React, { useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import { useAppStore } from '../../store/useAppStore';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHome, faFileInvoice, faBox, faCog, faUsers, faBookJournalWhills, faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui/button';

export function BottomSheet() {
  const { isBottomSheetOpen, setBottomSheetOpen } = useAppStore();

  const bind = useDrag(({ movement: [, my], velocity: [, vy], direction: [, dy], cancel, last }) => {
    if (my < -50) cancel();
    if (last) {
      if (my > 100 || (vy > 0.5 && dy > 0)) {
        setBottomSheetOpen(false);
      }
    }
  }, {
    from: () => [0, 0],
    bounds: { top: 0 },
    rubberband: true,
    axis: 'y'
  });

  // Lock body scroll when open
  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isBottomSheetOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity",
          isBottomSheetOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setBottomSheetOpen(false)}
      />

      {/* Sheet */}
      <aside
        aria-labelledby="menu-title"
        {...bind()}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[var(--card-bg)] border-t-2 border-[var(--border-brutal)] pb-8 rounded-t-2xl shadow-[0_-4px_0_0_rgba(0,0,0,0.1)] touch-none transition-transform duration-300",
          isBottomSheetOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          height: '85vh',
        }}
      >
        <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        
        <div className="px-6 flex justify-between items-center mb-6">
          <h2 id="menu-title" className="text-2xl font-black tracking-widest">Meny</h2>
          <Button variant="outline" size="icon" onClick={() => setBottomSheetOpen(false)} aria-label="Lukk meny">
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </div>

        <nav className="flex-1 px-6 flex flex-col gap-4 overflow-y-auto">
          <Link to="/" onClick={() => setBottomSheetOpen(false)} className="flex items-center gap-4 text-xl font-bold tracking-wide border-2 border-[var(--border-brutal)] p-4 hover:bg-[var(--muted-bg)] transition-colors">
            <FontAwesomeIcon icon={faHome} className="w-6" /> Dashboard
          </Link>
          <Link to="/invoices" onClick={() => setBottomSheetOpen(false)} className="flex items-center gap-4 text-xl font-bold tracking-wide border-2 border-[var(--border-brutal)] p-4 hover:bg-[var(--muted-bg)] transition-colors">
            <FontAwesomeIcon icon={faFileInvoice} className="w-6" /> Faktura
          </Link>
          <Link to="/contacts" onClick={() => setBottomSheetOpen(false)} className="flex items-center gap-4 text-xl font-bold tracking-wide border-2 border-[var(--border-brutal)] p-4 hover:bg-[var(--muted-bg)] transition-colors">
             <FontAwesomeIcon icon={faUsers} className="w-6" /> Kontakter
          </Link>
          <Link to="/inventory" onClick={() => setBottomSheetOpen(false)} className="flex items-center gap-4 text-xl font-bold tracking-wide border-2 border-[var(--border-brutal)] p-4 hover:bg-[var(--muted-bg)] transition-colors">
            <FontAwesomeIcon icon={faBox} className="w-6" /> Varelager
          </Link>
          <Link to="/zreports" onClick={() => setBottomSheetOpen(false)} className="flex items-center gap-4 text-xl font-bold tracking-wide border-2 border-[var(--border-brutal)] p-4 hover:bg-[var(--muted-bg)] transition-colors">
            <FontAwesomeIcon icon={faCashRegister} className="w-6" /> Kasseoppgjør
          </Link>
          <Link to="/hovedbok" onClick={() => setBottomSheetOpen(false)} className="flex items-center gap-4 text-xl font-bold tracking-wide border-2 border-[var(--border-brutal)] p-4 hover:bg-[var(--muted-bg)] transition-colors">
            <FontAwesomeIcon icon={faBookJournalWhills} className="w-6" /> Hovedbok
          </Link>
          <Link to="/settings" onClick={() => setBottomSheetOpen(false)} className="flex items-center gap-4 text-xl font-bold tracking-wide border-2 border-[var(--border-brutal)] p-4 hover:bg-[var(--muted-bg)] transition-colors">
            <FontAwesomeIcon icon={faCog} className="w-6" /> Innstillinger
          </Link>
        </nav>
      </aside>
    </>
  );
}
