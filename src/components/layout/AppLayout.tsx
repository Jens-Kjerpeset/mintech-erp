import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/useAppStore';
import { BottomSheet } from './BottomSheet';
import { api } from '../../lib/api';

export function AppLayout() {
  const toggleBottomSheet = useAppStore(state => state.toggleBottomSheet);
  const theme = useAppStore(state => state.theme);
  const setLanguage = useAppStore(state => state.setLanguage);
  const [imageError, setImageError] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get()
  });

  useEffect(() => {
    // Seed the database silently before the user interacts
    api.seedDataIfNeeded().catch(console.error);
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [settings?.logoUrl]);

  useEffect(() => {
    if (settings?.language) {
      setLanguage(settings.language as 'no' | 'en');
    }
  }, [settings?.language, setLanguage]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <header className="fixed top-0 inset-x-0 z-30 h-16 bg-[var(--card-bg)] border-b-2 border-[var(--border-brutal)] flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 transition-opacity active:opacity-70">
          {settings?.logoUrl && !imageError && (
            <img 
              src={settings.logoUrl} 
              alt="Company Logo" 
              className="h-8 w-auto object-contain shrink-0 rounded-sm" 
              onError={() => setImageError(true)}
            />
          )}
          <div className="font-black text-xl tracking-tighter text-[var(--text-base)] truncate max-w-[200px]">
            {settings?.companyName || "Mintech"}
          </div>
        </Link>
        <Button variant="default" size="icon" onClick={toggleBottomSheet} aria-label="Åpne meny">
          <FontAwesomeIcon icon={faBars} />
        </Button>
      </header>

      <main className="flex-1 pt-20 px-4 pb-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <BottomSheet />
    </div>
  );
}
