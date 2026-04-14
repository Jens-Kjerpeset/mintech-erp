import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import './index.css';

const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const InvoiceList = lazy(() => import('./features/invoices/InvoiceList').then(m => ({ default: m.InvoiceList })));
const InvoiceForm = lazy(() => import('./features/invoices/InvoiceForm').then(m => ({ default: m.InvoiceForm })));
const InventoryList = lazy(() => import('./features/inventory/InventoryList').then(m => ({ default: m.InventoryList })));
const SettingsForm = lazy(() => import('./features/settings/SettingsForm').then(m => ({ default: m.SettingsForm })));
const ContactList = lazy(() => import('./features/contacts/ContactList').then(m => ({ default: m.ContactList })));
const LedgerList = lazy(() => import('./features/ledger/LedgerList').then(m => ({ default: m.LedgerList })));
const ZReportList = lazy(() => import('./features/zreports/ZReportList').then(m => ({ default: m.ZReportList })));

const queryClient = new QueryClient();

const Fallback = () => (
  <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 24, height: 24, border: '2px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
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
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
