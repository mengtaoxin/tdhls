import { createFileRoute, useLocation } from '@tanstack/react-router';

import { WatchPage } from '@/components/WatchPage';

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** URL the user entered; shown on the watch page and kept out of the address bar. */
    streamUrl?: string;
    /** URL after the settings URL function; the one actually played. */
    playbackUrl?: string;
  }
}

export const Route = createFileRoute('/watch')({
  component: WatchRoute,
});

function WatchRoute() {
  const streamUrl = useLocation({ select: (location) => location.state.streamUrl });
  const playbackUrl = useLocation({ select: (location) => location.state.playbackUrl });
  return (
    <WatchPage
      url={typeof streamUrl === 'string' ? streamUrl : ''}
      playbackUrl={typeof playbackUrl === 'string' ? playbackUrl : undefined}
    />
  );
}
