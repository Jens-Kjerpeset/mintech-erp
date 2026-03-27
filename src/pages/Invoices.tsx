import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { InvoiceBuilder } from '@/features/invoices/InvoiceBuilder';
import { InvoiceList } from '@/features/invoices/InvoiceList';

import type { Invoice } from '@/types/schema';

export function Invoices() {
 const [searchParams, setSearchParams] = useSearchParams();
 const isOpenFromUrl = searchParams.get('action') === 'new';
 const [isLocalOpen, setIsLocalOpen] = useState(false);
 const isOpen = isOpenFromUrl || isLocalOpen;

 const location = useLocation();
 const navigate = useNavigate();

 const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();

 const handleOpenChange = (open: boolean) => {
 if (!open) {
 setIsLocalOpen(false);
 if (isOpenFromUrl) {
 searchParams.delete('action');
 setSearchParams(searchParams, { replace: true, state: location.state });
 }
 setEditingInvoice(undefined);
 if (location.state?.returnToDashboard) {
 navigate('/', { replace: true });
 }
 } else {
 setIsLocalOpen(true);
 }
 };

 const openForEdit = (invoice: Invoice) => {
 setEditingInvoice(invoice);
 setIsLocalOpen(true);
 };

 return (
 <>
 <div className="space-y-6 pb-20 md:pb-6 ">
 <header className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-heading font-medium tracking-tight">Fakturaer</h1>
 <p className="text-muted-foreground">Opprett og spor fakturaer til kunder.</p>
 </div>
 </header>
 
 <InvoiceBuilder open={isOpen} onOpenChange={handleOpenChange} invoice={editingInvoice} />
 <InvoiceList onEdit={openForEdit} />
 </div>

 <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 ">
 <button onClick={() => setIsLocalOpen(true)} className="focus:outline-none flex items-center justify-center rounded-full h-14 w-14 shadow-sm hover:shadow-sm cursor-pointer bg-primary text-primary-foreground" aria-label="Ny faktura">
 <FontAwesomeIcon icon={faPlus} className="size-6" />
 </button>
 </div>
 </>
 );
}
