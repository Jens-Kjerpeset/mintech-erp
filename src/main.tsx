import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.ts'

import { api } from '@/lib/api'

import { ThemeProvider } from './providers/ThemeProvider.tsx'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary.tsx'

api.seedDataIfNeeded().then(() => {
 createRoot(document.getElementById('root')!).render(
 <StrictMode>
 <GlobalErrorBoundary>
 <ThemeProvider defaultTheme="default" storageKey="mintech-theme">
 <QueryClientProvider client={queryClient}>
 <App />
 </QueryClientProvider>
 </ThemeProvider>
 </GlobalErrorBoundary>
 </StrictMode>,
 )
});
