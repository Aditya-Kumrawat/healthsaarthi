import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <div style={{ background: 'yellow', color: 'black', fontSize: '30px', padding: '20px' }}>
        APP + ROUTER WORKS
      </div>
    </BrowserRouter>
  </StrictMode>
);
