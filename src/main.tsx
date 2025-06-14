import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserDataProvider } from '@/context/UserDataContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
const queryClient = new QueryClient();

// Test component to verify all providers work
const TestComponent = () => (
  <div style={{ background: 'yellow', color: 'black', fontSize: '30px', padding: '20px' }}>
    ALL PROVIDERS WORK
  </div>
);

root.render(
  <StrictMode>
    <UserDataProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <TestComponent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </UserDataProvider>
  </StrictMode>
);
