import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNavBar } from './BottomNavBar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppLayout() {
  return (
    <div className="flex h-dvh w-full bg-background overflow-hidden relative text-foreground">
      <Sidebar className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-xl" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
        <ScrollArea className="flex-1 h-full w-full relative">
          <main className="p-4 md:p-8 max-w-5xl mx-auto w-full">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
      <BottomNavBar className="md:hidden fixed bottom-0 w-full h-16 border-t bg-card/80 backdrop-blur-lg flex items-center justify-around z-50 pb-safe" />
    </div>
  );
}
