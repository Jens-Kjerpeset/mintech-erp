import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNavBar } from './BottomNavBar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppLayout() {
 const location = useLocation();
 return (
 <div className="flex h-dvh w-full bg-background overflow-hidden relative text-foreground">
 <Sidebar className="hidden md:flex w-64 flex-col border-r bg-card " />
 <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
 <ScrollArea key={location.pathname} className="flex-1 h-full w-full relative">
 <main className="p-4 md:p-8 max-w-5xl mx-auto w-full">
 <Outlet />
 </main>
 </ScrollArea>
 </div>
 <BottomNavBar className="md:hidden fixed bottom-0 w-full h-16 border-t bg-card flex items-center justify-around pb-safe" />
 </div>
 );
}
