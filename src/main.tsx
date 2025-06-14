import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <div style={{ background: 'yellow', color: 'black', fontSize: '30px', padding: '20px' }}>
      APP RENDERED
    </div>
  </StrictMode>
);
