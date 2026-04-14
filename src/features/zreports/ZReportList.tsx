import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCashRegister, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as Dialog from '@radix-ui/react-dialog';
import { ZReportForm } from './ZReportForm';
import { ZReportDetailSheet } from './ZReportDetailSheet';
import { useTranslation } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import { ZReport } from '../../types/schema';

export function ZReportList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ZReport | null>(null);
  const { t } = useTranslation();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['zreports'],
    queryFn: () => api.zreports.list()
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-[var(--border-brutal)] pb-4 gap-4">
        <h1 className="text-3xl font-black tracking-widest">{t('zreports.title')}</h1>
        
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Trigger asChild>
            <Button size="lg">
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> {t('zreports.new_report')}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-[var(--card-bg)] border-4 border-[var(--border-brutal)] p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(24,24,27,1)] max-h-[95vh] overflow-y-auto outline-none">
                <div className="flex justify-between items-center mb-6 border-b-4 border-[var(--border-brutal)] pb-2">
                  <Dialog.Title className="text-2xl font-black tracking-widest flex items-center gap-3">
                    <FontAwesomeIcon icon={faCashRegister} /> 
                    {t('zreports.z_report')}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="outline" size="icon">
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  </Dialog.Close>
                </div>
                <ZReportForm onSuccess={() => setIsModalOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {isLoading ? (
         <div className="text-xl font-bold animate-pulse">{t('zreports.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((report) => (
            <button
               key={report.id}
               onClick={() => setSelectedReport(report)}
               className="w-full text-left active:scale-[0.98] transition-transform duration-100 ease-in-out focus:outline-none block"
            >
              <Card className="hover:bg-[var(--muted-bg)] transition-colors border-2 border-[var(--border-brutal)] w-full h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4 border-b-2 border-[var(--border-brutal)] pb-4">
                    <div className="flex items-center gap-3 font-black text-xl">
                       {new Date(report.date).toLocaleDateString('no-NO')}
                    </div>
                    <span className="font-bold text-[10px] bg-[var(--text-base)] text-[var(--bg-base)] px-2 py-1 tracking-widest truncate max-w-[80px]">ID: {report.id.split('-')[0]}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold tracking-wider text-zinc-500">{t('zreports.gross_sales')}</span>
                      <span className="font-mono font-black text-xl">{report.grossSales.toLocaleString('no-NO')} kr</span>
                    </div>
                    
                    <div className={cn(
                      "flex justify-between items-center p-3 border-2 font-mono font-bold transition-colors",
                      report.cashDifference === 0 
                        ? "border-green-600 bg-green-50 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-400" 
                        : report.cashDifference < 0 
                          ? "border-red-600 bg-red-50 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-400" 
                          : "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400"
                    )}>
                      <span className="tracking-widest text-xs font-black font-sans">
                        {report.cashDifference === 0 ? t('zreports.balanced') : report.cashDifference < 0 ? t('zreports.shortage') : t('zreports.surplus')}
                      </span>
                      <span>{report.cashDifference > 0 ? '+' : ''}{report.cashDifference.toLocaleString('no-NO')} kr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
          
          {reports?.length === 0 && (
            <div className="col-span-full p-8 text-center border-4 border-[var(--border-brutal)] border-dashed font-black tracking-widest text-xl text-zinc-400">
              {t('zreports.no_reports')}
            </div>
          )}
        </div>
      )}

      <ZReportDetailSheet 
        report={selectedReport} 
        onClose={() => setSelectedReport(null)} 
      />
    </div>
  );
}
