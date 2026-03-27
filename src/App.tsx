import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileScreen, faDesktop, faSignal, faWifi, faBatteryFull } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Invoices } from './pages/Invoices';
import { Settings } from './pages/Settings';
import { Katalog } from './pages/Katalog';
import { Button } from './components/ui/button';


const router = createBrowserRouter([
 {
 path: '/',
 element: <AppLayout />,
 children: [
 { index: true, element: <Dashboard /> },
 { path: 'transactions', element: <Transactions /> },
 { path: 'invoices', element: <Invoices /> },
 { path: 'settings', element: <Settings /> },
 { path: 'katalog', element: <Katalog /> },
 ],
 },
]);

export default function App() {
 const inIframe = window !== window.top;
 // FEATURE DISABLED TEMPORARILY: Set to false to hide iPhone Simulator
 const [isIPhoneMode, setIsIPhoneMode] = useState(false);
 const [scale, setScale] = useState(1);

 // TODO: The iframe simulator scaling breaks slightly on ultra-wide horizontal monitors. 
 // Ignoring for now since our users are mostly B2B iPad/Desktop anyway. - Jens
 // ... (useEffects remain the same) 
 useEffect(() => {
 if (!inIframe && isIPhoneMode) {
 const calculateScale = () => {
 // iPhone height (852) + thick border (28) + top/bottom padding margin (64)
 const TOTAL_REQUIRED_HEIGHT = 900; 
 const currentHeight = window.innerHeight;
 
 if (currentHeight < TOTAL_REQUIRED_HEIGHT) {
 setScale(currentHeight / TOTAL_REQUIRED_HEIGHT);
 } else {
 setScale(1);
 }
 };
 
 calculateScale();
 window.addEventListener('resize', calculateScale);
 return () => window.removeEventListener('resize', calculateScale);
 }
 }, [inIframe, isIPhoneMode]);

 // iPhone Simulator Render
 if (!inIframe && isIPhoneMode) {
 return (
 <div className="min-h-screen bg-neutral-950 flex shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] flex-col items-center justify-start pt-8 sm:pt-16 relative overflow-hidden font-sans">
 
 {/* Scaled Container for Phone & Attached Controls */}
 <div 
 className="relative shrink-0 origin-top transition-transform "
 style={{ transform: `scale(${scale})` }}
 >
 {/* Simulator Controls (Attached to Top Left Outside) */}
 <div className="absolute top-0 right-full mr-6 flex flex-col gap-3 ">
 <div className="flex flex-col gap-2 bg-neutral-900 border border-neutral-800 p-2 rounded-none shadow-sm">
 <div className="hidden lg:flex px-3 py-2 items-center gap-2 text-neutral-300 border-b border-neutral-800/80 mb-1">
 <FontAwesomeIcon icon={faMobileScreen} className="w-4 h-4" />
 <span className="text-sm font-medium tracking-wide whitespace-nowrap">iPhone 17 Pro</span>
 </div>
 <Button 
 variant="secondary" 
 size="sm" 
 className="rounded-none bg-neutral-800 hover:bg-neutral-700 text-white border-0 shadow-none h-10 justify-start px-4"
 onClick={() => setIsIPhoneMode(false)}
 >
 <FontAwesomeIcon icon={faDesktop} className="w-4 h-4 mr-2" />
 Desktop Mode
 </Button>
 </div>
 </div>

 {/* Physical iPhone Frame */}
 <div className="relative w-[393px] h-[852px] bg-black rounded-[55px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[14px] border-black overflow-hidden ring-1 ring-white/20">
 
 {/* iOS Status Bar Overlay */}
 <div className="absolute top-0 inset-x-0 h-[44px] pointer-events-none flex items-center justify-between px-8 text-black mix-blend-screen opacity-90">
 {/* Hardware - Dynamic Island */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-b-3xl flex justify-center shadow-sm pointer-events-none">
 <div className="w-[12px] h-[12px] rounded-full bg-[#111] mt-2 shadow-[inset_0_0_3px_rgba(255,255,255,0.2)]"></div>
 </div>
 
 {/* Time */}
 <div className="text-[15px] font-medium tracking-tight mt-1 flex-1">
 9:41
 </div>
 
 {/* System Icons */}
 <div className="flex items-center justify-end gap-1.5 mt-1 flex-1">
 <FontAwesomeIcon icon={faSignal} className="w-4 h-4" />
 <FontAwesomeIcon icon={faWifi} className="w-4 h-4" />
 <FontAwesomeIcon icon={faBatteryFull} className="w-6 h-6 rotate-90" />
 </div>
 </div>
 
 {/* Iframe Viewport Isolation */}
 <iframe 
 src={window.location.pathname + window.location.search} 
 className="w-full h-full bg-background border-none rounded-[41px]"
 title="SaaS App Mobile View"
 />
 </div>
 </div>
 
 <p className="mt-8 text-neutral-500 text-xs sm:text-sm font-medium hidden sm:block">
 Drives by native iframe isolation for exactly accurate screen size simulation.
 </p>
 </div>
 );
 }

 // Base Desktop/Nested App Mode
 return (
 <>
 <RouterProvider router={router} />
 
 {/* Floating Toggle on Desktop Mode 
 {!inIframe && !isIPhoneMode && (
 <Button 
 variant="outline" 
 size="lg"
 onClick={() => setIsIPhoneMode(true)}
 className="fixed bottom-6 right-6 shadow-sm rounded-full z-[100] h-14 bg-background border-primary text-primary hover:bg-primary/10 font-medium tracking-tight"
 >
 <FontAwesomeIcon icon={faMobileScreen} className="w-5 h-5 mr-2" />
 Test i iPhone
 </Button>
 )}
 */}
 </>
 );
}
