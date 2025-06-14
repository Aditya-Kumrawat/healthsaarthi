import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserDataProvider } from '@/context/UserDataContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
const queryClient = new QueryClient();

root.render(
  <StrictMode>
    <UserDataProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </UserDataProvider>
  </StrictMode>
);
