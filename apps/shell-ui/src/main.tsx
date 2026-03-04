import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, defaultThemeSet } from '@loop-kit/ui/theme';

import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={defaultThemeSet}>
            <App />
        </ThemeProvider>
    </StrictMode>,
);
