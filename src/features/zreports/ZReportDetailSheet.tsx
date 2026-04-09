import React, { useEffect } from'react';
import { useDrag } from'@use-gesture/react';
import { Button } from'../../components/ui/button';
import { FontAwesomeIcon } from'@fortawesome/react-fontawesome';
import { faTimes, faFilePdf, faCashRegister } from'@fortawesome/free-solid-svg-icons';
import { cn } from'../../lib/utils';
import { ZReport } from'../../types/schema';

export function ZReportDetailSheet({ report, onClose }: { report: ZReport | null, onClose: () => void }) {
  const isOpen = !!report;

  const bind = useDrag(({ movement: [, my], velocity: [, vy], direction: [, dy], cancel, last }) => {
    if (my < -50) cancel();
    if (last && (my > 100 || (vy > 0.5 && dy > 0))) {
      onClose();
    }
  }, {
    from: () => [0, 0],
    bounds: { top: 0 },
    rubberband: true,
    axis:'y'
  });

  useEffect(() => {
    if (report) {
      document.body.style.overflow ='hidden';
    } else {
      document.body.style.overflow ='';
    }
    return () => { document.body.style.overflow =''; };
  }, [report]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn("fixed inset-0 z-40 bg-black/60 transition-opacity",
          isOpen ?"opacity-100" :"opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Slide-Up Sheet */}
      <div
        {...bind()}
        className={cn("fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white border-t-4 border-black rounded-t-2xl shadow-[0_-4px_0_0_rgba(0,0,0,0.1)] touch-none transition-transform duration-300 h-fit max-h-[90vh]",
          isOpen ?"translate-y-0" :"translate-y-full"
        )}
      >
        {/* Grab Handle */}
        <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing shrink-0 mt-2">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        
        {report && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 flex justify-between items-start mb-4 flex-none border-b-4 border-black pb-4">
              <div>
                 <h2 className="text-2xl font-black tracking-widest flex items-center gap-2">
                    <FontAwesomeIcon icon={faCashRegister} /> Z-Rapport
                 </h2>
                 <div className="flex items-center gap-3 mt-2">
                    <span className="font-bold text-sm bg-black text-white px-2 py-0.5 tracking-widest font-mono">
                      {new Date(report.date).toLocaleDateString('no-NO')}
                    </span>
                    <span className="font-bold text-xs bg-zinc-200 text-zinc-700 px-2 py-0.5 tracking-widest font-mono truncate max-w-[150px]">
                      ID: {report.id.split('-')[0]}
                    </span>
                 </div>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={onClose} className="flex-none">
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                
                {/* Omsetning (Gross Sales) */}
                <div className="bg-black text-white p-6 shadow-md border-2 border-black flex flex-col items-start gap-1">
                    <span className="text-sm text-zinc-400 font-bold tracking-widest">Omsetning</span>
                    <span className="font-mono font-black text-4xl whitespace-nowrap">{report.grossSales.toLocaleString('no-NO')} kr</span>
                </div>

                {/* Betalingsmidler (Tenders) */}
                <div className="border-2 border-black bg-zinc-50 p-4">
                   <h3 className="font-black text-lg tracking-widest border-b-2 border-black pb-2 mb-4">
                     Betalingsmidler
                   </h3>
                   <div className="space-y-3">
                       <div className="flex justify-between items-center">
                           <span className="font-bold text-sm tracking-widest text-zinc-600">Kortsalg</span>
                           <span className="font-mono font-bold text-lg">{report.cardSales.toLocaleString('no-NO')} kr</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="font-bold text-sm tracking-widest text-zinc-600">Vipps</span>
                           <span className="font-mono font-bold text-lg">{report.vippsSales.toLocaleString('no-NO')} kr</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-t border-black/10">
                           <span className="font-bold text-sm tracking-widest text-zinc-600">Opptelt Kontant</span>
                           <span className="font-mono font-bold text-lg">{report.actualCash.toLocaleString('no-NO')} kr</span>
                       </div>
                       
                       <div className={cn("flex justify-between items-center p-3 border-2 font-mono font-bold mt-4",
                           report.cashDifference === 0 
                             ?"border-green-600 bg-green-50 text-green-800" 
                             : report.cashDifference < 0 
                               ?"border-red-600 bg-red-100 text-red-800" 
                               :"border-yellow-500 bg-yellow-100 text-yellow-900"
                       )}>
                           <span className="tracking-widest text-xs font-black font-sans">
                             {report.cashDifference === 0 ?'Perfekt Balanse' : report.cashDifference < 0 ?'Manko' :'Overskudd'}
                           </span>
                           <span className="text-xl">
                             {report.cashDifference > 0 ?'+' :''}{report.cashDifference.toLocaleString('no-NO')} kr
                           </span>
                       </div>
                   </div>
                </div>

                {/* MVA Grunnlag */}
                <div className="border-2 border-black bg-white p-4">
                   <h3 className="font-black text-lg tracking-widest border-b-2 border-black pb-2 mb-4">
                     MVA-Grunnlag
                   </h3>
                   <div className="space-y-3">
                       <div className="flex justify-between items-center">
                           <span className="font-bold text-sm tracking-widest text-zinc-600">MVA 25%</span>
                           <span className="font-mono font-bold">{report.vat25.toLocaleString('no-NO')} kr</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="font-bold text-sm tracking-widest text-zinc-600">MVA 15%</span>
                           <span className="font-mono font-bold">{report.vat15.toLocaleString('no-NO')} kr</span>
                       </div>
                       <div className="flex justify-between items-center text-zinc-400">
                           <span className="font-bold text-sm tracking-widest">MVA 0%</span>
                           <span className="font-mono font-bold">{report.vat0.toLocaleString('no-NO')} kr</span>
                       </div>
                   </div>
                </div>

            </div>

            {/* Sticky Action Footer - Immutable, Only Print/Download */}
            <div className="flex-none p-4 bg-white border-t-4 border-black sticky bottom-0 w-full z-10 flex gap-4">
               <Button 
                  className="flex-1 h-14 text-lg bg-black text-white hover:bg-zinc-800" 
                  onClick={() => {
                     // In a real app this would trigger a PDF download of the Z-report
                     // or window.print() if configured for POS systems.
                     alert("Kvittering funksjonalitet ikke implementert i demo.");
                  }}
               >
                  <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> Se Kvittering
               </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
