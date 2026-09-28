import { createFileRoute, useLocation } from '@tanstack/react-router';

import { WatchPage } from '@/components/WatchPage';

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** Kept in history state (not the query) so the stream URL stays out of the address bar. */
    streamUrl?: string;
  }
}

export const Route = createFileRoute('/watch')({
  component: WatchRoute,
});

function WatchRoute() {
  const streamUrl = useLocation({ select: (location) => location.state.streamUrl });
  return <WatchPage url={typeof streamUrl === 'string' ? streamUrl : ''} />;
}
