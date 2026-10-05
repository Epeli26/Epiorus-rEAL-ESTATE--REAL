import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AdminPanel} from './AdminPanel.tsx';
import './index.css';

const isAdminRoute = window.location.pathname.replace(/\/$/, '').split('/').pop() === 'admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <AdminPanel /> : <App />}
  </StrictMode>,
);
