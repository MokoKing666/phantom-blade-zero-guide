import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { BASENAME } from './lib/base';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root 容器不存在');

hydrateRoot(
  container,
  <StrictMode>
    <BrowserRouter basename={BASENAME}>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
);
