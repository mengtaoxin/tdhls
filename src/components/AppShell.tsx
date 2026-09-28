import { Outlet } from '@tanstack/react-router';

import { AppHeader } from '@/components/AppHeader';
import '@/styles/app.css';

export function AppShell() {
  return (
    <div className="tdhls-app">
      <AppHeader />
      <main className="main-scroller" data-testid="main-scroller">
        <Outlet />
      </main>
    </div>
  );
}
