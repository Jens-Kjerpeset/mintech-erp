import React, { useState, useMemo, useTransition } from'react';
import { useQuery } from'@tanstack/react-query';
import { api } from'../../lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faFileExport, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from '../../lib/i18n';
import { Transaction } from '../../types/schema';
import { LedgerEditSheet } from'./LedgerEditSheet';
import { useAppStore } from '../../store/useAppStore';

export function LedgerList() {
  const { t } = useTranslation();
  const language = useAppStore(state => state.language);
  const locale = language === 'en' ? 'en-GB' : 'no-NO';
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
    const currentM = new Date().toLocaleString(locale, { month: 'long', year: 'numeric' });
    return { [currentM.charAt(0).toUpperCase() + currentM.slice(1)]: true };
  });
  
  const toggleMonth = (month: string) => setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState<'all' |'income' |'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Deferred filter state for useTransition
  const [deferredFilters, setDeferredFilters] = useState({
    type:'all',
    category:'all',
    from:'',
    to:'',
    sortBy:'date_desc'
  });

  const [isPending, startTransition] = useTransition();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.transactions.list()
  });

  // Extract unique categories for dropdown
  const uniqueCategories = useMemo(() => {
    if (!transactions) return [];
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Handle immediate UI updates and deferred heavy filtering
  const handleFilterChange = (updates: any) => {
    const nextFilters = { ...deferredFilters, ...updates };
    
    // Update local immediately for inputs
    if (updates.type !== undefined) setTypeFilter(updates.type);
    if (updates.category !== undefined) setCategoryFilter(updates.category);
    if (updates.from !== undefined) setDateFrom(updates.from);
    if (updates.to !== undefined) setDateTo(updates.to);
    if (updates.sortBy !== undefined) setSortBy(updates.sortBy);

    startTransition(() => {
      setDeferredFilters(nextFilters);
    });
  };

  const handleSaftExport = async () => {
    // 1. Fetch data directly from Dexie/API wrapper
    const [invoices, zreports, settings, contacts] = await Promise.all([
      api.invoices.list(),
      api.zreports.list(),
      api.settings.get(),
      api.contacts.list()
    ]);
    
    if (!settings) return;
    
    // 2. Generate
    const { generateJournalEntries, buildSaftXML } = await import('../../lib/saft-engine');
    const journals = generateJournalEntries(invoices, zreports);
    const xml = buildSaftXML(settings, journals, contacts);
    
    // 3. Download
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Strip non-digits from OrgNumber for filename
    const orgStr = settings.orgNumber ? settings.orgNumber.replace(/\D/g, '') : 'UNK';
    a.download = `SAFT_Financial_${orgStr}_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredData = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      if (deferredFilters.type !=='all' && t.type !== deferredFilters.type) return false;
      if (deferredFilters.category !=='all' && t.category !== deferredFilters.category) return false;
      
      const tdate = new Date(t.date).getTime();
      if (deferredFilters.from && tdate < new Date(deferredFilters.from).getTime()) return false;
      if (deferredFilters.to && tdate > new Date(deferredFilters.to).getTime() + 86400000) return false; // inclusive
      
      return true;
    }).sort((a, b) => {
      if (deferredFilters.sortBy ==='date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (deferredFilters.sortBy ==='date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (deferredFilters.sortBy ==='amount_desc') return b.amount - a.amount;
      if (deferredFilters.sortBy ==='amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, deferredFilters]);

  const groupedData = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredData.forEach(t => {
      const monthStr = new Date(t.date).toLocaleString(locale, { month: 'long', year: 'numeric' });
      const cappedMonthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
      if (!groups[cappedMonthStr]) groups[cappedMonthStr] = [];
      groups[cappedMonthStr].push(t);
    });
    return groups;
  }, [filteredData, locale]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col border-b-4 border-[var(--border-brutal)] pb-4 gap-4">
        <h1 className="text-3xl font-black tracking-widest">{t('ledger.title')}</h1>
        
        {/* Filters Panel */}
        <div className="bg-[var(--muted-bg)] p-4 border-2 border-[var(--border-brutal)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold tracking-widest">{t('ledger.filter_type')}</label>
            <select 
              value={typeFilter} 
              onChange={e => handleFilterChange({ type: e.target.value })}
              className="w-full border-2 border-[var(--border-brutal)] px-3 py-2 font-bold focus:outline-none bg-[var(--card-bg)] text-[var(--text-base)]"
            >
              <option value="all">{t('ledger.filter_all')}</option>
              <option value="income">{t('ledger.filter_income')}</option>
              <option value="expense">{t('ledger.filter_expense')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold tracking-widest">{t('ledger.filter_category')}</label>
            <select 
              value={categoryFilter} 
              onChange={e => handleFilterChange({ category: e.target.value })}
              className="w-full border-2 border-[var(--border-brutal)] px-3 py-2 font-bold focus:outline-none bg-[var(--card-bg)] text-[var(--text-base)] max-w-full truncate"
            >
              <option value="all">{t('ledger.filter_category_all')}</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1 min-w-0">
            <label className="text-xs font-bold tracking-widest">{t('ledger.date_from')}</label>
            <input 
              type="date"
              value={dateFrom}
              onChange={e => handleFilterChange({ from: e.target.value })}
              className="w-full min-w-0 appearance-none border-2 border-[var(--border-brutal)] px-3 py-2 font-bold focus:outline-none bg-[var(--card-bg)] text-[var(--text-base)]"
            />
          </div>
          <div className="space-y-1 min-w-0">
             <label className="text-xs font-bold tracking-widest">{t('ledger.date_to')}</label>
             <input 
               type="date"
               value={dateTo}
               onChange={e => handleFilterChange({ to: e.target.value })}
               className="w-full min-w-0 appearance-none border-2 border-[var(--border-brutal)] px-3 py-2 font-bold focus:outline-none bg-[var(--card-bg)] text-[var(--text-base)]"
             />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-xl font-bold animate-pulse">{t('ledger.loading')}</div>
      ) : (
        <div className="relative">
          {/* Transition overlay */}
          {isPending && <div className="absolute inset-0 bg-[var(--bg-base)]/70 backdrop-blur-[1px] z-10 flex items-center justify-center font-black text-xl animate-pulse text-[var(--text-base)]">{t('ledger.filtering')}</div>}
          
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
             <button
                onClick={handleSaftExport}
                className="flex items-center gap-2 border-2 border-[var(--border-brutal)] bg-[var(--card-bg)] px-4 py-2 font-bold text-[var(--text-base)] hover:bg-[var(--muted-bg)] active:scale-95 transition-all text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(24,24,27,1)] active:shadow-none"
             >
                <FontAwesomeIcon icon={faFileExport} />
                {t('ledger.export_saft')}
             </button>
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-zinc-500">{t('ledger.sort_by')}</span>
                <select 
                  value={sortBy}
                  onChange={e => handleFilterChange({ sortBy: e.target.value })}
                  className="border-2 border-[var(--border-brutal)] px-3 py-1 font-bold focus:outline-none bg-[var(--card-bg)] text-[var(--text-base)] text-sm"
                >
                  <option value="date_desc">{t('ledger.sort_date_desc')}</option>
                  <option value="date_asc">{t('ledger.sort_date_asc')}</option>
                  <option value="amount_desc">{t('ledger.sort_amount_desc')}</option>
                  <option value="amount_asc">{t('ledger.sort_amount_asc')}</option>
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-6">
            {Object.entries(groupedData).map(([month, txs]) => (
              <div key={month} className="flex flex-col gap-3">
                <button
                  onClick={() => toggleMonth(month)}
                  className="bg-[var(--text-base)] text-[var(--bg-base)] px-4 py-3 font-black text-xl tracking-widest text-left flex justify-between items-center active:scale-95 transition-transform border-4 border-[var(--border-brutal)] group"
                >
                  <span>{month}</span>
                  <FontAwesomeIcon icon={expandedMonths[month] ? faChevronDown : faChevronRight} className="group-active:scale-90" />
                </button>
                
                {expandedMonths[month] && (
                  <div className="flex flex-col gap-4 pl-3 border-l-4 border-[var(--border-brutal)] ml-1.5 transition-all">
                    {txs.map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="w-full text-left active:scale-[0.98] transition-transform duration-100 ease-in-out focus:outline-none block"
                      >
                        <div className="border-2 border-[var(--border-brutal)] bg-[var(--card-bg)] p-4 flex justify-between items-center hover:bg-[var(--muted-bg)] transition-colors">
                          <div className="flex flex-col gap-1 w-full overflow-hidden mr-4">
                            <span className="font-bold truncate text-[15px]">{tx.description || t('ledger.no_description')}</span>
                            <span className="text-sm tracking-widest text-zinc-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                               {new Date(tx.date).toLocaleDateString('no-NO')} • {tx.category}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`font-mono font-black text-lg whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-[var(--text-base)]'}`}>
                              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('no-NO')} kr
                            </span>
                            {tx.vatAmount > 0 && (
                              <span className="text-[10px] text-zinc-500 font-bold font-mono">
                                {t('ledger.inc_vat')} {tx.vatAmount.toLocaleString('no-NO')}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredData.length === 0 && (
              <div className="p-8 text-center border-4 border-[var(--border-brutal)] border-dashed font-black tracking-widest text-xl text-zinc-400">
                {t('ledger.no_transactions')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pop-up Bottom Sheet for editing transaction */}
      <LedgerEditSheet transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}
