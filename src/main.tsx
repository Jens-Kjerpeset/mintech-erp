import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { InvoiceList } from './features/invoices/InvoiceList';
import { InvoiceForm } from './features/invoices/InvoiceForm';
import { InventoryList } from './features/inventory/InventoryList';
import { SettingsForm } from './features/settings/SettingsForm';
import { ContactList } from './features/contacts/ContactList';
import { LedgerList } from './features/ledger/LedgerList';
import { ZReportList } from './features/zreports/ZReportList';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/contacts" element={<ContactList />} />
            <Route path="/zreports" element={<ZReportList />} />
            <Route path="/hovedbok" element={<LedgerList />} />
            <Route path="/settings" element={<SettingsForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
